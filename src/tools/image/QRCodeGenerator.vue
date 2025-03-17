<template>
  <div class="qrcode-generator">
    <div class="generator-container">
      <div class="generator-header">
        <h3>二维码生成器</h3>
        <p class="generator-description">
          生成可自定义内容、颜色和大小的二维码图片
        </p>
      </div>
      
      <div class="qrcode-input-section">
        <el-form ref="qrForm" :model="qrOptions" label-position="top">
          <el-form-item label="文本内容" prop="text" :rules="[
            { required: true, message: '请输入需要转换为二维码的内容', trigger: 'blur' }
          ]">
            <el-input
              v-model="qrOptions.text"
              type="textarea"
              :rows="3"
              placeholder="输入需要转换为二维码的文本、网址或其他内容"
              @input="debounceGenerateQR"
            ></el-input>
          </el-form-item>
          
          <div class="option-section">
            <el-divider content-position="left">二维码选项</el-divider>
            
            <div class="option-row">
              <el-form-item label="二维码尺寸">
                <el-slider 
                  v-model="qrOptions.size" 
                  :min="100" 
                  :max="400" 
                  :step="10"
                  show-input
                  @change="generateQRCode"
                ></el-slider>
              </el-form-item>
            </div>
            
            <div class="option-row">
              <el-form-item label="容错级别">
                <el-radio-group v-model="qrOptions.errorCorrectionLevel" @change="generateQRCode">
                  <el-radio-button label="L">低 (7%)</el-radio-button>
                  <el-radio-button label="M">中 (15%)</el-radio-button>
                  <el-radio-button label="Q">高 (25%)</el-radio-button>
                  <el-radio-button label="H">最高 (30%)</el-radio-button>
                </el-radio-group>
                <div class="option-description">
                  容错级别越高，二维码可以在部分损坏的情况下仍然被扫描识别
                </div>
              </el-form-item>
            </div>
            
            <div class="option-row colors">
              <el-form-item label="前景色">
                <el-color-picker
                  v-model="qrOptions.foreground"
                  show-alpha
                  @change="generateQRCode"
                ></el-color-picker>
              </el-form-item>
              
              <el-form-item label="背景色">
                <el-color-picker
                  v-model="qrOptions.background"
                  show-alpha
                  @change="generateQRCode"
                ></el-color-picker>
              </el-form-item>
            </div>
            
            <div class="option-row">
              <el-form-item label="二维码样式">
                <el-select v-model="qrOptions.qrStyle" @change="generateQRCode">
                  <el-option label="方块" value="squares"></el-option>
                  <el-option label="圆点" value="dots"></el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
      
      <div class="qrcode-preview">
        <div class="preview-header">
          <h4>二维码预览</h4>
          <div class="preview-actions" v-if="qrDataURL">
            <el-dropdown @command="handleExportCommand">
              <el-button type="primary">
                <el-icon><Download /></el-icon>
                下载图片
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="png">PNG格式</el-dropdown-item>
                  <el-dropdown-item command="jpeg">JPEG格式</el-dropdown-item>
                  <el-dropdown-item command="svg">SVG格式</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div class="preview-container" :class="{ empty: !qrDataURL }">
          <div v-if="qrDataURL" class="qrcode-result">
            <img :src="qrDataURL" alt="生成的二维码" />
          </div>
          <div v-else class="placeholder">
            <el-icon><Picture /></el-icon>
            <p>请输入内容生成二维码</p>
          </div>
        </div>
      </div>
      
      <div class="qrcode-tips">
        <el-alert
          title="二维码使用提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul>
              <li>通常建议使用至少M级别的容错以确保可靠性</li>
              <li>确保二维码有足够的对比度，避免使用相近的前景和背景颜色</li>
              <li>网址请以 http:// 或 https:// 开头以确保扫码后能正确打开</li>
              <li>过长的文本内容会导致二维码密度增加，可能降低扫描的成功率</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </div>
    
    <div class="information-section">
      <el-collapse>
        <el-collapse-item title="关于二维码" name="qrcode-info">
          <div class="qrcode-information">
            <h4>什么是二维码？</h4>
            <p>二维码（QR Code）是一种二维条码，由日本Denso Wave公司于1994年发明。QR来自英文"Quick Response"（快速响应）的缩写，因为创造者希望发明一种可以快速解码的符号。</p>
            
            <h4>二维码的特点</h4>
            <ul>
              <li>高信息密度：相比一维条码，二维码可以在相同空间内存储更多信息</li>
              <li>容错能力：当部分码图被污损时仍然可以被正常读取</li>
              <li>全方位识别：二维码可以从任何方向（360度）被扫描识别</li>
              <li>支持多种数据类型：可以编码文本、网址、电话号码、WiFi配置等多种信息</li>
            </ul>
            
            <h4>容错级别说明</h4>
            <p>二维码有四种容错级别，不同级别能够恢复的数据量不同：</p>
            <ul>
              <li><strong>L级（低）</strong>：可恢复约7%的数据</li>
              <li><strong>M级（中）</strong>：可恢复约15%的数据</li>
              <li><strong>Q级（高）</strong>：可恢复约25%的数据</li>
              <li><strong>H级（最高）</strong>：可恢复约30%的数据</li>
            </ul>
            <p>容错级别越高，二维码的点阵越密集，码图越复杂，但抗干扰能力也越强。</p>
            
            <h4>二维码应用场景</h4>
            <ul>
              <li>商品标识和追踪管理</li>
              <li>支付和电子商务</li>
              <li>名片和联系信息共享</li>
              <li>网站链接和推广营销</li>
              <li>WiFi网络快速连接</li>
              <li>活动票务和身份验证</li>
              <li>公共信息查询和服务获取</li>
            </ul>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ArrowDown, Download, Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash-es';
import QRCode from 'qrcode';
import { onMounted, reactive, ref } from 'vue';

// 二维码选项
const qrOptions = reactive({
  text: 'https://example.com',  // 默认添加一个示例URL
  size: 200,
  errorCorrectionLevel: 'M',
  foreground: '#000000',
  background: '#FFFFFF',
  qrStyle: 'squares'
});

const qrDataURL = ref('');
const qrSvgData = ref('');
const qrCanvas = ref(null);

// 初始化
onMounted(() => {
  qrCanvas.value = document.createElement('canvas');
  // 组件加载后立即生成默认二维码
  generateQRCode();
});

// 生成二维码
const generateQRCode = async () => {
  if (!qrOptions.text.trim()) {
    qrDataURL.value = '';
    qrSvgData.value = '';
    return;
  }
  
  try {
    // 创建选项对象
    const options = {
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      width: qrOptions.size,
      margin: 1,
      color: {
        dark: qrOptions.foreground,
        light: qrOptions.background
      }
    };
    
    // 根据样式设置参数
    if (qrOptions.qrStyle === 'dots') {
      // 圆点样式
      options.rendererOpts = {
        quality: 1,
        ...(options.rendererOpts || {}),
      };
    }
    
    // 生成Canvas上的二维码
    await QRCode.toCanvas(qrCanvas.value, qrOptions.text, options);
    qrDataURL.value = qrCanvas.value.toDataURL('image/png');
    
    // 生成SVG数据
    qrSvgData.value = await QRCode.toString(qrOptions.text, {
      ...options,
      type: 'svg'
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    ElMessage.error('生成二维码失败，请检查输入内容');
  }
};

// 使用debounce延迟生成，避免输入过程中频繁重新渲染
const debounceGenerateQR = debounce(() => {
  generateQRCode();
}, 300);  // 减少延迟时间，让响应更快

// 下载图片处理
const handleExportCommand = async (command) => {
  if (!qrDataURL.value) {
    ElMessage.warning('请先生成二维码');
    return;
  }
  
  try {
    let downloadURL;
    let fileName = `qrcode_${new Date().getTime()}`;
    
    switch (command) {
      case 'png':
        downloadURL = qrDataURL.value;
        fileName += '.png';
        break;
      case 'jpeg':
        // 将PNG转换为JPEG（通过Canvas重新绘制）
        const jpegCanvas = document.createElement('canvas');
        jpegCanvas.width = qrOptions.size;
        jpegCanvas.height = qrOptions.size;
        const ctx = jpegCanvas.getContext('2d');
        
        // 先填充白色背景（因为JPEG不支持透明）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
        
        // 绘制二维码
        const img = new Image();
        img.src = qrDataURL.value;
        await new Promise(resolve => {
          img.onload = resolve;
        });
        ctx.drawImage(img, 0, 0);
        
        downloadURL = jpegCanvas.toDataURL('image/jpeg', 0.9);
        fileName += '.jpg';
        break;
      case 'svg':
        // 使用Blob创建SVG下载URL
        const svgBlob = new Blob([qrSvgData.value], { type: 'image/svg+xml' });
        downloadURL = URL.createObjectURL(svgBlob);
        fileName += '.svg';
        break;
      default:
        ElMessage.error('不支持的文件格式');
        return;
    }
    
    // 执行下载
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 如果是SVG，需要释放URL对象
    if (command === 'svg') {
      URL.revokeObjectURL(downloadURL);
    }
    
    ElMessage.success('二维码图片已下载');
  } catch (error) {
    console.error('下载二维码失败:', error);
    ElMessage.error('下载二维码失败，请重试');
  }
};
</script>

<style lang="scss" scoped>
.qrcode-generator {
  .generator-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .generator-header {
      margin-bottom: 20px;
      
      h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: var(--text-color, #333);
      }
      
      .generator-description {
        color: var(--text-color-light, #666);
        margin: 0;
      }
    }
  }
  
  .qrcode-input-section {
    margin-bottom: 25px;
    
    .option-section {
      margin-top: 20px;
      
      .option-row {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 15px;
        
        .el-form-item {
          flex: 1;
          min-width: 250px;
        }
        
        &.colors {
          .el-form-item {
            min-width: 150px;
          }
        }
      }
      
      .option-description {
        font-size: 0.85rem;
        color: var(--text-color-light, #666);
        margin-top: 5px;
      }
    }
  }
  
  .qrcode-preview {
    margin-bottom: 25px;
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h4 {
        margin: 0;
        color: var(--text-color, #333);
      }
    }
    
    .preview-container {
      background-color: var(--secondary-background, #f9f9f9);
      border: 1px dashed var(--border-color, #ddd);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      
      &.empty {
        background-color: var(--secondary-background, #f9f9f9);
      }
      
      .qrcode-result {
        img {
          display: block;
          max-width: 100%;
        }
      }
      
      .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-color-light, #999);
        
        .el-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        p {
          margin: 0;
        }
      }
    }
  }
  
  .qrcode-tips {
    ul {
      margin: 10px 0 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 5px;
      }
    }
  }
  
  .information-section {
    .qrcode-information {
      h4 {
        margin-top: 15px;
        margin-bottom: 10px;
        color: var(--text-color, #333);
      }
      
      &:first-child {
        margin-top: 0;
      }
      
      p {
        margin: 0 0 10px;
        color: var(--text-color, #333);
      }
      
      ul {
        margin: 0 0 15px;
        padding-left: 20px;
        
        li {
          margin-bottom: 5px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .qrcode-generator {
    .generator-container {
      padding: 15px;
    }
    
    .qrcode-input-section {
      .option-section {
        .option-row {
          flex-direction: column;
          gap: 10px;
          
          .el-form-item {
            width: 100%;
          }
        }
      }
    }
    
    .qrcode-preview {
      .preview-header {
        flex-direction: column;
        align-items: flex-start;
        
        .preview-actions {
          margin-top: 10px;
          width: 100%;
          
          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style> 