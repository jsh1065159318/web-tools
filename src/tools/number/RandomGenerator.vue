<template>
  <div class="random-generator">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="随机数" name="number">
        <div class="generator-form">
          <el-form :model="numberForm" label-position="top">
            <el-form-item label="最小值">
              <el-input-number v-model="numberForm.min" :precision="numberForm.decimal ? 2 : 0" />
            </el-form-item>
            
            <el-form-item label="最大值">
              <el-input-number v-model="numberForm.max" :precision="numberForm.decimal ? 2 : 0" />
            </el-form-item>
            
            <el-form-item label="生成数量">
              <el-input-number v-model="numberForm.count" :min="1" :max="100" />
            </el-form-item>
            
            <el-form-item label="小数位数" v-if="numberForm.decimal">
              <el-input-number v-model="numberForm.decimalPlaces" :min="1" :max="10" />
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="numberForm.decimal">包含小数</el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="numberForm.unique" :disabled="!canBeUnique">唯一值</el-checkbox>
              <el-tooltip v-if="!canBeUnique" placement="top">
                <template #content>
                  当可能的数值范围小于生成数量时，无法生成唯一值
                </template>
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="generateRandomNumbers">生成随机数</el-button>
              <el-button type="default" @click="resetNumberForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="随机字符串" name="string">
        <div class="generator-form">
          <el-form :model="stringForm" label-position="top">
            <el-form-item label="字符串长度">
              <el-input-number v-model="stringForm.length" :min="1" :max="100" />
            </el-form-item>
            
            <el-form-item label="生成数量">
              <el-input-number v-model="stringForm.count" :min="1" :max="50" />
            </el-form-item>
            
            <el-form-item label="字符类型">
              <el-checkbox-group v-model="stringForm.charTypes">
                <el-checkbox label="uppercase">大写字母</el-checkbox>
                <el-checkbox label="lowercase">小写字母</el-checkbox>
                <el-checkbox label="numbers">数字</el-checkbox>
                <el-checkbox label="special">特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="stringForm.unique">唯一值</el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="generateRandomStrings" :disabled="!stringForm.charTypes.length">生成随机字符串</el-button>
              <el-button type="default" @click="resetStringForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <div class="result-section" v-if="results.length > 0">
      <div class="result-header">
        <h3>生成结果</h3>
        <div class="result-actions">
          <el-button type="primary" size="small" @click="copyResults">
            <el-icon><DocumentCopy /></el-icon> 复制结果
          </el-button>
          <el-button type="default" size="small" @click="clearResults">
            <el-icon><Delete /></el-icon> 清空结果
          </el-button>
        </div>
      </div>
      
      <div class="results-display">
        <el-input
          v-model="resultsText"
          type="textarea"
          :rows="6"
          readonly
          placeholder="生成的随机值将显示在这里..."
        ></el-input>
      </div>
      
      <div class="display-options">
        <span class="option-label">分隔符：</span>
        <el-radio-group v-model="displayOptions.separator" size="small" @change="updateResultsText">
          <el-radio-button label=",">逗号 (,)</el-radio-button>
          <el-radio-button label=" ">空格</el-radio-button>
          <el-radio-button label="\n">换行</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, DocumentCopy, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';

// 选中的标签页
const activeTab = ref('number');

// 随机数表单
const numberForm = reactive({
  min: 1,
  max: 100,
  count: 10,
  decimal: false,
  decimalPlaces: 2,
  unique: false
});

// 随机字符串表单
const stringForm = reactive({
  length: 8,
  count: 5,
  charTypes: ['uppercase', 'lowercase', 'numbers'],
  unique: false
});

// 显示选项
const displayOptions = reactive({
  separator: ','
});

// 结果数组
const results = ref([]);

// 是否可以生成唯一值
const canBeUnique = computed(() => {
  if (!numberForm.decimal) {
    return (numberForm.max - numberForm.min + 1) >= numberForm.count;
  }
  return true;
});

// 根据分隔符显示结果文本
const resultsText = computed(() => {
  const separator = displayOptions.separator === '\\n' ? '\n' : displayOptions.separator;
  return results.value.join(separator);
});

// 生成随机数
const generateRandomNumbers = () => {
  if (numberForm.min > numberForm.max) {
    ElMessage.error('最小值不能大于最大值');
    return;
  }
  
  // 检查是否可以生成唯一值
  if (numberForm.unique && !numberForm.decimal && (numberForm.max - numberForm.min + 1) < numberForm.count) {
    ElMessage.error('无法在指定范围内生成足够的唯一值');
    return;
  }
  
  const generatedResults = [];
  let attempts = 0;
  const maxAttempts = numberForm.count * 10; // 防止无限循环
  
  while (generatedResults.length < numberForm.count && attempts < maxAttempts) {
    attempts++;
    
    let randomNum;
    if (numberForm.decimal) {
      // 生成带小数的随机数
      randomNum = numberForm.min + Math.random() * (numberForm.max - numberForm.min);
      randomNum = parseFloat(randomNum.toFixed(numberForm.decimalPlaces));
    } else {
      // 生成整数
      randomNum = Math.floor(Math.random() * (numberForm.max - numberForm.min + 1)) + numberForm.min;
    }
    
    // 如果需要唯一值，检查是否已存在
    if (!numberForm.unique || !generatedResults.includes(randomNum)) {
      generatedResults.push(randomNum);
    }
  }
  
  results.value = generatedResults;
  
  if (results.value.length < numberForm.count) {
    ElMessage.warning('无法生成足够的唯一值，已返回部分结果');
  }
};

// 重置随机数表单
const resetNumberForm = () => {
  numberForm.min = 1;
  numberForm.max = 100;
  numberForm.count = 10;
  numberForm.decimal = false;
  numberForm.decimalPlaces = 2;
  numberForm.unique = false;
};

// 生成随机字符串
const generateRandomStrings = () => {
  if (stringForm.charTypes.length === 0) {
    ElMessage.error('请至少选择一种字符类型');
    return;
  }
  
  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    special: '!@#$%^&*()_+~`|}{[]:;?><,./-='
  };
  
  // 构建字符集
  let charset = '';
  stringForm.charTypes.forEach(type => {
    charset += charSets[type];
  });
  
  const generatedResults = [];
  let attempts = 0;
  const maxAttempts = stringForm.count * 100; // 防止无限循环
  
  while (generatedResults.length < stringForm.count && attempts < maxAttempts) {
    attempts++;
    
    // 生成随机字符串
    let result = '';
    for (let i = 0; i < stringForm.length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }
    
    // 如果需要唯一值，检查是否已存在
    if (!stringForm.unique || !generatedResults.includes(result)) {
      generatedResults.push(result);
    }
  }
  
  results.value = generatedResults;
  
  if (results.value.length < stringForm.count) {
    ElMessage.warning('无法生成足够的唯一值，已返回部分结果');
  }
};

// 重置随机字符串表单
const resetStringForm = () => {
  stringForm.length = 8;
  stringForm.count = 5;
  stringForm.charTypes = ['uppercase', 'lowercase', 'numbers'];
  stringForm.unique = false;
};

// 更新结果文本显示
const updateResultsText = () => {
  // resultsText是计算属性，会自动更新
};

// 复制结果
const copyResults = () => {
  if (!results.value.length) return;
  
  navigator.clipboard.writeText(resultsText.value)
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

// 清空结果
const clearResults = () => {
  results.value = [];
};
</script>

<style lang="scss" scoped>
.random-generator {
  .generator-form {
    max-width: 100%;
    
    .el-form {
      max-width: 500px;
      margin: 0 auto;
    }
  }
  
  .result-section {
    margin-top: 30px;
    border-top: 1px solid var(--border-color, #eee);
    padding-top: 20px;
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        margin: 0;
        color: var(--text-color, #333);
      }
      
      .result-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .results-display {
      margin-bottom: 15px;
    }
    
    .display-options {
      display: flex;
      align-items: center;
      
      .option-label {
        margin-right: 10px;
        color: var(--text-color-light, #666);
      }
    }
  }
}

@media (max-width: 768px) {
  .random-generator {
    .result-section {
      .result-header {
        flex-direction: column;
        align-items: flex-start;
        
        h3 {
          margin-bottom: 10px;
        }
      }
      
      .display-options {
        flex-direction: column;
        align-items: flex-start;
        
        .option-label {
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style> 