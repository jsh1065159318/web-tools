<template>
  <div class="fullwidth-halfwidth-converter">
    <div class="converter-container">
      <div class="converter-header">
        <h3>全角半角转换</h3>
        <p class="description">在全角字符和半角字符之间转换文本，适用于中英文混排的标点符号规范化</p>
      </div>
      
      <div class="main-content">
        <div class="input-section">
          <div class="section-header">
            <span class="section-title">输入文本</span>
            <div class="input-controls">
              <el-button size="small" @click="clearInput" :disabled="!inputText">
                <el-icon><Delete /></el-icon> 清空
              </el-button>
              <el-button size="small" @click="pasteFromClipboard">
                <el-icon><DocumentCopy /></el-icon> 粘贴
              </el-button>
            </div>
          </div>
          
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="8"
            placeholder="请输入需要转换的文本..."
            resize="none"
          ></el-input>
          
          <div class="character-count">
            <span>{{ getCharacterCount }}</span>
          </div>
        </div>
        
        <div class="action-panel">
          <div class="conversion-controls">
            <el-button type="primary" @click="convertToHalfWidth" :disabled="!inputText" class="conversion-button">
              转换为半角 →
            </el-button>
            
            <el-button type="primary" @click="convertToFullWidth" :disabled="!inputText" class="conversion-button">
              转换为全角 →
            </el-button>
          </div>
          
          <div class="option-panel">
            <div class="option-title">转换选项</div>
            <el-checkbox v-model="options.convertSpace">转换空格</el-checkbox>
            <el-checkbox v-model="options.convertPunctuation">转换标点符号</el-checkbox>
            <el-checkbox v-model="options.convertAlphanumeric">转换字母和数字</el-checkbox>
            <el-checkbox v-model="options.convertKatakana" v-if="options.showJapaneseOptions">转换日文片假名</el-checkbox>
          </div>
          
          <div class="sample-text">
            <div class="sample-title">示例文本</div>
            <div class="sample-list">
              <div class="sample-item" @click="setSampleText('half')">
                <span class="sample-label">半角示例:</span>
                <span class="sample-content">Hello! This is a test, 123.</span>
              </div>
              <div class="sample-item" @click="setSampleText('full')">
                <span class="sample-label">全角示例:</span>
                <span class="sample-content">Ｈｅｌｌｏ！　Ｔｈｉｓ　ｉｓ　ａ　ｔｅｓｔ，　１２３．</span>
              </div>
              <div class="sample-item" @click="setSampleText('mixed')">
                <span class="sample-label">混合示例:</span>
                <span class="sample-content">你好！This is 混合文本，123.</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="output-section">
          <div class="section-header">
            <span class="section-title">转换结果</span>
            <div class="output-controls">
              <el-button size="small" @click="copyToClipboard" :disabled="!outputText">
                <el-icon><DocumentCopy /></el-icon> 复制
              </el-button>
              <el-button size="small" @click="swapTexts" :disabled="!outputText">
                <el-icon><RefreshRight /></el-icon> 交换
              </el-button>
            </div>
          </div>
          
          <el-input
            v-model="outputText"
            type="textarea"
            :rows="8"
            placeholder="转换结果将显示在此处..."
            readonly
            resize="none"
          ></el-input>
          
          <div class="character-count">
            <span>{{ getOutputCharacterCount }}</span>
          </div>
        </div>
      </div>
      
      <div class="converter-info">
        <el-collapse>
          <el-collapse-item title="全角和半角的区别" name="difference">
            <div class="info-content">
              <h4>什么是全角和半角？</h4>
              <p>全角和半角是文字宽度的不同表现形式。</p>
              
              <h5>全角字符：</h5>
              <ul>
                <li>占用两个标准字符位置（即"全"两个位置）</li>
                <li>主要用于中文、日文等东亚文字排版</li>
                <li>全角标点和符号在中文排版中使用，如：『，』『。』『！』『（）』</li>
                <li>全角字母、数字看起来比较宽，如：『Ａ』『１』</li>
              </ul>
              
              <h5>半角字符：</h5>
              <ul>
                <li>占用一个标准字符位置（即"半"个位置）</li>
                <li>主要用于英文、代码等西文排版</li>
                <li>半角标点和符号在英文排版中使用，如：[,] [.] [!] [()] </li>
                <li>半角字母、数字是标准宽度，如：[A] [1]</li>
              </ul>
              
              <h4>常见使用场景：</h4>
              <ul>
                <li>规范化中英文混排文档中的标点符号</li>
                <li>数据处理过程中统一字符表示</li>
                <li>修正OCR文字识别结果中的宽度问题</li>
                <li>调整程序代码或配置文件中的特殊字符格式</li>
                <li>排版设计时控制字符对齐</li>
              </ul>
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="转换规则说明" name="rules">
            <div class="info-content">
              <h4>全角转半角规则：</h4>
              <ul>
                <li>全角空格 『　』 → 半角空格 [ ]</li>
                <li>全角标点如 『，』『。』『！』『？』『：』『；』 → 半角标点如 [,] [.] [!] [?] [:] [;]</li>
                <li>全角字母如 『Ａ』『Ｂ』『Ｃ』 → 半角字母如 [A] [B] [C]</li>
                <li>全角数字如 『１』『２』『３』 → 半角数字如 [1] [2] [3]</li>
              </ul>
              
              <h4>半角转全角规则：</h4>
              <ul>
                <li>半角空格 [ ] → 全角空格 『　』</li>
                <li>半角标点如 [,] [.] [!] [?] [:] [;] → 全角标点如 『，』『。』『！』『？』『：』『；』</li>
                <li>半角字母如 [A] [B] [C] → 全角字母如 『Ａ』『Ｂ』『Ｃ』</li>
                <li>半角数字如 [1] [2] [3] → 全角数字如 『１』『２』『３』</li>
              </ul>
              
              <h4>转换选项说明：</h4>
              <ul>
                <li><strong>转换空格</strong>：控制是否将全角空格与半角空格互相转换</li>
                <li><strong>转换标点符号</strong>：控制是否将全角标点与半角标点互相转换</li>
                <li><strong>转换字母和数字</strong>：控制是否将全角字母数字与半角字母数字互相转换</li>
                <li><strong>转换日文片假名</strong>：控制是否转换日文片假名字符（仅在特定语言环境下显示）</li>
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
import { computed, ref } from 'vue';

// 文本输入和输出
const inputText = ref('');
const outputText = ref('');

// 转换选项
const options = ref({
  convertSpace: true,
  convertPunctuation: true,
  convertAlphanumeric: true,
  convertKatakana: false,
  showJapaneseOptions: false // 是否显示日文相关选项，可根据需求开启
});

// 获取字符数统计
const getCharacterCount = computed(() => {
  if (!inputText.value) return '0 个字符';
  return `${inputText.value.length} 个字符`;
});

// 获取输出字符数统计
const getOutputCharacterCount = computed(() => {
  if (!outputText.value) return '0 个字符';
  return `${outputText.value.length} 个字符`;
});

// 全角转半角映射表
const fullToHalfMap = [
  ['，', ','],
  ['。', '.'],
  ['！', '!'],
  ['？', '?'],
  ['：', ':'],
  ['；', ';'],
  ['（', '('],
  ['）', ')'],
  ['【', '['],
  ['】', ']'],
  ['「', '{'],
  ['」', '}'],
  ['＂', '"'],
  ['＇', "'"],
  ['·', '`'],
  ['—', '-'],
  ['……', '^'],
  ['、', '\\'],
  ['／', '/'],
  ['《', '<'],
  ['》', '>']
];

// 半角转全角映射表
const halfToFullMap = [
  [',', '，'],
  ['.', '。'],
  ['!', '！'],
  ['?', '？'],
  [':', '：'],
  [';', '；'],
  ['(', '（'],
  [')', '）'],
  ['[', '【'],
  [']', '】'],
  ['{', '「'],
  ['}', '」'],
  ['"', '＂'],
  ["'", '＇'],
  ['`', '·'],
  ['-', '—'],
  ['^', '……'],
  ['\\', '、'],
  ['/', '／'],
  ['<', '《'],
  ['>', '》']
];

// 全角转半角
const convertToHalfWidth = () => {
  if (!inputText.value) return;
  
  let result = inputText.value;
  
  // 处理标点符号
  if (options.value.convertPunctuation) {
    for (const [full, half] of fullToHalfMap) {
      result = result.split(full).join(half);
    }
  }
  
  // 处理全角字母数字
  if (options.value.convertAlphanumeric) {
    let tempResult = '';
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      const code = char.charCodeAt(0);
      
      // 全角字符范围
      if (code >= 0xFF01 && code <= 0xFF5E) {
        tempResult += String.fromCharCode(code - 0xFEE0);
      } else {
        tempResult += char;
      }
    }
    result = tempResult;
  }
  
  // 处理全角空格
  if (options.value.convertSpace) {
    result = result.split('\u3000').join(' ');
  }
  
  outputText.value = result;
  ElMessage.success('已转换为半角');
};

// 半角转全角
const convertToFullWidth = () => {
  if (!inputText.value) return;
  
  let result = inputText.value;
  
  // 处理标点符号
  if (options.value.convertPunctuation) {
    for (const [half, full] of halfToFullMap) {
      result = result.split(half).join(full);
    }
  }
  
  // 处理半角字母数字
  if (options.value.convertAlphanumeric) {
    let tempResult = '';
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      const code = char.charCodeAt(0);
      
      // ASCII码范围内的字母和数字
      if (code >= 0x21 && code <= 0x7E) {
        // 排除已经处理过的标点符号
        const punctuations = ',.!?:;()[]{}"\'\`-^\\/<>';
        let isPunctuation = false;
        
        if (options.value.convertPunctuation) {
          for (let j = 0; j < punctuations.length; j++) {
            if (char === punctuations[j]) {
              isPunctuation = true;
              break;
            }
          }
        }
        
        if (isPunctuation) {
          tempResult += char;
        } else {
          // 转换为全角
          tempResult += String.fromCharCode(code + 0xFEE0);
        }
      } else {
        tempResult += char;
      }
    }
    result = tempResult;
  }
  
  // 处理半角空格
  if (options.value.convertSpace) {
    result = result.split(' ').join('\u3000');
  }
  
  outputText.value = result;
  ElMessage.success('已转换为全角');
};

// 清空输入
const clearInput = () => {
  inputText.value = '';
  outputText.value = '';
  ElMessage.info('已清空输入文本');
};

// 复制到剪贴板
const copyToClipboard = () => {
  if (!outputText.value) return;
  
  navigator.clipboard.writeText(outputText.value)
    .then(() => {
      ElMessage.success('已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制');
    });
};

// 粘贴从剪贴板
const pasteFromClipboard = () => {
  navigator.clipboard.readText()
    .then(text => {
      inputText.value = text;
      ElMessage.success('已从剪贴板粘贴');
    })
    .catch(() => {
      ElMessage.error('粘贴失败，请手动粘贴');
    });
};

// 交换输入输出
const swapTexts = () => {
  if (!outputText.value) return;
  
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  ElMessage.info('已交换输入和输出文本');
};

// 设置示例文本
const setSampleText = (type) => {
  switch (type) {
    case 'half':
      inputText.value = 'Hello! This is a test, 123.';
      break;
    case 'full':
      inputText.value = 'Ｈｅｌｌｏ！　Ｔｈｉｓ　ｉｓ　ａ　ｔｅｓｔ，　１２３．';
      break;
    case 'mixed':
      inputText.value = '你好！This is 混合文本，123.';
      break;
  }
  
  outputText.value = '';
};
</script>

<style lang="scss" scoped>
.fullwidth-halfwidth-converter {
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
        
        .character-count {
          text-align: right;
          margin-top: 5px;
          font-size: 0.8rem;
          color: var(--text-color-light, #666);
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
          flex-direction: column;
          gap: 10px;
          width: 100%;
          
          @media (max-width: 768px) {
            flex-direction: row;
            justify-content: center;
          }
          
          .conversion-button {
            width: 100%;
            min-width: 140px;
          }
          
          /* 覆盖Element Plus默认样式 */
          .el-button + .el-button {
            margin-left: 0;
          }
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
                word-break: break-all;
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
        
        h5 {
          margin-top: 12px;
          margin-bottom: 8px;
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
      }
    }
  }
}
</style> 