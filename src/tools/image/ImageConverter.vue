<template>
  <div class="image-converter">
    <div class="converter-container">
      <div class="converter-header">
        <h3>图片格式转换</h3>
        <p class="converter-description">
          将图片转换为JPG、PNG、WebP等不同格式，支持批量处理
        </p>
      </div>
      
      <div class="upload-section">
        <el-upload
          class="image-uploader"
          drag
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="10"
          :on-exceed="handleExceed"
          :on-remove="handleRemove"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            拖放图片至此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持JPG、PNG、GIF、WebP和BMP格式，单个文件不超过10MB，最多10个文件
            </div>
          </template>
        </el-upload>
      </div>
      
      <!-- 显示原始图片预览 -->
      <div class="preview-section" v-if="fileList.length > 0">
        <el-divider content-position="left">原图预览</el-divider>
        <div class="preview-gallery">
          <div v-for="(file, index) in fileList" :key="file.uid" class="preview-item">
            <el-image
              :src="previewUrls[index] || ''"
              fit="contain"
              :preview-src-list="previewUrls"
              preview-teleported
            />
            <div class="preview-info">{{ file.name }}</div>
          </div>
        </div>
      </div>
      
      <div class="conversion-options" v-if="fileList.length > 0">
        <el-divider content-position="left">转换选项</el-divider>
        
        <el-form label-position="top" :model="conversionOptions" class="options-form">
          <el-form-item label="目标格式">
            <el-radio-group v-model="conversionOptions.targetFormat" @change="autoConvertImages">
              <el-radio-button label="jpeg">JPG</el-radio-button>
              <el-radio-button label="png">PNG</el-radio-button>
              <el-radio-button label="webp">WebP</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="质量设置" v-if="conversionOptions.targetFormat !== 'png'">
            <div class="quality-slider">
              <el-slider 
                v-model="conversionOptions.quality" 
                :min="10" 
                :max="100" 
                :step="5"
                show-stops
                @change="autoConvertImages"
              />
              <div class="quality-value">{{ conversionOptions.quality }}%</div>
            </div>
            <div class="quality-description">
              <span>低质量，小文件</span>
              <span>高质量，大文件</span>
            </div>
          </el-form-item>
          
          <el-form-item label="保持文件名" v-if="fileList.length > 0">
            <el-switch v-model="conversionOptions.keepFilename" @change="autoConvertImages" />
            <span class="option-hint">{{ conversionOptions.keepFilename ? '使用原文件名' : '生成随机文件名' }}</span>
          </el-form-item>
          
          <el-form-item label="自动转换">
            <el-switch v-model="autoConvert" />
            <span class="option-hint">{{ autoConvert ? '更改选项后自动转换' : '手动点击按钮转换' }}</span>
          </el-form-item>
          
          <el-button type="primary" @click="convertImages" :loading="processing" :disabled="!canConvert" v-if="!autoConvert">
            <el-icon><RefreshRight /></el-icon> 开始转换
          </el-button>
        </el-form>
      </div>
      
      <div class="conversion-results" v-if="convertedImages.length > 0">
        <el-divider content-position="left">转换结果</el-divider>
        
        <div class="batch-actions">
          <el-button @click="downloadAllImages" type="success" :disabled="processing">
            <el-icon><Download /></el-icon> 下载全部图片
          </el-button>
          <el-button @click="clearResults" type="info" :disabled="processing">
            <el-icon><Delete /></el-icon> 清除结果
          </el-button>
        </div>
        
        <el-table :data="convertedImages" style="width: 100%">
          <el-table-column label="预览" width="100">
            <template #default="scope">
              <div class="image-preview">
                <el-image 
                  :src="scope.row.url" 
                  fit="contain"
                  :preview-src-list="[scope.row.url]"
                  preview-teleported
                />
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="filename" label="文件名">
            <template #default="scope">
              <div class="filename-info">
                <div>{{ scope.row.filename }}</div>
                <div class="file-info">
                  {{ scope.row.size }} | {{ scope.row.dimensions }}
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button 
                @click="downloadImage(scope.row)" 
                type="primary" 
                size="small" 
                circle
                title="下载"
              >
                <el-icon><Download /></el-icon>
              </el-button>
              <el-button 
                @click="copyImageToClipboard(scope.row)" 
                type="info" 
                size="small" 
                circle
                title="复制图片"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <el-button 
                @click="removeResult(scope.$index)" 
                type="danger" 
                size="small" 
                circle
                title="删除"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="format-tips">
        <el-collapse>
          <el-collapse-item title="格式选择提示" name="format-tips">
            <div class="tips-content">
              <h4>如何选择合适的图片格式？</h4>
              
              <div class="format-card">
                <h5>JPEG/JPG</h5>
                <p><strong>适用场景：</strong>照片、复杂的图像、有大量色彩渐变的图像</p>
                <p><strong>优点：</strong>文件体积小，适合网页加载</p>
                <p><strong>缺点：</strong>有损压缩，不支持透明背景</p>
              </div>
              
              <div class="format-card">
                <h5>PNG</h5>
                <p><strong>适用场景：</strong>需要透明背景、清晰线条、图标、截图</p>
                <p><strong>优点：</strong>无损压缩，支持透明通道，保持高质量</p>
                <p><strong>缺点：</strong>文件体积通常较大</p>
              </div>
              
              <div class="format-card">
                <h5>WebP</h5>
                <p><strong>适用场景：</strong>网页图像、移动应用</p>
                <p><strong>优点：</strong>比JPG和PNG体积更小，同时支持透明度</p>
                <p><strong>缺点：</strong>某些旧版浏览器可能不支持</p>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CopyDocument, Delete, Download, RefreshRight, Upload } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref, watch } from 'vue';

// 文件列表
const fileList = ref([]);
// 处理中标志
const processing = ref(false);
// 转换后的图片
const convertedImages = ref([]);
// 预览URLs
const previewUrls = ref([]);
// 自动转换开关
const autoConvert = ref(true);

// 转换选项
const conversionOptions = ref({
  targetFormat: 'jpeg',
  quality: 85,
  keepFilename: true
});

// 判断是否可以转换
const canConvert = computed(() => {
  return fileList.value.length > 0 && !processing.value;
});

// 文件变更处理
const handleFileChange = (file) => {
  // 验证文件类型
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  if (!acceptedTypes.includes(file.raw.type)) {
    ElMessage.error('不支持的文件类型，请上传JPG、PNG、GIF、WebP或BMP格式的图片');
    // 移除无效文件
    const index = fileList.value.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
    return;
  }
  
  // 验证文件大小
  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB');
    // 移除过大文件
    const index = fileList.value.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
    return;
  }
  
  // 创建预览URL
  createPreview(file);
  
  // 如果启用自动转换，则上传后立即转换
  if (autoConvert.value && fileList.value.length > 0) {
    convertImages();
  }
};

// 创建预览URL
const createPreview = (file) => {
  const url = URL.createObjectURL(file.raw);
  // 找到文件在列表中的索引
  const index = fileList.value.findIndex(item => item.uid === file.uid);
  if (index !== -1) {
    // 更新预览URL数组
    if (previewUrls.value.length <= index) {
      previewUrls.value = [...previewUrls.value, ...Array(index - previewUrls.value.length + 1).fill('')];
    }
    previewUrls.value[index] = url;
  } else {
    previewUrls.value.push(url);
  }
};

// 当文件列表变化时，同步预览URLs
watch(fileList, (newList, oldList) => {
  // 如果移除了文件，也要移除对应的预览URL
  if (newList.length < oldList.length) {
    const removedFile = oldList.find(file => !newList.some(f => f.uid === file.uid));
    if (removedFile) {
      const index = oldList.findIndex(file => file.uid === removedFile.uid);
      if (index > -1) {
        // 释放URL
        if (previewUrls.value[index]) {
          URL.revokeObjectURL(previewUrls.value[index]);
        }
        // 移除URL
        previewUrls.value.splice(index, 1);
      }
    }
  }
  
  // 如果文件列表为空，清空所有预览
  if (newList.length === 0) {
    previewUrls.value.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    previewUrls.value = [];
  }
}, { deep: true });

// 超出文件数量限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传10个文件');
};

// 移除文件
const handleRemove = (file) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid);
  if (index !== -1) {
    // 释放预览URL
    if (previewUrls.value[index]) {
      URL.revokeObjectURL(previewUrls.value[index]);
    }
    fileList.value.splice(index, 1);
    previewUrls.value.splice(index, 1);
  }
};

// 自动转换图片（当选项改变时）
const autoConvertImages = () => {
  if (autoConvert.value && fileList.value.length > 0) {
    convertImages();
  }
};

// 转换图片
const convertImages = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传图片');
    return;
  }
  
  processing.value = true;
  const convertedList = [];
  
  try {
    // 转换图片格式
    for (const file of fileList.value) {
      const imageFile = file.raw;
      const originalFilename = imageFile.name;
      const filenameParts = originalFilename.split('.');
      const extension = conversionOptions.value.targetFormat === 'jpeg' ? 'jpg' : conversionOptions.value.targetFormat;
      
      // 生成新文件名
      let newFilename;
      if (conversionOptions.value.keepFilename) {
        // 保留原文件名，但修改扩展名
        filenameParts.pop(); // 移除原扩展名
        newFilename = `${filenameParts.join('.')}.${extension}`;
      } else {
        // 生成随机文件名
        newFilename = `converted_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
      }
      
      // 加载图片
      const img = document.createElement('img');
      const imageUrl = URL.createObjectURL(imageFile);
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imageUrl;
      });
      
      // 创建画布
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制图片
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // 设置转换参数
      const mimeType = `image/${conversionOptions.value.targetFormat}`;
      const quality = conversionOptions.value.targetFormat !== 'png' ? conversionOptions.value.quality / 100 : undefined;
      
      // 转换图片
      const dataUrl = canvas.toDataURL(mimeType, quality);
      
      // 计算文件大小
      const base64Data = dataUrl.split(',')[1];
      const decodedData = atob(base64Data);
      const sizeInBytes = decodedData.length;
      const formattedSize = formatFileSize(sizeInBytes);
      
      // 释放原图片URL
      URL.revokeObjectURL(imageUrl);
      
      // 添加到结果列表
      convertedList.push({
        url: dataUrl,
        filename: newFilename,
        size: formattedSize,
        dimensions: `${img.width}x${img.height}`,
        blob: dataURLToBlob(dataUrl)
      });
    }
    
    // 更新转换结果
    convertedImages.value = convertedList;
    
    ElMessage.success(`成功转换 ${convertedList.length} 张图片`);
  } catch (error) {
    console.error('图片转换出错:', error);
    ElMessage.error('图片转换过程中发生错误，请重试');
  } finally {
    processing.value = false;
  }
};

// DataURL转换为Blob
const dataURLToBlob = (dataURL) => {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
};

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
};

// 下载单个图片
const downloadImage = (image) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(image.blob);
  link.download = image.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 释放URL
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 100);
};

// 下载所有图片
const downloadAllImages = () => {
  if (convertedImages.value.length === 0) return;
  
  if (convertedImages.value.length === 1) {
    // 只有一张图片，直接下载
    downloadImage(convertedImages.value[0]);
    return;
  }
  
  // 多张图片，提示用户
  ElMessageBox.confirm(
    '将会一次性下载所有图片，是否继续？',
    '批量下载',
    {
      confirmButtonText: '继续下载',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      // 逐个下载图片，添加延迟防止浏览器阻止多次下载
      convertedImages.value.forEach((image, index) => {
        setTimeout(() => {
          downloadImage(image);
        }, index * 200);
      });
    })
    .catch(() => {
      // 用户取消下载
    });
};

// 复制图片到剪贴板
const copyImageToClipboard = async (image) => {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [image.blob.type]: image.blob
      })
    ]);
    ElMessage.success('图片已复制到剪贴板');
  } catch (error) {
    console.error('复制图片失败:', error);
    ElMessage.error('复制图片失败，可能是浏览器不支持此功能');
  }
};

// 删除结果
const removeResult = (index) => {
  convertedImages.value.splice(index, 1);
};

// 清空结果
const clearResults = () => {
  ElMessageBox.confirm(
    '确定要清空所有转换结果吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      convertedImages.value = [];
      ElMessage.success('已清空转换结果');
    })
    .catch(() => {
      // 用户取消操作
    });
};
</script>

<style lang="scss" scoped>
.image-converter {
  .converter-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .converter-header {
      margin-bottom: 20px;
      
      h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: var(--text-color, #333);
      }
      
      .converter-description {
        color: var(--text-color-light, #666);
        margin: 0;
      }
    }
    
    .upload-section {
      margin-bottom: 20px;
      
      .image-uploader {
        width: 100%;
      }
    }
    
    /* 添加原图预览样式 */
    .preview-section {
      margin-bottom: 20px;
      
      .preview-gallery {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-top: 15px;
        
        .preview-item {
          width: 150px;
          
          .el-image {
            width: 150px;
            height: 150px;
            border-radius: 4px;
            background-color: var(--secondary-background, #f9f9f9);
            border: 1px solid var(--border-color, #eee);
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }
          
          .preview-info {
            margin-top: 5px;
            font-size: 0.85rem;
            color: var(--text-color-light, #666);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
    
    .conversion-options {
      margin-bottom: 20px;
      
      .options-form {
        max-width: 600px;
      }
      
      .quality-slider {
        display: flex;
        align-items: center;
        
        .el-slider {
          flex: 1;
          margin-right: 15px;
        }
        
        .quality-value {
          width: 50px;
          text-align: center;
          font-weight: bold;
          color: var(--primary-color, #42B983);
        }
      }
      
      .quality-description {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-size: 0.85rem;
        color: var(--text-color-light, #666);
      }
      
      .option-hint {
        margin-left: 10px;
        font-size: 0.9rem;
        color: var(--text-color-light, #666);
      }
    }
    
    .conversion-results {
      margin-bottom: 20px;
      
      .batch-actions {
        margin-bottom: 15px;
        display: flex;
        gap: 10px;
      }
      
      .image-preview {
        width: 60px;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--secondary-background, #f9f9f9);
        border-radius: 4px;
        overflow: hidden;
        
        .el-image {
          max-width: 100%;
          max-height: 100%;
        }
      }
      
      .filename-info {
        .file-info {
          font-size: 0.85rem;
          color: var(--text-color-light, #666);
          margin-top: 3px;
        }
      }
    }
    
    .format-tips {
      .tips-content {
        h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: var(--text-color, #333);
        }
        
        .format-card {
          margin-bottom: 15px;
          padding: 12px;
          border: 1px solid var(--border-color, #eee);
          border-radius: 6px;
          
          h5 {
            margin-top: 0;
            margin-bottom: 10px;
            color: var(--primary-color, #42B983);
          }
          
          p {
            margin: 5px 0;
            
            strong {
              color: var(--text-color, #333);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .image-converter {
    .converter-container {
      padding: 15px;
      
      .preview-section {
        .preview-gallery {
          justify-content: center;
          
          .preview-item {
            width: 120px;
            
            .el-image {
              width: 120px;
              height: 120px;
            }
          }
        }
      }
      
      .conversion-options {
        .quality-slider {
          flex-direction: column;
          align-items: stretch;
          
          .el-slider {
            margin-right: 0;
            margin-bottom: 10px;
          }
        }
      }
      
      .conversion-results {
        .batch-actions {
          flex-direction: column;
        }
      }
    }
  }
}
</style> 