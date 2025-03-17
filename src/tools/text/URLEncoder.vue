<template>
  <div class="url-encoder">
    <div class="encoder-container">
      <div class="encoder-header">
        <h3>URL编码/解码</h3>
        <p class="description">对URL字符串进行编码或解码，适用于网址参数处理和特殊字符转换</p>
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
            placeholder="请输入需要编码或解码的文本..."
            resize="none"
          ></el-input>
          
          <div class="character-count">
            <span>{{ getCharacterCount }}</span>
          </div>
        </div>
        
        <div class="action-panel">
          <div class="mode-selector">
            <span class="mode-label">编码模式：</span>
            <el-radio-group v-model="encodingMode" size="small">
              <el-radio-button label="component">组件编码</el-radio-button>
              <el-radio-button label="full">整体编码</el-radio-button>
            </el-radio-group>
            <el-tooltip
              content="组件编码：只编码URL中的特殊字符，适用于URL参数；整体编码：编码整个字符串，包括斜杠和冒号等"
              placement="top"
            >
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          
          <div class="conversion-controls">
            <el-button 
              type="primary" 
              @click="encodeURL" 
              :disabled="!inputText"
              class="conversion-button"
            >
              编码 →
            </el-button>
            
            <el-button 
              type="primary" 
              @click="decodeURL" 
              :disabled="!inputText"
              class="conversion-button"
            >
              解码 →
            </el-button>
          </div>
          
          <div class="option-panel">
            <div class="option-title">编码选项</div>
            <el-checkbox v-model="options.encodeSpaces" :disabled="encodingMode === 'full'">将空格编码为 + 号（仅组件编码模式）</el-checkbox>
            <el-checkbox v-model="options.decodeSpacePlus" :disabled="encodingMode === 'full'">解码时将 + 号转为空格（仅组件编码模式）</el-checkbox>
          </div>
          
          <div class="sample-text">
            <div class="sample-title">示例文本</div>
            <div class="sample-list">
              <div class="sample-item" @click="setSampleText('url')">
                <span class="sample-label">URL示例:</span>
                <span class="sample-content">https://example.com/path?name=测试&id=123</span>
              </div>
              <div class="sample-item" @click="setSampleText('params')">
                <span class="sample-label">参数示例:</span>
                <span class="sample-content">name=John Doe&age=25&country=中国</span>
              </div>
              <div class="sample-item" @click="setSampleText('encoded')">
                <span class="sample-label">已编码示例:</span>
                <span class="sample-content">name=John%20Doe&age=25&country=%E4%B8%AD%E5%9B%BD</span>
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
            placeholder="编码或解码结果将显示在此处..."
            readonly
            resize="none"
          ></el-input>
          
          <div class="character-count">
            <span>{{ getOutputCharacterCount }}</span>
          </div>
        </div>
      </div>
      
      <div class="encoder-info">
        <el-collapse>
          <el-collapse-item title="URL编码说明" name="url-explanation">
            <div class="info-content">
              <h4>什么是URL编码？</h4>
              <p>URL编码是一种将字符转换为可在URL中安全传输的格式的编码方法。当URL中包含非ASCII字符（如中文、日文等）或特殊字符（如空格、&、#等）时，需要将这些字符转换为特定的编码格式。</p>
              
              <h4>URL编码规则</h4>
              <ul>
                <li>将字符转换为UTF-8编码的字节序列</li>
                <li>对每个字节使用百分号编码（%后跟两位十六进制数字）</li>
                <li>字母、数字和特定符号（-_.~）保持不变</li>
                <li>空格可以编码为加号（+）或 %20</li>
              </ul>
              
              <h4>不同编码方式的区别</h4>
              <table class="encoding-table">
                <tbody>
                <tr>
                  <th>编码类型</th>
                  <th>JavaScript方法</th>
                  <th>适用场景</th>
                </tr>
                <tr>
                  <td>组件编码</td>
                  <td>encodeURIComponent()</td>
                  <td>适用于编码URL中的参数值，会编码特殊字符如 &, ?, =, /, :, ; 等</td>
                </tr>
                <tr>
                  <td>整体编码</td>
                  <td>encodeURI()</td>
                  <td>适用于编码完整URL，不会编码URL结构字符如 /, :, ?, &, = 等</td>
                </tr>
                </tbody>
              </table>
              
              <h4>常见使用场景</h4>
              <ul>
                <li>构造带有中文或特殊字符的URL</li>
                <li>处理URL查询字符串参数</li>
                <li>AJAX请求发送包含特殊字符的数据</li>
                <li>处理表单提交中的特殊字符</li>
              </ul>
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="常见编码字符对照表" name="encoding-table">
            <div class="info-content">
              <h4>常见字符的URL编码</h4>
              <table class="encoding-table">
                <tbody>
                <tr>
                  <th>字符</th>
                  <th>URL编码</th>
                  <th>字符</th>
                  <th>URL编码</th>
                </tr>
                <tr>
                  <td>空格</td>
                  <td>%20 或 +</td>
                  <td>!</td>
                  <td>%21</td>
                </tr>
                <tr>
                  <td>"</td>
                  <td>%22</td>
                  <td>#</td>
                  <td>%23</td>
                </tr>
                <tr>
                  <td>$</td>
                  <td>%24</td>
                  <td>%</td>
                  <td>%25</td>
                </tr>
                <tr>
                  <td>&</td>
                  <td>%26</td>
                  <td>'</td>
                  <td>%27</td>
                </tr>
                <tr>
                  <td>(</td>
                  <td>%28</td>
                  <td>)</td>
                  <td>%29</td>
                </tr>
                <tr>
                  <td>*</td>
                  <td>%2A</td>
                  <td>+</td>
                  <td>%2B</td>
                </tr>
                <tr>
                  <td>,</td>
                  <td>%2C</td>
                  <td>/</td>
                  <td>%2F</td>
                </tr>
                <tr>
                  <td>:</td>
                  <td>%3A</td>
                  <td>;</td>
                  <td>%3B</td>
                </tr>
                <tr>
                  <td>=</td>
                  <td>%3D</td>
                  <td>?</td>
                  <td>%3F</td>
                </tr>
                <tr>
                  <td>@</td>
                  <td>%40</td>
                  <td>[</td>
                  <td>%5B</td>
                </tr>
                <tr>
                  <td>]</td>
                  <td>%5D</td>
                  <td>{</td>
                  <td>%7B</td>
                </tr>
                <tr>
                  <td>}</td>
                  <td>%7D</td>
                  <td>|</td>
                  <td>%7C</td>
                </tr>
                </tbody>
              </table>
              
              <h4>中文字符URL编码示例</h4>
              <table class="encoding-table">
                <tbody>
                <tr>
                  <th>中文字符</th>
                  <th>URL编码</th>
                </tr>
                <tr>
                  <td>中</td>
                  <td>%E4%B8%AD</td>
                </tr>
                <tr>
                  <td>文</td>
                  <td>%E6%96%87</td>
                </tr>
                <tr>
                  <td>测试</td>
                  <td>%E6%B5%8B%E8%AF%95</td>
                </tr>
                <tr>
                  <td>你好</td>
                  <td>%E4%BD%A0%E5%A5%BD</td>
                </tr>
                </tbody>
              </table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, DocumentCopy, QuestionFilled, RefreshRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';

// 文本输入和输出
const inputText = ref('');
const outputText = ref('');
const encodingMode = ref('component');

// 编码选项
const options = ref({
  encodeSpaces: false,
  decodeSpacePlus: true
});

// 获取字符统计
const getCharacterCount = computed(() => {
  if (!inputText.value) return '0 个字符';
  return `${inputText.value.length} 个字符`;
});

// 获取输出字符统计
const getOutputCharacterCount = computed(() => {
  if (!outputText.value) return '0 个字符';
  return `${outputText.value.length} 个字符`;
});

// URL编码处理
const encodeURL = () => {
  if (!inputText.value) return;
  
  try {
    let result = '';
    
    if (encodingMode.value === 'component') {
      // 组件编码 - 使用encodeURIComponent
      result = encodeURIComponent(inputText.value);
      
      // 如果需要将空格编码为+
      if (options.value.encodeSpaces) {
        result = result.replace(/%20/g, '+');
      }
    } else {
      // 整体编码 - 使用encodeURI
      result = encodeURI(inputText.value);
    }
    
    outputText.value = result;
    ElMessage.success('URL编码完成');
  } catch (error) {
    console.error('URL编码失败:', error);
    ElMessage.error('URL编码失败: ' + error.message);
  }
};

// URL解码处理
const decodeURL = () => {
  if (!inputText.value) return;
  
  try {
    let result = '';
    
    // 处理输入文本
    let textToProcess = inputText.value;
    
    // 如果需要将+转为空格（在组件编码模式下）
    if (options.value.decodeSpacePlus && encodingMode.value === 'component') {
      textToProcess = textToProcess.replace(/\+/g, ' ');
    }
    
    if (encodingMode.value === 'component') {
      // 组件解码 - 使用decodeURIComponent
      try {
        result = decodeURIComponent(textToProcess);
      } catch (e) {
        // 如果解码失败，尝试先替换+为%20再解码
        if (textToProcess.includes('+')) {
          result = decodeURIComponent(textToProcess.replace(/\+/g, '%20'));
        } else {
          throw e;
        }
      }
    } else {
      // 整体解码 - 使用decodeURI
      result = decodeURI(textToProcess);
    }
    
    outputText.value = result;
    ElMessage.success('URL解码完成');
  } catch (error) {
    console.error('URL解码失败:', error);
    ElMessage.error('URL解码失败: ' + error.message);
  }
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
    case 'url':
      inputText.value = 'https://example.com/path?name=测试&id=123';
      break;
    case 'params':
      inputText.value = 'name=John Doe&age=25&country=中国';
      break;
    case 'encoded':
      inputText.value = 'name=John%20Doe&age=25&country=%E4%B8%AD%E5%9B%BD';
      break;
  }
  
  outputText.value = '';
};
</script>

<style lang="scss" scoped>
.url-encoder {
  .encoder-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .encoder-header {
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
          padding: 10px 0;
        }
        
        .mode-selector {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          
          .mode-label {
            font-weight: bold;
            color: var(--text-color, #333);
          }
          
          .help-icon {
            color: var(--text-color-light, #999);
            cursor: pointer;
            margin-left: 5px;
          }
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
    
    .encoder-info {
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
        
        .encoding-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          
          th, td {
            border: 1px solid var(--border-color, #eee);
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: var(--secondary-background, #f5f7fa);
            font-weight: bold;
            color: var(--text-color, #333);
          }
          
          td {
            color: var(--text-color, #333);
          }
        }
      }
    }
  }
}
</style> 