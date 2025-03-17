<template>
  <div class="image-compressor">
    <div class="compressor-container">
      <div class="compressor-header">
        <h3>图片压缩</h3>
        <p class="compressor-description">
          压缩图片文件大小，保持良好的视觉质量，支持多种图片格式
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
          :limit="5"
          :on-exceed="handleExceed"
          :on-remove="handleRemove"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            拖放图片至此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持JPG、PNG、WebP格式，单个文件不超过20MB，最多5个文件
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
            <div class="preview-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="compression-options" v-if="fileList.length > 0">
        <el-divider content-position="left">压缩选项</el-divider>
        
        <el-form label-position="top" :model="compressionOptions" class="options-form">
          <el-form-item label="压缩程度">
            <el-radio-group v-model="compressionOptions.level" @change="autoCompressImages">
              <el-radio :label="0">轻度压缩</el-radio>
              <el-radio :label="1">中度压缩</el-radio>
              <el-radio :label="2">高度压缩</el-radio>
              <el-radio :label="3">极限压缩</el-radio>
            </el-radio-group>
            <div class="compression-level-description">
              {{ getLevelDescription }}
            </div>
          </el-form-item>
          
          <el-form-item label="自定义压缩选项" v-if="compressionOptions.level === 3">
            <div class="custom-compression">
              <div class="option-row">
                <div class="option-label">质量 (0-1):</div>
                <el-slider 
                  v-model="compressionOptions.quality" 
                  :min="0.1" 
                  :max="1" 
                  :step="0.05"
                  :format-tooltip="(val) => `${Math.round(val * 100)}%`"
                  @change="autoCompressImages"
                />
              </div>
              
              <div class="option-row">
                <div class="option-label">最大宽度:</div>
                <el-input-number 
                  v-model="compressionOptions.maxWidth" 
                  :min="0" 
                  :step="100"
                  controls-position="right"
                  @change="autoCompressImages"
                />
                <div class="option-hint">设置为0表示不限制</div>
              </div>
              
              <div class="option-row">
                <div class="option-label">最大高度:</div>
                <el-input-number 
                  v-model="compressionOptions.maxHeight" 
                  :min="0" 
                  :step="100"
                  controls-position="right"
                  @change="autoCompressImages"
                />
                <div class="option-hint">设置为0表示不限制</div>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item label="保持原文件类型">
            <el-switch v-model="compressionOptions.keepFormat" @change="autoCompressImages" />
            <span class="option-hint">{{ compressionOptions.keepFormat ? '保留原文件格式' : '统一转换为JPEG格式' }}</span>
          </el-form-item>
          
          <el-form-item label="自动压缩">
            <el-switch v-model="autoCompress" />
            <span class="option-hint">{{ autoCompress ? '更改选项后自动压缩' : '手动点击按钮压缩' }}</span>
          </el-form-item>
          
          <el-button type="primary" @click="compressImages" :loading="processing" :disabled="!canProcess" v-if="!autoCompress">
            <el-icon><Delete /></el-icon> 开始压缩
          </el-button>
        </el-form>
      </div>
      
      <div class="compression-results" v-if="compressedImages.length > 0">
        <el-divider content-position="left">压缩结果</el-divider>
        
        <div class="batch-actions">
          <el-button @click="downloadAllImages" type="success" :disabled="processing">
            <el-icon><Download /></el-icon> 下载全部图片
          </el-button>
          <el-button @click="clearResults" type="info" :disabled="processing">
            <el-icon><Delete /></el-icon> 清除结果
          </el-button>
        </div>
        
        <el-card v-for="(image, index) in compressedImages" :key="index" class="result-card">
          <div class="comparison-container">
            <div class="image-item original">
              <div class="image-container">
                <el-image 
                  :src="image.originalUrl" 
                  fit="contain"
                  :preview-src-list="[image.originalUrl]"
                  preview-teleported
                />
              </div>
              <div class="image-details">
                <div class="image-title">原始图片</div>
                <div class="image-stats">
                  <div>尺寸: {{ image.originalDimensions }}</div>
                  <div>大小: {{ image.originalSize }}</div>
                </div>
              </div>
            </div>
            
            <div class="comparison-arrow">
              <el-icon><Right /></el-icon>
            </div>
            
            <div class="image-item compressed">
              <div class="image-container">
                <el-image 
                  :src="image.compressedUrl" 
                  fit="contain"
                  :preview-src-list="[image.compressedUrl]"
                  preview-teleported
                />
              </div>
              <div class="image-details">
                <div class="image-title">压缩后</div>
                <div class="image-stats">
                  <div>尺寸: {{ image.compressedDimensions }}</div>
                  <div>大小: {{ image.compressedSize }}</div>
                  <div class="saving">
                    节省: {{ image.savingPercentage }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="result-actions">
            <el-button 
              @click="downloadImage(image)" 
              type="primary" 
              size="small"
              :icon="Download"
            >
              下载压缩图片
            </el-button>
            <el-button 
              @click="removeResult(index)" 
              type="danger" 
              size="small"
              :icon="Delete"
            >
              删除
            </el-button>
          </div>
        </el-card>
      </div>
      
      <div class="compression-tips">
        <el-collapse>
          <el-collapse-item title="压缩技巧和建议" name="compression-tips">
            <div class="tips-content">
              <h4>图片压缩注意事项</h4>
              
              <ul>
                <li>
                  <strong>选择合适的压缩级别：</strong>
                  对于照片类图片，中度压缩通常能在文件大小和质量间取得良好平衡；对于简单图形或图表，可以使用高度压缩。
                </li>
                <li>
                  <strong>图片用途决定压缩选择：</strong>
                  用于网站或社交媒体分享的图片可以使用较高压缩比；需要打印的图片应保持较高质量。
                </li>
                <li>
                  <strong>不同格式压缩效果：</strong>
                  JPEG适合照片压缩；PNG适合图标和透明图像，但压缩效果有限；WebP提供更好的压缩比但兼容性可能较差。
                </li>
                <li>
                  <strong>调整图片尺寸：</strong>
                  如果原图尺寸很大但实际显示尺寸小，设置最大宽高可以显著减小文件体积。
                </li>
                <li>
                  <strong>多次压缩的影响：</strong>
                  避免对已压缩的JPEG图片进行多次压缩，这会导致质量明显下降（称为"代际损失"）。
                </li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, Download, Right, Upload } from '@element-plus/icons-vue';
import imageCompression from 'browser-image-compression';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref, watch } from 'vue';

// 文件列表
const fileList = ref([]);
// 处理中标志
const processing = ref(false);
// 压缩后的图片
const compressedImages = ref([]);
// 预览URLs
const previewUrls = ref([]);
// 自动压缩开关
const autoCompress = ref(true);

// 压缩选项
const compressionOptions = ref({
  level: 1, // 0=轻度，1=中度，2=高度，3=自定义
  quality: 0.6,
  maxWidth: 1600,
  maxHeight: 1600,
  keepFormat: true,
});

// 压缩级别描述
const getLevelDescription = computed(() => {
  switch (compressionOptions.value.level) {
    case 0:
      return "轻度压缩，质量很高，体积减小20-30%";
    case 1:
      return "中度压缩，质量良好，体积减小40-60%";
    case 2:
      return "高度压缩，质量一般，体积减小60-80%";
    case 3:
      return "自定义压缩参数，根据需求调整";
    default:
      return "";
  }
});

// 判断是否可以处理
const canProcess = computed(() => {
  return fileList.value.length > 0 && !processing.value;
});

// 文件变更处理
const handleFileChange = (file) => {
  // 验证文件类型
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!acceptedTypes.includes(file.raw.type)) {
    ElMessage.error('不支持的文件类型，请上传JPG、PNG或WebP格式的图片');
    // 移除无效文件
    const index = fileList.value.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
    return false;
  }
  
  // 验证文件大小
  if (file.raw.size > 20 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过20MB');
    // 移除过大文件
    const index = fileList.value.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
    return false;
  }
  
  // 创建预览URL
  createPreview(file);
  
  // 如果启用自动压缩，则上传后立即压缩
  if (autoCompress.value && fileList.value.length > 0) {
    compressImages();
  }
  
  return true;
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
  ElMessage.warning('最多只能上传5个文件');
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

// 自动压缩图片（当选项改变时）
const autoCompressImages = () => {
  if (autoCompress.value && fileList.value.length > 0) {
    compressImages();
  }
};

// 获取压缩选项
const getCompressionOptions = () => {
  // 根据压缩级别返回配置
  switch (compressionOptions.value.level) {
    case 0: // 轻度
      return {
        maxSizeMB: 5,
        maxWidthOrHeight: 4000,
        useWebWorker: true,
        quality: 0.8
      };
    case 1: // 中度
      return {
        maxSizeMB: 2,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        quality: 0.7
      };
    case 2: // 高度
      return {
        maxSizeMB: 1,
        maxWidthOrHeight: 1500,
        useWebWorker: true,
        quality: 0.5
      };
    case 3: // 自定义
      return {
        maxSizeMB: 10,
        maxWidthOrHeight: compressionOptions.value.maxWidth || compressionOptions.value.maxHeight ? 
          Math.max(compressionOptions.value.maxWidth || 0, compressionOptions.value.maxHeight || 0) : 
          undefined,
        useWebWorker: true,
        quality: compressionOptions.value.quality
      };
    default:
      return {
        maxSizeMB: 2,
        maxWidthOrHeight: 2000,
        useWebWorker: true
      };
  }
};

// 压缩图片
const compressImages = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传图片');
    return;
  }
  
  processing.value = true;
  const results = [];
  
  try {
    // 获取压缩选项
    const options = getCompressionOptions();
    
    // 处理每个文件
    for (const file of fileList.value) {
      const originalFile = file.raw;
      const originalFileName = originalFile.name;
      
      // 获取图片原始尺寸
      const originalDimensions = await getImageDimensions(originalFile);
      const originalSize = formatFileSize(originalFile.size);
      const originalUrl = URL.createObjectURL(originalFile);
      
      // 设置输出格式
      if (!compressionOptions.value.keepFormat) {
        options.fileType = 'image/jpeg';
      }

      // 压缩图片
      const compressedFile = await imageCompression(originalFile, options);
      
      // 获取压缩后图片信息
      const compressedDimensions = await getImageDimensions(compressedFile);
      const compressedSize = formatFileSize(compressedFile.size);
      const compressedUrl = URL.createObjectURL(compressedFile);
      
      // 计算节省的空间百分比
      const savingBytes = originalFile.size - compressedFile.size;
      const savingPercentage = Math.round((savingBytes / originalFile.size) * 100);
      
      // 获取文件扩展名
      let fileExtension;
      if (compressionOptions.value.keepFormat) {
        fileExtension = originalFileName.split('.').pop();
      } else {
        fileExtension = 'jpg';
      }
      
      // 生成压缩后的文件名
      const compressedFileName = `${originalFileName.split('.')[0]}_compressed.${fileExtension}`;
      
      // 添加到结果列表
      results.push({
        originalUrl,
        originalSize,
        originalDimensions,
        compressedUrl,
        compressedSize,
        compressedDimensions,
        savingPercentage,
        compressedFile,
        compressedFileName
      });
    }
    
    // 更新压缩结果
    compressedImages.value = results;
    
    ElMessage.success(`成功压缩 ${results.length} 张图片`);
  } catch (error) {
    console.error('图片压缩出错:', error);
    ElMessage.error('图片压缩过程中发生错误，请重试');
  } finally {
    processing.value = false;
  }
};

// 获取图片尺寸
const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const dimensions = `${img.width}x${img.height}`;
      URL.revokeObjectURL(url);
      resolve(dimensions);
    };
    
    img.src = url;
  });
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
  link.href = URL.createObjectURL(image.compressedFile);
  link.download = image.compressedFileName;
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
  if (compressedImages.value.length === 0) return;
  
  if (compressedImages.value.length === 1) {
    // 只有一张图片，直接下载
    downloadImage(compressedImages.value[0]);
    return;
  }
  
  // 多张图片，提示用户
  ElMessageBox.confirm(
    '将会一次性下载所有压缩后的图片，是否继续？',
    '批量下载',
    {
      confirmButtonText: '继续下载',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      // 逐个下载图片，添加延迟防止浏览器阻止多次下载
      compressedImages.value.forEach((image, index) => {
        setTimeout(() => {
          downloadImage(image);
        }, index * 200);
      });
    })
    .catch(() => {
      // 用户取消下载
    });
};

// 删除结果
const removeResult = (index) => {
  // 释放URL
  URL.revokeObjectURL(compressedImages.value[index].originalUrl);
  URL.revokeObjectURL(compressedImages.value[index].compressedUrl);
  
  // 删除项目
  compressedImages.value.splice(index, 1);
};

// 清空结果
const clearResults = () => {
  ElMessageBox.confirm(
    '确定要清空所有压缩结果吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 释放所有URL
      compressedImages.value.forEach(image => {
        URL.revokeObjectURL(image.originalUrl);
        URL.revokeObjectURL(image.compressedUrl);
      });
      
      compressedImages.value = [];
      ElMessage.success('已清空压缩结果');
    })
    .catch(() => {
      // 用户取消操作
    });
};
</script>

<style lang="scss" scoped>
.image-compressor {
  .compressor-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .compressor-header {
      margin-bottom: 20px;
      
      h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: var(--text-color, #333);
      }
      
      .compressor-description {
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
            
            .file-name {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .file-size {
              margin-top: 2px;
              opacity: 0.8;
            }
          }
        }
      }
    }
    
    .compression-options {
      margin-bottom: 20px;
      
      .options-form {
        max-width: 600px;
      }
      
      .compression-level-description {
        margin-top: 8px;
        font-size: 0.9rem;
        color: var(--text-color-light, #666);
      }
      
      .custom-compression {
        margin-top: 15px;
        
        .option-row {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          
          .option-label {
            width: 100px;
            flex-shrink: 0;
          }
          
          .el-slider {
            flex: 1;
            margin: 0 15px;
          }
          
          .option-hint {
            font-size: 0.85rem;
            color: var(--text-color-light, #666);
            margin-left: 10px;
          }
        }
      }
      
      .option-hint {
        margin-left: 10px;
        font-size: 0.9rem;
        color: var(--text-color-light, #666);
      }
    }
    
    .compression-results {
      margin-bottom: 20px;
      
      .batch-actions {
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
      }
      
      .result-card {
        margin-bottom: 20px;
        overflow: hidden;
        
        .comparison-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .image-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            
            .image-container {
              width: 100%;
              display: flex;
              justify-content: center;
              height: 200px;
              margin-bottom: 10px;
              
              .el-image {
                max-width: 100%;
                max-height: 100%;
              }
            }
            
            .image-details {
              width: 100%;
              text-align: center;
              
              .image-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: var(--text-color, #333);
              }
              
              .image-stats {
                font-size: 0.9rem;
                color: var(--text-color-light, #666);
                
                .saving {
                  margin-top: 5px;
                  font-weight: bold;
                  color: var(--primary-color, #42B983);
                }
              }
            }
          }
          
          .comparison-arrow {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 20px;
            
            .el-icon {
              font-size: 24px;
              color: var(--text-color-light, #999);
            }
          }
        }
        
        .result-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 15px;
        }
      }
    }
    
    .compression-tips {
      .tips-content {
        h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: var(--text-color, #333);
        }
        
        ul {
          padding-left: 20px;
          margin: 0;
          
          li {
            margin-bottom: 10px;
            
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
  .image-compressor {
    .compressor-container {
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
      
      .compression-options {
        .custom-compression {
          .option-row {
            flex-direction: column;
            align-items: flex-start;
            
            .option-label {
              width: 100%;
              margin-bottom: 5px;
            }
            
            .el-slider {
              width: 100%;
              margin: 0 0 10px 0;
            }
            
            .option-hint {
              margin-left: 0;
              margin-top: 5px;
            }
          }
        }
      }
      
      .compression-results {
        .batch-actions {
          flex-direction: column;
        }
        
        .result-card {
          .comparison-container {
            flex-direction: column;
            
            .image-item {
              width: 100%;
              margin-bottom: 20px;
            }
            
            .comparison-arrow {
              transform: rotate(90deg);
              margin: 10px 0;
            }
          }
        }
      }
    }
  }
}
</style> 