<template>
  <div class="case-converter">
    <div class="tool-section">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="6"
        placeholder="请在此输入待转换的文本..."
        @input="processText"
      ></el-input>
    </div>
    
    <div class="options-section">
      <el-radio-group v-model="conversionType" @change="processText" size="large">
        <el-radio-button label="upper">全部大写</el-radio-button>
        <el-radio-button label="lower">全部小写</el-radio-button>
        <el-radio-button label="capitalize">首字母大写</el-radio-button>
        <el-radio-button label="sentence">句首大写</el-radio-button>
        <el-radio-button label="toggle">大小写互换</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="tool-section">
      <div class="result-header">
        <h3>转换结果：</h3>
        <el-button type="primary" size="small" @click="copyResult" :disabled="!outputText">
          <el-icon><DocumentCopy /></el-icon> 复制结果
        </el-button>
      </div>
      <el-input
        v-model="outputText"
        type="textarea"
        :rows="6"
        readonly
        placeholder="转换后的文本将显示在这里..."
      ></el-input>
    </div>
    
    <div class="stats-section">
      <p>字符数：{{ charCount }} | 单词数：{{ wordCount }} | 行数：{{ lineCount }}</p>
    </div>
  </div>
</template>

<script setup>
import { DocumentCopy } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';

const inputText = ref('');
const outputText = ref('');
const conversionType = ref('upper'); // 默认为全部大写

// 文本统计信息
const charCount = computed(() => inputText.value.length);
const wordCount = computed(() => {
  return inputText.value.trim() ? inputText.value.trim().split(/\s+/).length : 0;
});
const lineCount = computed(() => {
  return inputText.value ? inputText.value.split('\n').length : 0;
});

// 处理文本转换
const processText = () => {
  if (!inputText.value) {
    outputText.value = '';
    return;
  }

  switch (conversionType.value) {
    case 'upper':
      outputText.value = inputText.value.toUpperCase();
      break;
    case 'lower':
      outputText.value = inputText.value.toLowerCase();
      break;
    case 'capitalize':
      outputText.value = inputText.value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      break;
    case 'sentence':
      outputText.value = inputText.value
        .split('. ')
        .map(sentence => {
          if (!sentence) return sentence;
          return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
        })
        .join('. ');
      break;
    case 'toggle':
      outputText.value = inputText.value
        .split('')
        .map(char => {
          if (char === char.toUpperCase()) {
            return char.toLowerCase();
          } else {
            return char.toUpperCase();
          }
        })
        .join('');
      break;
    default:
      outputText.value = inputText.value;
  }
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
.case-converter {
  .tool-section {
    margin-bottom: 20px;
  }
  
  .options-section {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    h3 {
      margin: 0;
      color: var(--text-color, #333);
    }
  }
  
  .stats-section {
    margin-top: 10px;
    font-size: 0.9rem;
    color: var(--text-color-light, #666);
    text-align: right;
  }
}

@media (max-width: 768px) {
  .case-converter {
    .options-section {
      .el-radio-group {
        display: flex;
        flex-direction: column;
        width: 100%;
        
        .el-radio-button {
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style> 