<template>
  <div class="rmb-converter">
    <div class="converter-container">
      <div class="converter-header">
        <h3>人民币大小写转换</h3>
        <p class="description">将数字金额转换为中文大写金额，适用于合同、发票等正式场合</p>
      </div>
      
      <div class="main-content">
        <div class="input-section">
          <div class="section-header">
            <span class="section-title">输入金额</span>
            <div class="input-controls">
              <el-button size="small" @click="clearInput" :disabled="!inputAmount">
                <el-icon><Delete /></el-icon> 清空
              </el-button>
              <el-button size="small" @click="pasteFromClipboard">
                <el-icon><DocumentCopy /></el-icon> 粘贴
              </el-button>
            </div>
          </div>
          
          <div class="input-wrapper">
            <div class="input-prefix" v-if="conversionMode === 'toUpper'">¥</div>
            <el-input
              v-model="inputAmount"
              :placeholder="getPlaceholder"
              @input="handleInput"
            />
          </div>
          
          <div v-if="conversionMode === 'toUpper' && inputError" class="error-message">
            <el-alert
              :title="inputError"
              type="error"
              :closable="false"
              show-icon
            />
          </div>
        </div>
        
        <div class="action-panel">
          <div class="conversion-controls">
            <el-radio-group v-model="conversionMode" @change="handleModeChange">
              <el-radio-button label="toUpper">数字 → 大写</el-radio-button>
              <el-radio-button label="toLower">大写 → 数字</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="conversion-button">
            <el-button 
              type="primary" 
              @click="convertAmount" 
              :disabled="!canConvert"
            >
              <el-icon><RefreshRight /></el-icon> 转换
            </el-button>
          </div>
          
          <div class="option-panel">
            <div class="option-title">转换选项</div>
            <el-checkbox v-model="options.addPrefix">添加"人民币"前缀</el-checkbox>
            <el-checkbox v-model="options.traditionalChars" v-if="conversionMode === 'toUpper'">使用繁体字</el-checkbox>
            <el-checkbox v-model="options.addZeroWhenInteger" v-if="conversionMode === 'toUpper'">整数添加"整"字</el-checkbox>
          </div>
          
          <div class="sample-text">
            <div class="sample-title">示例金额</div>
            <div class="sample-list">
              <div class="sample-item" @click="setSampleAmount('small')">
                <span class="sample-label">小额:</span>
                <span class="sample-content">123.45</span>
              </div>
              <div class="sample-item" @click="setSampleAmount('medium')">
                <span class="sample-label">中额:</span>
                <span class="sample-content">12345.67</span>
              </div>
              <div class="sample-item" @click="setSampleAmount('large')">
                <span class="sample-label">大额:</span>
                <span class="sample-content">1234567.89</span>
              </div>
              <div class="sample-item" @click="setSampleAmount('huge')">
                <span class="sample-label">巨额:</span>
                <span class="sample-content">100000000.00</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="output-section">
          <div class="section-header">
            <span class="section-title">转换结果</span>
            <div class="output-controls">
              <el-button size="small" @click="copyToClipboard" :disabled="!outputAmount">
                <el-icon><DocumentCopy /></el-icon> 复制
              </el-button>
              <el-button size="small" @click="swapInputOutput" :disabled="!outputAmount">
                <el-icon><RefreshRight /></el-icon> 交换
              </el-button>
            </div>
          </div>
          
          <div class="output-wrapper">
            <div class="output-content">{{ outputAmount || '转换结果将显示在这里' }}</div>
          </div>
        </div>
      </div>
      
      <div class="converter-info">
        <el-collapse>
          <el-collapse-item title="人民币大写金额规则" name="rules">
            <div class="info-content">
              <h4>人民币大写金额书写规则</h4>
              <ul>
                <li>中文大写金额数字应用正楷或行书填写，如壹、贰、叁、肆、伍、陆、柒、捌、玖、拾、佰、仟、万、亿、元、角、分、零、整等</li>
                <li>中文大写金额数字到"元"为止的，在"元"之后应写"整"或"正"字</li>
                <li>中文大写金额数字有"分"的，"分"后面不写"整"或"正"字</li>
                <li>中文大写金额数字前应标明"人民币"字样</li>
                <li>阿拉伯数字小写金额数字中有"0"时，中文大写应按照汉语语言规律，只在"元"、"万"、"亿"等数级间书写"零"字</li>
                <li>阿拉伯数字小写金额数字中有连续几个"0"时，中文大写金额应只写一个"零"字</li>
                <li>阿拉伯数字小写金额数字元位是"0"，或者数字中间连续有几个"0"，元位也是"0"但角位不是"0"时，中文大写金额可以只写一个"零"字</li>
                <li>阿拉伯数字小写金额数字角位是"0"而分位不是"0"时，中文大写金额"元"后应写"零"字</li>
              </ul>
              
              <h4>数字与大写对照表</h4>
              <div class="conversion-table">
                <div class="table-row">
                  <div class="table-cell">数字</div>
                  <div class="table-cell">0</div>
                  <div class="table-cell">1</div>
                  <div class="table-cell">2</div>
                  <div class="table-cell">3</div>
                  <div class="table-cell">4</div>
                  <div class="table-cell">5</div>
                  <div class="table-cell">6</div>
                  <div class="table-cell">7</div>
                  <div class="table-cell">8</div>
                  <div class="table-cell">9</div>
                </div>
                <div class="table-row">
                  <div class="table-cell">大写</div>
                  <div class="table-cell">零</div>
                  <div class="table-cell">壹</div>
                  <div class="table-cell">贰</div>
                  <div class="table-cell">叁</div>
                  <div class="table-cell">肆</div>
                  <div class="table-cell">伍</div>
                  <div class="table-cell">陆</div>
                  <div class="table-cell">柒</div>
                  <div class="table-cell">捌</div>
                  <div class="table-cell">玖</div>
                </div>
              </div>
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="常见使用场景" name="usage">
            <div class="info-content">
              <h4>人民币大写金额常见使用场景</h4>
              <ul>
                <li><strong>合同文件：</strong>各类商业合同、劳动合同中的金额表示</li>
                <li><strong>发票填写：</strong>增值税发票、普通发票中的金额大写</li>
                <li><strong>银行票据：</strong>支票、汇票、本票等票据的金额填写</li>
                <li><strong>财务报表：</strong>重要财务报表中的金额表示</li>
                <li><strong>公文文件：</strong>政府公文、法律文书中的金额表示</li>
                <li><strong>收据凭证：</strong>收款收据、付款凭证中的金额表示</li>
              </ul>
              
              <h4>为什么需要大写金额？</h4>
              <p>使用中文大写金额的主要原因：</p>
              <ul>
                <li>防止篡改：阿拉伯数字容易被篡改（如1可改为7），而中文大写不易被篡改</li>
                <li>避免混淆：大写金额表述更加清晰，避免数字书写不清导致的混淆</li>
                <li>法律要求：我国法律规定，特定场合必须使用中文大写金额</li>
                <li>传统习惯：沿袭了中国传统文化中对重要数字使用大写的习惯</li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, DocumentCopy, RefreshRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';

// 输入和输出
const inputAmount = ref('');
const outputAmount = ref('');
const inputError = ref('');

// 转换模式：toUpper(数字转大写)，toLower(大写转数字)
const conversionMode = ref('toUpper');

// 转换选项
const options = ref({
  addPrefix: true,         // 添加"人民币"前缀
  traditionalChars: false, // 使用繁体字
  addZeroWhenInteger: true // 整数添加"整"字
});

// 数字映射表
const numberMap = {
  0: '零',
  1: '壹',
  2: '贰',
  3: '叁',
  4: '肆',
  5: '伍',
  6: '陆',
  7: '柒',
  8: '捌',
  9: '玖'
};

// 繁体数字映射表
const traditionalNumberMap = {
  0: '零',
  1: '壹',
  2: '贰',
  3: '叁',
  4: '肆',
  5: '伍',
  6: '陆',
  7: '柒',
  8: '捌',
  9: '玖'
};

// 单位映射表
const unitMap = ['', '拾', '佰', '仟'];
const sectionUnitMap = ['', '万', '亿', '兆'];

// 输入框占位符
const getPlaceholder = computed(() => {
  return conversionMode.value === 'toUpper' 
    ? '请输入数字金额，如：123.45' 
    : '请输入中文大写金额，如：壹佰贰拾叁元肆角伍分';
});

// 是否可以转换
const canConvert = computed(() => {
  if (!inputAmount.value) return false;
  if (conversionMode.value === 'toUpper' && inputError.value) return false;
  return true;
});

// 监听输入变化
watch(inputAmount, (newValue) => {
  if (conversionMode.value === 'toUpper') {
    validateInput(newValue);
  }
});

// 验证输入
const validateInput = (value) => {
  if (!value) {
    inputError.value = '';
    return;
  }
  
  // 数字转大写模式下验证输入格式
  if (conversionMode.value === 'toUpper') {
    // 检查是否为有效数字格式
    const regex = /^(0|[1-9]\d{0,11})(\.\d{1,2})?$/;
    if (!regex.test(value)) {
      inputError.value = '请输入有效的金额格式，最多支持12位整数和2位小数';
      return;
    }
    
    // 检查金额是否超出范围
    const numValue = parseFloat(value);
    if (numValue > 9999999999999.99) {
      inputError.value = '金额超出范围，最大支持9999999999999.99';
      return;
    }
    
    inputError.value = '';
  }
};

// 处理输入变化
const handleInput = (value) => {
  if (conversionMode.value === 'toUpper') {
    // 限制只能输入数字和小数点
    inputAmount.value = value.replace(/[^\d.]/g, '');
    
    // 确保只有一个小数点
    const parts = inputAmount.value.split('.');
    if (parts.length > 2) {
      inputAmount.value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // 限制小数点后最多两位
    if (parts.length === 2 && parts[1].length > 2) {
      inputAmount.value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    validateInput(inputAmount.value);
  }
};

// 处理模式变化
const handleModeChange = () => {
  inputAmount.value = '';
  outputAmount.value = '';
  inputError.value = '';
};

// 转换金额
const convertAmount = () => {
  if (!canConvert.value) return;
  
  if (conversionMode.value === 'toUpper') {
    outputAmount.value = convertToUpperCase(inputAmount.value);
  } else {
    outputAmount.value = convertToLowerCase(inputAmount.value);
  }
};

// 数字转大写
const convertToUpperCase = (amount) => {
  // 处理空值
  if (!amount) return '';
  
  // 分割整数和小数部分
  let [integer, decimal] = amount.split('.');
  if (!decimal) decimal = '00';
  else if (decimal.length === 1) decimal += '0';
  
  // 处理整数部分
  let result = '';
  
  // 处理整数为0的情况
  if (parseInt(integer) === 0) {
    result = '零元';
  } else {
    // 将整数部分按4位分段
    const sections = [];
    while (integer.length > 0) {
      sections.unshift(integer.slice(Math.max(0, integer.length - 4), integer.length));
      integer = integer.slice(0, Math.max(0, integer.length - 4));
    }
    
    // 处理每个段
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      let sectionResult = '';
      let hasValue = false;
      let lastIsZero = true;
      
      // 处理每一位
      for (let j = 0; j < section.length; j++) {
        const digit = parseInt(section[j]);
        
        if (digit === 0) {
          // 当前数字是0
          // 只有当不是最后一位且下一位不是0时，才添加"零"
          if (!lastIsZero && j < section.length - 1 && parseInt(section[j + 1]) !== 0) {
            sectionResult += numberMap[0];
          }
          lastIsZero = true;
        } else {
          // 当前数字不是0
          const numberChar = options.value.traditionalChars ? traditionalNumberMap[digit] : numberMap[digit];
          sectionResult += numberChar + unitMap[section.length - j - 1];
          hasValue = true;
          lastIsZero = false;
        }
      }
      
      // 添加段单位（万、亿等）
      if (hasValue) {
        result += sectionResult + sectionUnitMap[sections.length - i - 1];
      }
    }
    
    result += '元';
  }
  
  // 处理小数部分
  const jiao = parseInt(decimal[0]);
  const fen = parseInt(decimal[1]);
  
  if (jiao === 0 && fen === 0) {
    // 没有角分
    if (options.value.addZeroWhenInteger) {
      result += '整';
    }
  } else {
    // 有角分
    if (jiao === 0) {
      result += '零';
    } else {
      const jiaoChar = options.value.traditionalChars ? traditionalNumberMap[jiao] : numberMap[jiao];
      result += jiaoChar + '角';
    }
    
    if (fen !== 0) {
      const fenChar = options.value.traditionalChars ? traditionalNumberMap[fen] : numberMap[fen];
      result += fenChar + '分';
    }
  }
  
  // 添加前缀
  if (options.value.addPrefix) {
    result = '人民币' + result;
  }
  
  return result;
};

// 大写转数字
const convertToLowerCase = (amount) => {
  // 这个功能比较复杂，需要处理各种中文大写金额的格式
  // 这里提供一个简化版本，仅支持标准格式的转换
  
  // 移除前缀
  let text = amount.replace(/^人民币/, '');
  
  // 创建反向映射表
  const reverseNumberMap = {};
  for (const [key, value] of Object.entries(numberMap)) {
    reverseNumberMap[value] = key;
  }
  for (const [key, value] of Object.entries(traditionalNumberMap)) {
    reverseNumberMap[value] = key;
  }
  
  // 分割元、角、分
  const yuanMatch = text.match(/(.*?)元/);
  const jiaoMatch = text.match(/元(.*?)角/);
  const fenMatch = text.match(/角(.*?)分/);
  const zhengMatch = text.match(/元整/);
  
  let result = '';
  
  // 处理整数部分
  if (yuanMatch) {
    let yuanPart = yuanMatch[1];
    
    // 替换单位
    yuanPart = yuanPart.replace(/兆/g, '');
    yuanPart = yuanPart.replace(/亿/g, '');
    yuanPart = yuanPart.replace(/万/g, '');
    yuanPart = yuanPart.replace(/仟/g, '000');
    yuanPart = yuanPart.replace(/佰/g, '00');
    yuanPart = yuanPart.replace(/拾/g, '0');
    
    // 替换数字
    for (const [char, digit] of Object.entries(reverseNumberMap)) {
      yuanPart = yuanPart.replace(new RegExp(char, 'g'), digit);
    }
    
    // 处理零
    yuanPart = yuanPart.replace(/0+/g, '0');
    if (yuanPart.startsWith('0')) yuanPart = yuanPart.substring(1);
    
    result = yuanPart || '0';
  } else {
    result = '0';
  }
  
  // 处理小数部分
  let decimalPart = '';
  
  if (jiaoMatch) {
    const jiaoPart = jiaoMatch[1];
    for (const [char, digit] of Object.entries(reverseNumberMap)) {
      if (jiaoPart.includes(char)) {
        decimalPart += digit;
        break;
      }
    }
  } else {
    decimalPart += '0';
  }
  
  if (fenMatch) {
    const fenPart = fenMatch[1];
    for (const [char, digit] of Object.entries(reverseNumberMap)) {
      if (fenPart.includes(char)) {
        decimalPart += digit;
        break;
      }
    }
  } else {
    decimalPart += '0';
  }
  
  // 如果有小数部分，添加小数点
  if (decimalPart !== '00' && !zhengMatch) {
    result += '.' + decimalPart;
  }
  
  return result;
};

// 清空输入
const clearInput = () => {
  inputAmount.value = '';
  outputAmount.value = '';
  inputError.value = '';
};

// 复制到剪贴板
const copyToClipboard = () => {
  if (!outputAmount.value) return;
  
  navigator.clipboard.writeText(outputAmount.value)
    .then(() => {
      ElMessage.success('已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制');
    });
};

// 从剪贴板粘贴
const pasteFromClipboard = () => {
  navigator.clipboard.readText()
    .then(text => {
      inputAmount.value = text;
      if (conversionMode.value === 'toUpper') {
        validateInput(text);
      }
      ElMessage.success('已从剪贴板粘贴');
    })
    .catch(() => {
      ElMessage.error('粘贴失败，请手动粘贴');
    });
};

// 交换输入和输出
const swapInputOutput = () => {
  if (!outputAmount.value) return;
  
  const temp = inputAmount.value;
  inputAmount.value = outputAmount.value;
  outputAmount.value = temp;
  
  // 切换转换模式
  conversionMode.value = conversionMode.value === 'toUpper' ? 'toLower' : 'toUpper';
  
  if (conversionMode.value === 'toUpper') {
    validateInput(inputAmount.value);
  } else {
    inputError.value = '';
  }
};

// 设置示例金额
const setSampleAmount = (type) => {
  switch (type) {
    case 'small':
      inputAmount.value = '123.45';
      break;
    case 'medium':
      inputAmount.value = '12345.67';
      break;
    case 'large':
      inputAmount.value = '1234567.89';
      break;
    case 'huge':
      inputAmount.value = '100000000.00';
      break;
  }
  
  if (conversionMode.value === 'toUpper') {
    validateInput(inputAmount.value);
  }
  
  outputAmount.value = '';
};
</script>

<style lang="scss" scoped>
.rmb-converter {
  .converter-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .converter-header {
      margin-bottom: 20px;
      
      h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: var(--text-color, #333);
      }
      
      .description {
        color: var(--text-color-light, #666);
        margin: 0;
      }
    }
    
    .main-content {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 20px;
      margin-bottom: 20px;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
      
      .input-section, .output-section {
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          
          .section-title {
            font-weight: bold;
            color: var(--text-color, #333);
          }
          
          .input-controls, .output-controls {
            display: flex;
            gap: 8px;
          }
        }
        
        .input-wrapper {
          display: flex;
          align-items: center;
          
          .input-prefix {
            margin-right: 8px;
            font-weight: bold;
            color: var(--text-color, #333);
          }
        }
        
        .error-message {
          margin-top: 8px;
        }
        
        .output-wrapper {
          padding: 12px;
          min-height: 24px;
          border: 1px solid var(--border-color, #eee);
          border-radius: 4px;
          background-color: var(--secondary-background, #f9f9f9);
          
          .output-content {
            color: var(--text-color, #333);
            word-break: break-all;
            line-height: 1.5;
          }
        }
      }
      
      .action-panel {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 20px;
        padding: 0 10px;
        
        @media (max-width: 768px) {
          flex-direction: row;
          flex-wrap: wrap;
          padding: 10px 0;
        }
        
        .conversion-controls {
          display: flex;
          justify-content: center;
        }
        
        .conversion-button {
          display: flex;
          justify-content: center;
        }
        
        .option-panel {
          border: 1px solid var(--border-color, #eee);
          border-radius: 6px;
          padding: 10px;
          
          .option-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--text-color, #333);
          }
          
          .el-checkbox {
            display: block;
            margin-bottom: 8px;
          }
        }
        
        .sample-text {
          .sample-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--text-color, #333);
            text-align: center;
          }
          
          .sample-list {
            .sample-item {
              margin-bottom: 8px;
              padding: 6px;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.2s;
              
              &:hover {
                background-color: var(--hover-bg, #f5f7fa);
              }
              
              .sample-label {
                font-weight: bold;
                margin-right: 5px;
                color: var(--text-color, #333);
              }
              
              .sample-content {
                color: var(--text-color-light, #666);
              }
            }
          }
        }
      }
    }
    
    .converter-info {
      .info-content {
        padding: 10px;
        
        h4 {
          margin-top: 0;
          margin-bottom: 12px;
          color: var(--text-color, #333);
        }
        
        p {
          margin: 8px 0;
          color: var(--text-color, #333);
        }
        
        ul {
          margin: 8px 0;
          padding-left: 20px;
          
          li {
            margin-bottom: 6px;
            color: var(--text-color, #333);
          }
        }
        
        .conversion-table {
          margin: 15px 0;
          border: 1px solid var(--border-color, #eee);
          border-radius: 4px;
          overflow: hidden;
          
          .table-row {
            display: flex;
            
            &:not(:last-child) {
              border-bottom: 1px solid var(--border-color, #eee);
            }
            
            .table-cell {
              flex: 1;
              padding: 8px;
              text-align: center;
              
              &:not(:last-child) {
                border-right: 1px solid var(--border-color, #eee);
              }
              
              &:first-child {
                background-color: var(--secondary-background, #f9f9f9);
                font-weight: bold;
              }
            }
          }
        }
      }
    }
  }
}
</style> 