<template>
  <div class="html-escaper">
    <div class="escaper-container">
      <div class="escaper-header">
        <h3>HTML转义/反转义</h3>
        <p class="description">转换HTML中的特殊字符和HTML实体，提高网页代码安全性并避免标签解析问题</p>
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
            placeholder="请输入需要转义或反转义的文本..."
            resize="none"
          ></el-input>
          
          <div class="character-count">
            <span>{{ getCharacterCount }}</span>
          </div>
        </div>
        
        <div class="action-panel">
          <div class="conversion-controls">
            <el-button 
              type="primary" 
              @click="escapeHtml" 
              :disabled="!inputText"
              class="conversion-button"
            >
              HTML转义 →
            </el-button>
            
            <el-button 
              type="primary" 
              @click="unescapeHtml" 
              :disabled="!inputText"
              class="conversion-button"
            >
              HTML反转义 →
            </el-button>
          </div>
          
          <div class="option-panel">
            <div class="option-title">转义选项</div>
            <el-checkbox v-model="options.escapeQuotes">转义引号 (' 和 ")</el-checkbox>
            <el-checkbox v-model="options.escapeNewlines">转义换行符</el-checkbox>
            <el-checkbox v-model="options.escapeAllChars">安全模式（转义所有非字母数字）</el-checkbox>
          </div>
          
          <div class="sample-text">
            <div class="sample-title">示例文本</div>
            <div class="sample-list">
              <div class="sample-item" @click="setSampleText('html')">
                <span class="sample-label">HTML代码:</span>
                <span class="sample-content">&lt;div class="container"&gt;Hello&lt;/div&gt;</span>
              </div>
              <div class="sample-item" @click="setSampleText('escaped')">
                <span class="sample-label">已转义:</span>
                <span class="sample-content">&amp;lt;div class=&amp;quot;container&amp;quot;&amp;gt;Hello&amp;lt;/div&amp;gt;</span>
              </div>
              <div class="sample-item" @click="setSampleText('entities')">
                <span class="sample-label">HTML实体:</span>
                <span class="sample-content">版权 &amp;copy; 2023，&amp;lt; 小于，&amp;gt; 大于</span>
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
      
      <div class="preview-section" v-if="showPreview && outputText">
        <div class="preview-header">
          <h4>HTML预览</h4>
          <el-switch v-model="showPreview" active-text="显示预览" inactive-text="隐藏预览"></el-switch>
        </div>
        <div class="preview-content" v-html="previewContent"></div>
      </div>
      
      <div class="escaper-info">
        <el-collapse>
          <el-collapse-item title="HTML转义说明" name="explanation">
            <div class="info-content">
              <h4>什么是HTML转义？</h4>
              <p>HTML转义是将特殊字符（如 &lt;, &gt;, &, ", ' 等）转换为HTML实体的过程，以确保它们在HTML文档中正确显示而不被解析为HTML标签或特殊结构。</p>
              
              <h4>为什么需要HTML转义？</h4>
              <ul>
                <li><strong>防止XSS攻击：</strong>转义用户输入可以防止恶意脚本注入</li>
                <li><strong>正确显示HTML代码：</strong>当需要在网页上显示HTML代码而不是执行它时</li>
                <li><strong>特殊字符显示：</strong>确保特殊字符和符号在网页上正确显示</li>
                <li><strong>避免解析错误：</strong>防止引号、尖括号等特殊字符干扰HTML解析</li>
              </ul>
              
              <h4>主要转义方式</h4>
              <ul>
                <li><strong>命名实体：</strong>使用有意义的名称，如 &amp;lt; 表示 &lt;</li>
                <li><strong>十进制实体：</strong>使用十进制ASCII/Unicode值，如 &amp;#60; 表示 &lt;</li>
                <li><strong>十六进制实体：</strong>使用十六进制ASCII/Unicode值，如 &amp;#x3C; 表示 &lt;</li>
              </ul>
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="常见HTML实体对照表" name="entities-table">
            <div class="info-content">
              <h4>基本HTML实体</h4>
              <table class="entities-table">
                <tr>
                  <th>字符</th>
                  <th>命名实体</th>
                  <th>十进制实体</th>
                  <th>十六进制实体</th>
                  <th>描述</th>
                </tr>
                <tr>
                  <td>&lt;</td>
                  <td>&amp;lt;</td>
                  <td>&amp;#60;</td>
                  <td>&amp;#x3C;</td>
                  <td>小于号</td>
                </tr>
                <tr>
                  <td>&gt;</td>
                  <td>&amp;gt;</td>
                  <td>&amp;#62;</td>
                  <td>&amp;#x3E;</td>
                  <td>大于号</td>
                </tr>
                <tr>
                  <td>&amp;</td>
                  <td>&amp;amp;</td>
                  <td>&amp;#38;</td>
                  <td>&amp;#x26;</td>
                  <td>和号</td>
                </tr>
                <tr>
                  <td>&quot;</td>
                  <td>&amp;quot;</td>
                  <td>&amp;#34;</td>
                  <td>&amp;#x22;</td>
                  <td>双引号</td>
                </tr>
                <tr>
                  <td>'</td>
                  <td>&amp;apos;</td>
                  <td>&amp;#39;</td>
                  <td>&amp;#x27;</td>
                  <td>单引号</td>
                </tr>
                <tr>
                  <td>空格</td>
                  <td>&amp;nbsp;</td>
                  <td>&amp;#160;</td>
                  <td>&amp;#xA0;</td>
                  <td>不换行空格</td>
                </tr>
              </table>
              
              <h4>常用符号实体</h4>
              <table class="entities-table">
                <tr>
                  <th>字符</th>
                  <th>命名实体</th>
                  <th>描述</th>
                </tr>
                <tr>
                  <td>©</td>
                  <td>&amp;copy;</td>
                  <td>版权符号</td>
                </tr>
                <tr>
                  <td>®</td>
                  <td>&amp;reg;</td>
                  <td>注册商标</td>
                </tr>
                <tr>
                  <td>™</td>
                  <td>&amp;trade;</td>
                  <td>商标符号</td>
                </tr>
                <tr>
                  <td>€</td>
                  <td>&amp;euro;</td>
                  <td>欧元符号</td>
                </tr>
                <tr>
                  <td>¥</td>
                  <td>&amp;yen;</td>
                  <td>日元/人民币符号</td>
                </tr>
                <tr>
                  <td>£</td>
                  <td>&amp;pound;</td>
                  <td>英镑符号</td>
                </tr>
                <tr>
                  <td>°</td>
                  <td>&amp;deg;</td>
                  <td>度数符号</td>
                </tr>
                <tr>
                  <td>±</td>
                  <td>&amp;plusmn;</td>
                  <td>正负号</td>
                </tr>
                <tr>
                  <td>×</td>
                  <td>&amp;times;</td>
                  <td>乘号</td>
                </tr>
                <tr>
                  <td>÷</td>
                  <td>&amp;divide;</td>
                  <td>除号</td>
                </tr>
              </table>
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

// 文本输入和输出
const inputText = ref('');
const outputText = ref('');
const showPreview = ref(false);

// 转义选项
const options = ref({
  escapeQuotes: true,
  escapeNewlines: false,
  escapeAllChars: false
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

// 预览内容计算
const previewContent = computed(() => {
  return outputText.value;
});

// 监听输出变化，自动显示预览
watch(outputText, (newValue) => {
  if (newValue && isHtmlContent(newValue)) {
    showPreview.value = true;
  }
});

// 判断内容是否可能是HTML
const isHtmlContent = (text) => {
  return text.includes('&lt;') || text.includes('&gt;') || 
         text.includes('<') || text.includes('>') ||
         text.includes('&amp;') || text.includes('&#');
};

// HTML转义处理
const escapeHtml = () => {
  if (!inputText.value) return;
  
  try {
    let result = inputText.value;
    
    // 基础转义 < > & 
    result = result
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // 根据选项转义引号
    if (options.value.escapeQuotes) {
      result = result
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }
    
    // 根据选项转义换行符
    if (options.value.escapeNewlines) {
      result = result
        .replace(/\n/g, '&#10;')
        .replace(/\r/g, '&#13;');
    }
    
    // 安全模式 - 转义所有非字母数字字符
    if (options.value.escapeAllChars) {
      result = result.replace(/[^\w\s]/g, (char) => {
        return `&#${char.charCodeAt(0)};`;
      });
    }
    
    outputText.value = result;
    ElMessage.success('HTML转义完成');
  } catch (error) {
    console.error('HTML转义失败:', error);
    ElMessage.error('HTML转义失败: ' + error.message);
  }
};

// HTML反转义处理
const unescapeHtml = () => {
  if (!inputText.value) return;
  
  try {
    let result = inputText.value;
    
    // 正则表达式替换所有HTML实体
    result = result
      // 命名实体
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      // 十进制实体
      .replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(dec);
      })
      // 十六进制实体
      .replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    
    outputText.value = result;
    ElMessage.success('HTML反转义完成');
  } catch (error) {
    console.error('HTML反转义失败:', error);
    ElMessage.error('HTML反转义失败: ' + error.message);
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
    case 'html':
      inputText.value = '<div class="container">Hello</div>';
      break;
    case 'escaped':
      inputText.value = '&lt;div class=&quot;container&quot;&gt;Hello&lt;/div&gt;';
      break;
    case 'entities':
      inputText.value = '版权 &copy; 2023，&lt; 小于，&gt; 大于';
      break;
  }
  
  outputText.value = '';
  showPreview.value = false;
};
</script>

<style lang="scss" scoped>
.html-escaper {
  .escaper-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .escaper-header {
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
    
    .preview-section {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid var(--border-color, #eee);
      border-radius: 8px;
      
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
      
      .preview-content {
        min-height: 100px;
        padding: 10px;
        background-color: var(--secondary-background, #f9f9f9);
        border-radius: 6px;
        color: var(--text-color, #333);
        overflow: auto;
        
        /* 确保HTML内容有适当的样式 */
        a {
          color: var(--primary-color, #42B983);
        }
        
        table {
          border-collapse: collapse;
          
          th, td {
            border: 1px solid var(--border-color, #ddd);
            padding: 5px;
          }
        }
      }
    }
    
    .escaper-info {
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
        
        .entities-table {
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