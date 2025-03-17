<template>
  <div class="base64-converter">
    <div class="operation-mode">
      <el-radio-group v-model="mode" @change="clearResult" size="large">
        <el-radio-button label="encode">文本转Base64</el-radio-button>
        <el-radio-button label="decode">Base64转文本</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="tool-section">
      <h3>{{ mode === 'encode' ? '输入文本' : '输入Base64' }}</h3>
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="6"
        :placeholder="mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的Base64字符串...'"
      ></el-input>
    </div>
    
    <div class="button-section">
      <el-button type="primary" @click="processConversion" :disabled="!inputText">
        {{ mode === 'encode' ? '编码' : '解码' }}
      </el-button>
      <el-button @click="clearAll">清空</el-button>
    </div>
    
    <div class="tool-section" v-if="outputText">
      <div class="result-header">
        <h3>{{ mode === 'encode' ? 'Base64编码结果' : '文本解码结果' }}：</h3>
        <el-button type="primary" size="small" @click="copyResult">
          <el-icon><DocumentCopy /></el-icon> 复制结果
        </el-button>
      </div>
      <el-input
        v-model="outputText"
        type="textarea"
        :rows="6"
        readonly
      ></el-input>
      
      <div class="error-message" v-if="errorMessage">
        <el-alert
          :title="errorMessage"
          type="error"
          :closable="false"
          show-icon
        />
      </div>
    </div>
    
    <div class="tool-description">
      <el-collapse>
        <el-collapse-item title="什么是Base64编码？" name="what">
          <p>Base64是一种二进制到文本的编码方案，常用于在通过文本协议传输二进制数据时。它可以将任意二进制数据编码为ASCII字符串格式，确保数据在传输过程中不会被修改。</p>
        </el-collapse-item>
        <el-collapse-item title="常见应用场景" name="usage">
          <p>Base64常用于：</p>
          <ul>
            <li>电子邮件中的附件</li>
            <li>数据URL（在网页中嵌入图片等资源）</li>
            <li>某些情况下的API数据传输</li>
            <li>简单的文本加密（注意：Base64不是加密算法，只是编码）</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { DocumentCopy } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const mode = ref('encode');
const inputText = ref('');
const outputText = ref('');
const errorMessage = ref('');

// 处理编码/解码转换
const processConversion = () => {
  if (!inputText.value) {
    return;
  }
  
  errorMessage.value = '';
  
  try {
    if (mode.value === 'encode') {
      // 文本转Base64
      outputText.value = btoa(encodeURIComponent(inputText.value).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
      }));
    } else {
      // Base64转文本
      outputText.value = decodeURIComponent(Array.prototype.map.call(atob(inputText.value), c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = mode.value === 'encode' 
      ? '编码过程中出现错误，请检查输入内容' 
      : '解码过程中出现错误，请确保输入的是有效的Base64字符串';
    outputText.value = '';
  }
};

// 清空结果
const clearResult = () => {
  outputText.value = '';
  errorMessage.value = '';
};

// 清空所有
const clearAll = () => {
  inputText.value = '';
  clearResult();
};

// 复制结果到剪贴板
const copyResult = () => {
  if (!outputText.value) return;
  
  navigator.clipboard.writeText(outputText.value)
    .then(() => {
      ElMessage({
        message: '已复制到剪贴板',
        type: 'success'
      });
    })
    .catch(() => {
      ElMessage({
        message: '复制失败，请手动复制',
        type: 'error'
      });
    });
};
</script>

<style lang="scss" scoped>
.base64-converter {
  .operation-mode {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .tool-section {
    margin-bottom: 20px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      color: var(--text-color, #333);
    }
  }
  
  .button-section {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .error-message {
    margin-top: 10px;
  }
  
  .tool-description {
    margin-top: 30px;
    
    p {
      margin: 0 0 10px;
      color: var(--text-color, #333);
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      color: var(--text-color, #333);
    }
  }
}

@media (max-width: 768px) {
  .base64-converter {
    .operation-mode {
      .el-radio-group {
        width: 100%;
        display: flex;
        flex-direction: column;
        
        .el-radio-button {
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style> 