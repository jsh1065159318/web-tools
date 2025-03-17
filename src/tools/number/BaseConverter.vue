<template>
  <div class="base-converter">
    <div class="input-section">
      <h3>数值输入</h3>
      <el-form label-position="top">
        <el-form-item label="输入进制">
          <el-select v-model="inputBase" @change="convertNumber">
            <el-option v-for="base in commonBases" :key="base.value" :label="base.label" :value="base.value" />
            <el-option v-if="showCustomBase" label="自定义进制" :value="customInputBase" />
          </el-select>
          
          <el-input-number 
            v-if="showCustomBase && inputBase === customInputBase" 
            v-model="customInputBase" 
            :min="2" 
            :max="36"
            @change="handleCustomInputBaseChange"
            style="margin-left: 10px; width: 120px;"
          />
          
          <el-button 
            type="text" 
            @click="showCustomBase = !showCustomBase"
            style="margin-left: 10px;"
          >
            {{ showCustomBase ? '隐藏自定义' : '自定义进制' }}
          </el-button>
        </el-form-item>
        
        <el-form-item label="数值">
          <el-input 
            v-model="inputValue" 
            @input="convertNumber" 
            placeholder="请输入数值" 
            :maxlength="50"
            :class="{ 'error-input': hasInputError }"
          />
          <div class="error-message" v-if="hasInputError">
            {{ inputErrorMessage }}
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="conversion-results">
      <h3>转换结果</h3>
      <el-table :data="results" style="width: 100%">
        <el-table-column prop="base" label="进制" width="100" />
        <el-table-column prop="value" label="值">
          <template #default="scope">
            <div class="result-value">
              {{ scope.row.value }}
              <el-button 
                type="primary" 
                size="small" 
                circle 
                @click="copyToClipboard(scope.row.value)"
                class="copy-button"
              >
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div class="conversion-options">
      <h3>显示选项</h3>
      <el-form label-position="top">
        <el-form-item>
          <el-checkbox v-model="showBases.binary" @change="convertNumber">二进制 (2)</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="showBases.octal" @change="convertNumber">八进制 (8)</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="showBases.decimal" @change="convertNumber">十进制 (10)</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="showBases.hexadecimal" @change="convertNumber">十六进制 (16)</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="showBases.custom" @change="convertNumber">自定义进制</el-checkbox>
        </el-form-item>
        
        <el-form-item v-if="showBases.custom" label="自定义进制值">
          <el-input-number v-model="customOutputBase" :min="2" :max="36" @change="convertNumber" />
        </el-form-item>
        
        <el-form-item label="大小写选项" v-if="showBases.hexadecimal || (showBases.custom && customOutputBase > 10)">
          <el-radio-group v-model="letterCase" @change="convertNumber">
            <el-radio label="lower">小写 (a-z)</el-radio>
            <el-radio label="upper">大写 (A-Z)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="conversion-guide">
      <el-collapse>
        <el-collapse-item title="进制转换说明" name="guide">
          <p>进制是一种记数方式，表示某物体的数量时所采用的计数单位。常见进制有：</p>
          <ul>
            <li><strong>二进制（Binary）</strong>：由0和1两个数字组成，是计算机内部使用的基本数制</li>
            <li><strong>八进制（Octal）</strong>：由0-7八个数字组成</li>
            <li><strong>十进制（Decimal）</strong>：由0-9十个数字组成，是我们日常使用的数制</li>
            <li><strong>十六进制（Hexadecimal）</strong>：由0-9和A-F（或a-f）组成，常用于计算机编程</li>
          </ul>
          <p>转换规则：</p>
          <ul>
            <li>输入时，请确保输入的数值符合所选进制的规则（例如二进制只能包含0和1）</li>
            <li>对于大于10的进制，字母A-Z（或a-z）分别表示数值10-35</li>
            <li>本工具支持2到36之间的任意进制转换</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { DocumentCopy } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';

// 输入值和进制
const inputValue = ref('');
const inputBase = ref(10);
const customInputBase = ref(2);
const showCustomBase = ref(false);
const inputErrorMessage = ref('');

// 输出选项
const showBases = reactive({
  binary: true,
  octal: true,
  decimal: true,
  hexadecimal: true,
  custom: false
});
const customOutputBase = ref(2);
const letterCase = ref('upper');

// 常用进制
const commonBases = [
  { label: '二进制 (2)', value: 2 },
  { label: '八进制 (8)', value: 8 },
  { label: '十进制 (10)', value: 10 },
  { label: '十六进制 (16)', value: 16 }
];

// 转换结果
const results = ref([]);

// 输入是否有错误
const hasInputError = computed(() => {
  return !!inputErrorMessage.value;
});

// 处理自定义输入进制变化
const handleCustomInputBaseChange = () => {
  if (inputBase.value === customInputBase.value && customInputBase.value !== 2) {
    inputBase.value = customInputBase.value;
  }
  convertNumber();
};

// 将输入的数值转换为十进制
const convertToDecimal = (value, base) => {
  // 空输入检查
  if (!value) {
    return null;
  }
  
  // 移除前缀（如0x, 0b等）
  value = value.replace(/^0[xXbBoO]/, '');
  
  // 校验输入是否符合指定进制
  const regex = base <= 10 
    ? new RegExp(`^[0-${base - 1}]+$`) 
    : new RegExp(`^[0-9A-${String.fromCharCode(55 + base - 1)}a-${String.fromCharCode(87 + base - 1)}]+$`);
  
  if (!regex.test(value)) {
    inputErrorMessage.value = `输入包含无效字符。${base}进制只能包含${base <= 10 ? `0-${base - 1}` : `0-9和A-${String.fromCharCode(55 + base - 1)}`}`;
    return null;
  }
  
  try {
    const decimalValue = parseInt(value, base);
    if (isNaN(decimalValue)) {
      inputErrorMessage.value = '转换失败，请检查输入';
      return null;
    }
    
    inputErrorMessage.value = '';
    return decimalValue;
  } catch (error) {
    inputErrorMessage.value = `转换错误: ${error.message}`;
    return null;
  }
};

// 将十进制转换为指定进制
const convertFromDecimal = (decimalValue, targetBase) => {
  if (decimalValue === null) {
    return '';
  }
  
  try {
    let result = decimalValue.toString(targetBase);
    
    // 应用大小写转换
    if (targetBase > 10 && letterCase.value === 'upper') {
      result = result.toUpperCase();
    }
    
    return result;
  } catch (error) {
    console.error('转换错误:', error);
    return 'Error';
  }
};

// 执行数值转换
const convertNumber = () => {
  results.value = [];
  
  // 如果输入为空，清空结果
  if (!inputValue.value) {
    inputErrorMessage.value = '';
    return;
  }
  
  // 将输入转换为十进制
  const decimalValue = convertToDecimal(inputValue.value, inputBase.value);
  
  // 如果转换出错，不继续处理
  if (decimalValue === null) {
    return;
  }
  
  // 添加各种进制的转换结果
  if (showBases.binary) {
    results.value.push({
      base: '二进制 (2)',
      value: convertFromDecimal(decimalValue, 2)
    });
  }
  
  if (showBases.octal) {
    results.value.push({
      base: '八进制 (8)',
      value: convertFromDecimal(decimalValue, 8)
    });
  }
  
  if (showBases.decimal) {
    results.value.push({
      base: '十进制 (10)',
      value: decimalValue.toString()
    });
  }
  
  if (showBases.hexadecimal) {
    results.value.push({
      base: '十六进制 (16)',
      value: convertFromDecimal(decimalValue, 16)
    });
  }
  
  if (showBases.custom && customOutputBase.value !== 2 && 
      customOutputBase.value !== 8 && customOutputBase.value !== 10 && 
      customOutputBase.value !== 16) {
    results.value.push({
      base: `进制 (${customOutputBase.value})`,
      value: convertFromDecimal(decimalValue, customOutputBase.value)
    });
  }
};

// 复制到剪贴板
const copyToClipboard = (value) => {
  navigator.clipboard.writeText(value)
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
.base-converter {
  display: flex;
  flex-direction: column;
  gap: 25px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--text-color, #333);
  }
  
  .input-section, .conversion-options {
    border: 1px solid var(--border-color, #eee);
    border-radius: 8px;
    padding: 15px;
  }
  
  .conversion-results {
    .result-value {
      display: flex;
      align-items: center;
      
      .copy-button {
        margin-left: 10px;
        opacity: 0.5;
        transition: opacity 0.3s;
      }
      
      &:hover .copy-button {
        opacity: 1;
      }
    }
  }
  
  .error-input {
    border-color: #F56C6C;
  }
  
  .error-message {
    color: #F56C6C;
    font-size: 0.9rem;
    margin-top: 5px;
  }
  
  .conversion-guide {
    margin-top: 20px;
    
    p {
      margin: 0 0 10px;
      color: var(--text-color, #333);
    }
    
    ul {
      margin: 0 0 15px;
      padding-left: 20px;
      color: var(--text-color, #333);
    }
  }
}

@media (max-width: 768px) {
  .base-converter {
    .conversion-results {
      overflow-x: auto;
    }
  }
}
</style> 