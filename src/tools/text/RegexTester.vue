<template>
  <div class="regex-tester">
    <div class="tester-container">
      <div class="tester-header">
        <h3>正则表达式测试</h3>
        <p class="description">测试和验证正则表达式，实时查看匹配结果</p>
      </div>
      
      <div class="tester-content">
        <div class="regex-input-section">
          <div class="input-group">
            <div class="input-header">
              <span class="input-label">正则表达式</span>
              <div class="input-controls">
                <el-button size="small" @click="clearRegex" :disabled="!regex">
                  <el-icon><Delete /></el-icon> 清空
                </el-button>
                <el-tooltip content="点击加载示例正则表达式" placement="top">
                  <el-button size="small" @click="loadSampleRegex">
                    <el-icon><Refresh /></el-icon> 示例
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            
            <div class="regex-pattern">
              <span class="pattern-delimiter">/</span>
              <el-input
                v-model="regex"
                placeholder="输入正则表达式..."
                :class="{ 'is-invalid': regexError }"
                @input="validateAndTest"
              />
              <span class="pattern-delimiter">/</span>
              <el-input
                v-model="flags"
                class="flags-input"
                placeholder="flags"
                @input="validateAndTest"
              />
            </div>
            
            <div v-if="regexError" class="error-message">
              <el-alert
                :title="regexError"
                type="error"
                :closable="false"
                show-icon
              />
            </div>
          </div>
          
          <div class="input-group">
            <div class="input-header">
              <span class="input-label">测试文本</span>
              <div class="input-controls">
                <el-button size="small" @click="clearText" :disabled="!testText">
                  <el-icon><Delete /></el-icon> 清空
                </el-button>
                <el-button size="small" @click="pasteFromClipboard">
                  <el-icon><DocumentCopy /></el-icon> 粘贴
                </el-button>
              </div>
            </div>
            
            <el-input
              v-model="testText"
              type="textarea"
              :rows="6"
              placeholder="输入要测试的文本..."
              resize="none"
              @input="validateAndTest"
            />
          </div>
        </div>
        
        <div class="regex-options">
          <div class="options-group">
            <span class="group-label">常用标志：</span>
            <el-checkbox-group v-model="selectedFlags" @change="updateFlags">
              <el-checkbox label="g">全局匹配 (g)</el-checkbox>
              <el-checkbox label="i">忽略大小写 (i)</el-checkbox>
              <el-checkbox label="m">多行模式 (m)</el-checkbox>
              <el-checkbox label="s">点号匹配所有字符 (s)</el-checkbox>
              <el-checkbox label="u">Unicode模式 (u)</el-checkbox>
            </el-checkbox-group>
          </div>
          
          <div class="options-group">
            <span class="group-label">匹配模式：</span>
            <el-radio-group v-model="matchMode" @change="validateAndTest">
              <el-radio-button label="test">测试匹配</el-radio-button>
              <el-radio-button label="match">提取匹配</el-radio-button>
              <el-radio-button label="replace">替换匹配</el-radio-button>
            </el-radio-group>
          </div>
          
          <div v-if="matchMode === 'replace'" class="replace-input">
            <span class="input-label">替换文本：</span>
            <el-input
              v-model="replaceText"
              placeholder="输入替换文本..."
              @input="validateAndTest"
            >
              <template #append>
                <el-tooltip content="在替换文本中可以使用$1, $2等引用捕获组" placement="top">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </div>
        </div>
        
        <div class="match-results" v-if="testText && !regexError">
          <div class="results-header">
            <h4>匹配结果</h4>
            <div class="results-stats">
              <template v-if="matchMode === 'test'">
                {{ matchResults.length > 0 ? '匹配成功' : '无匹配' }}
              </template>
              <template v-else>
                找到 {{ matchResults.length }} 处匹配
              </template>
            </div>
          </div>
          
          <div v-if="matchMode === 'test'" class="test-results">
            <div class="highlighted-text" v-html="highlightedText"></div>
          </div>
          
          <div v-else-if="matchMode === 'match'" class="match-list">
            <template v-if="matchResults.length > 0">
              <div v-for="(match, index) in matchResults" :key="index" class="match-item">
                <div class="match-header">
                  <span class="match-index">匹配 #{{ index + 1 }}</span>
                  <div class="match-controls">
                    <el-button size="small" @click="copyMatch(match)">
                      <el-icon><DocumentCopy /></el-icon> 复制
                    </el-button>
                  </div>
                </div>
                
                <div class="match-content">
                  <div class="full-match">
                    <span class="label">完整匹配：</span>
                    <pre>{{ match[0] }}</pre>
                  </div>
                  
                  <template v-if="match.length > 1">
                    <div class="capture-groups">
                      <div v-for="(group, groupIndex) in match.slice(1)" :key="groupIndex" class="group-item">
                        <span class="label">捕获组 {{ groupIndex + 1 }}：</span>
                        <pre>{{ group }}</pre>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
            <el-empty v-else description="没有找到匹配项" />
          </div>
          
          <div v-else-if="matchMode === 'replace'" class="replace-results">
            <div class="replace-preview">
              <div class="preview-header">
                <span>替换预览：</span>
                <el-button size="small" @click="copyReplacedText" :disabled="!replacedText">
                  <el-icon><DocumentCopy /></el-icon> 复制结果
                </el-button>
              </div>
              <pre>{{ replacedText }}</pre>
            </div>
          </div>
        </div>
        
        <div class="regex-info">
          <el-collapse>
            <el-collapse-item title="正则表达式语法参考" name="syntax">
              <div class="info-content">
                <h4>常用元字符</h4>
                <ul>
                  <li><code>.</code> - 匹配除换行符外的任意字符</li>
                  <li><code>^</code> - 匹配行首</li>
                  <li><code>$</code> - 匹配行尾</li>
                  <li><code>\w</code> - 匹配字母、数字、下划线</li>
                  <li><code>\d</code> - 匹配数字</li>
                  <li><code>\s</code> - 匹配空白字符</li>
                  <li><code>[abc]</code> - 匹配方括号中的任意字符</li>
                  <li><code>(xyz)</code> - 捕获组</li>
                </ul>
                
                <h4>数量词</h4>
                <ul>
                  <li><code>?</code> - 零次或一次</li>
                  <li><code>+</code> - 一次或多次</li>
                  <li><code>*</code> - 零次或多次</li>
                  <li><code>{n}</code> - 恰好n次</li>
                  <li><code>{n,}</code> - 至少n次</li>
                  <li><code>{n,m}</code> - n到m次</li>
                </ul>
                
                <h4>标志说明</h4>
                <ul>
                  <li><code>g</code> - 全局匹配，查找所有匹配项</li>
                  <li><code>i</code> - 忽略大小写</li>
                  <li><code>m</code> - 多行模式，改变^和$的行为</li>
                  <li><code>s</code> - 允许.匹配换行符</li>
                  <li><code>u</code> - Unicode模式</li>
                </ul>
              </div>
            </el-collapse-item>
            
            <el-collapse-item title="常用正则表达式示例" name="examples">
              <div class="info-content">
                <div class="example-list">
                  <div v-for="(example, index) in regexExamples" :key="index" class="example-item">
                    <div class="example-header">
                      <span class="example-name">{{ example.name }}</span>
                      <el-button size="small" @click="useExample(example)">
                        使用此示例
                      </el-button>
                    </div>
                    <div class="example-pattern">
                      <code>{{ example.pattern }}</code>
                    </div>
                    <div class="example-description">
                      {{ example.description }}
                    </div>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, DocumentCopy, QuestionFilled, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';

// 输入数据
const regex = ref('');
const flags = ref('');
const testText = ref('');
const replaceText = ref('');
const regexError = ref('');
const selectedFlags = ref([]);
const matchMode = ref('test');

// 正则表达式示例
const regexExamples = [
  {
    name: '电子邮箱',
    pattern: '^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)+$',
    description: '匹配标准电子邮箱地址格式'
  },
  {
    name: '手机号码',
    pattern: '^1[3-9]\\d{9}$',
    description: '匹配中国大陆手机号码格式'
  },
  {
    name: 'URL地址',
    pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$',
    description: '匹配网址URL格式，支持http和https'
  },
  {
    name: '日期格式',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    description: '匹配YYYY-MM-DD格式的日期'
  },
  {
    name: 'HTML标签',
    pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)',
    description: '匹配HTML标签，包含开闭标签'
  }
];

// 计算匹配结果
const matchResults = computed(() => {
  if (!regex.value || !testText.value || regexError.value) {
    return [];
  }
  
  try {
    const re = new RegExp(regex.value, flags.value);
    const results = [];
    let match;
    
    if (flags.value.includes('g')) {
      while ((match = re.exec(testText.value)) !== null) {
        results.push([...match]);
      }
    } else {
      match = testText.value.match(re);
      if (match) {
        results.push([...match]);
      }
    }
    
    return results;
  } catch (error) {
    return [];
  }
});

// 计算替换后的文本
const replacedText = computed(() => {
  if (!regex.value || !testText.value || regexError.value) {
    return testText.value;
  }
  
  try {
    const re = new RegExp(regex.value, flags.value);
    return testText.value.replace(re, replaceText.value || '');
  } catch (error) {
    return testText.value;
  }
});

// 计算高亮显示的文本
const highlightedText = computed(() => {
  if (!regex.value || !testText.value || regexError.value) {
    return escapeHtml(testText.value);
  }
  
  try {
    const re = new RegExp(regex.value, flags.value);
    return testText.value.replace(re, match => 
      `<span class="highlight">${escapeHtml(match)}</span>`
    );
  } catch (error) {
    return escapeHtml(testText.value);
  }
});

// 验证正则表达式并执行测试
const validateAndTest = () => {
  if (!regex.value) {
    regexError.value = '';
    return;
  }
  
  try {
    new RegExp(regex.value, flags.value);
    regexError.value = '';
  } catch (error) {
    regexError.value = error.message;
  }
};

// 更新正则表达式标志
const updateFlags = () => {
  flags.value = selectedFlags.value.join('');
  validateAndTest();
};

// 监听flags输入变化
watch(flags, (newFlags) => {
  selectedFlags.value = newFlags.split('');
});

// 清空输入
const clearRegex = () => {
  regex.value = '';
  flags.value = '';
  selectedFlags.value = [];
  regexError.value = '';
};

const clearText = () => {
  testText.value = '';
};

// 从剪贴板粘贴
const pasteFromClipboard = () => {
  navigator.clipboard.readText()
    .then(text => {
      testText.value = text;
      validateAndTest();
      ElMessage.success('已从剪贴板粘贴文本');
    })
    .catch(() => {
      ElMessage.error('粘贴失败，请手动粘贴');
    });
};

// 复制匹配结果
const copyMatch = (match) => {
  navigator.clipboard.writeText(match[0])
    .then(() => {
      ElMessage.success('已复制匹配内容到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败');
    });
};

// 复制替换结果
const copyReplacedText = () => {
  navigator.clipboard.writeText(replacedText.value)
    .then(() => {
      ElMessage.success('已复制替换结果到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败');
    });
};

// 加载示例正则表达式
const loadSampleRegex = () => {
  const example = regexExamples[Math.floor(Math.random() * regexExamples.length)];
  regex.value = example.pattern;
  validateAndTest();
};

// 使用指定示例
const useExample = (example) => {
  regex.value = example.pattern;
  validateAndTest();
};

// HTML转义
const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
</script>

<style lang="scss" scoped>
.regex-tester {
  .tester-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .tester-header {
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
    
    .tester-content {
      .regex-input-section {
        margin-bottom: 20px;
        
        .input-group {
          margin-bottom: 15px;
          
          .input-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            
            .input-label {
              font-weight: bold;
              color: var(--text-color, #333);
            }
            
            .input-controls {
              display: flex;
              gap: 8px;
            }
          }
          
          .regex-pattern {
            display: flex;
            align-items: center;
            gap: 5px;
            
            .pattern-delimiter {
              font-size: 1.2em;
              color: var(--text-color, #333);
              user-select: none;
            }
            
            .flags-input {
              width: 100px;
            }
            
            :deep(.el-input.is-invalid) {
              .el-input__wrapper {
                box-shadow: 0 0 0 1px var(--el-color-danger) inset;
              }
            }
          }
          
          .error-message {
            margin-top: 8px;
          }
        }
      }
      
      .regex-options {
        margin-bottom: 20px;
        padding: 15px;
        border-radius: 8px;
        background-color: var(--secondary-background, #f9f9f9);
        
        .options-group {
          margin-bottom: 15px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .group-label {
            font-weight: bold;
            color: var(--text-color, #333);
            margin-right: 10px;
          }
        }
        
        .replace-input {
          margin-top: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          
          .input-label {
            font-weight: bold;
            color: var(--text-color, #333);
            white-space: nowrap;
          }
        }
      }
      
      .match-results {
        margin-top: 20px;
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          
          h4 {
            margin: 0;
            color: var(--text-color, #333);
          }
          
          .results-stats {
            color: var(--text-color-light, #666);
          }
        }
        
        .test-results {
          .highlighted-text {
            padding: 10px;
            border-radius: 6px;
            background-color: var(--secondary-background, #f9f9f9);
            white-space: pre-wrap;
            
            :deep(.highlight) {
              background-color: rgba(255, 193, 7, 0.3);
              border-radius: 2px;
            }
          }
        }
        
        .match-list {
          .match-item {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid var(--border-color, #eee);
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .match-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              
              .match-index {
                font-weight: bold;
                color: var(--text-color, #333);
              }
            }
            
            .match-content {
              .full-match, .group-item {
                margin-bottom: 8px;
                
                &:last-child {
                  margin-bottom: 0;
                }
                
                .label {
                  color: var(--text-color-light, #666);
                }
                
                pre {
                  margin: 5px 0 0;
                  padding: 5px;
                  background-color: var(--secondary-background, #f9f9f9);
                  border-radius: 4px;
                  white-space: pre-wrap;
                }
              }
            }
          }
        }
        
        .replace-results {
          .replace-preview {
            .preview-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              
              span {
                font-weight: bold;
                color: var(--text-color, #333);
              }
            }
            
            pre {
              margin: 0;
              padding: 10px;
              background-color: var(--secondary-background, #f9f9f9);
              border-radius: 6px;
              white-space: pre-wrap;
            }
          }
        }
      }
      
      .regex-info {
        margin-top: 20px;
        
        .info-content {
          padding: 10px;
          
          h4 {
            margin-top: 0;
            margin-bottom: 12px;
            color: var(--text-color, #333);
          }
          
          ul {
            margin: 8px 0;
            padding-left: 20px;
            
            li {
              margin-bottom: 6px;
              color: var(--text-color, #333);
              
              code {
                background-color: var(--secondary-background, #f5f7fa);
                padding: 2px 4px;
                border-radius: 4px;
                font-family: monospace;
              }
            }
          }
          
          .example-list {
            .example-item {
              margin-bottom: 15px;
              padding: 10px;
              border-radius: 6px;
              border: 1px solid var(--border-color, #eee);
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .example-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                
                .example-name {
                  font-weight: bold;
                  color: var(--text-color, #333);
                }
              }
              
              .example-pattern {
                margin-bottom: 8px;
                
                code {
                  display: block;
                  padding: 5px;
                  background-color: var(--secondary-background, #f5f7fa);
                  border-radius: 4px;
                  font-family: monospace;
                  white-space: pre-wrap;
                }
              }
              
              .example-description {
                color: var(--text-color-light, #666);
                font-size: 0.9em;
              }
            }
          }
        }
      }
    }
  }
}

// 深色模式调整
:deep(.dark-mode) {
  .regex-tester {
    .tester-container {
      .tester-content {
        .match-results {
          .test-results {
            .highlighted-text {
              :deep(.highlight) {
                background-color: rgba(255, 193, 7, 0.2);
              }
            }
          }
        }
      }
    }
  }
}
</style>