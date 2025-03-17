<template>
  <div class="text-diff">
    <div class="diff-container">
      <div class="diff-header">
        <h3>文本差异对比</h3>
        <p class="description">对比两段文本，以直观方式显示它们之间的差异</p>
      </div>
      
      <div class="diff-content">
        <div class="input-panels">
          <div class="input-panel">
            <div class="panel-header">
              <span class="panel-title">原始文本</span>
              <div class="panel-controls">
                <el-button size="small" @click="clearInput('old')" :disabled="!oldText">
                  <el-icon><Delete /></el-icon> 清空
                </el-button>
                <el-button size="small" @click="pasteFromClipboard('old')">
                  <el-icon><DocumentCopy /></el-icon> 粘贴
                </el-button>
              </div>
            </div>
            
            <el-input
              v-model="oldText"
              type="textarea"
              :rows="10"
              placeholder="请输入原始文本..."
              resize="none"
            ></el-input>
            
            <div class="character-count">
              <span>{{ getOldTextStats }}</span>
            </div>
          </div>
          
          <div class="panel-divider">
            <div class="sample-controls">
              <el-button type="primary" @click="loadSampleTexts">
                <el-icon><Refresh /></el-icon> 加载示例
              </el-button>
            </div>
          </div>
          
          <div class="input-panel">
            <div class="panel-header">
              <span class="panel-title">新文本</span>
              <div class="panel-controls">
                <el-button size="small" @click="clearInput('new')" :disabled="!newText">
                  <el-icon><Delete /></el-icon> 清空
                </el-button>
                <el-button size="small" @click="pasteFromClipboard('new')">
                  <el-icon><DocumentCopy /></el-icon> 粘贴
                </el-button>
              </div>
            </div>
            
            <el-input
              v-model="newText"
              type="textarea"
              :rows="10"
              placeholder="请输入新文本..."
              resize="none"
            ></el-input>
            
            <div class="character-count">
              <span>{{ getNewTextStats }}</span>
            </div>
          </div>
        </div>
        
        <div class="diff-controls">
          <div class="diff-options">
            <span class="options-label">对比模式：</span>
            <el-radio-group v-model="diffMode" size="small">
              <el-radio-button label="line">行对比</el-radio-button>
              <el-radio-button label="word">词对比</el-radio-button>
              <el-radio-button label="char">字符对比</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="advanced-options">
            <el-checkbox v-model="options.ignoreCase">
              忽略大小写
            </el-checkbox>
            <el-checkbox v-model="options.ignoreWhitespace" v-if="diffMode === 'line'">
              忽略空白字符
            </el-checkbox>
            <el-checkbox v-model="options.contextLines" v-if="diffMode === 'line' && viewMode === 'unified'">
              显示上下文行
            </el-checkbox>
          </div>
          
          <div class="view-options">
            <span class="options-label">显示模式：</span>
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="inline">内联视图</el-radio-button>
              <el-radio-button label="side-by-side">并排视图</el-radio-button>
              <el-radio-button label="unified">统一视图</el-radio-button>
            </el-radio-group>
          </div>
          
          <el-button 
            type="primary"
            size="large"
            :disabled="!canCompare"
            @click="compareDiff"
          >
            <el-icon><View /></el-icon> 对比文本
          </el-button>
        </div>
        
        <div v-if="diffResult.length > 0" class="diff-result">
          <div class="result-header">
            <h4>对比结果</h4>
            <div class="result-controls">
              <el-button size="small" type="success" @click="copyDiffResult">
                <el-icon><DocumentCopy /></el-icon> 复制结果
              </el-button>
            </div>
          </div>
          
          <div v-if="viewMode === 'inline'" class="inline-diff">
            <div v-for="(part, index) in diffResult" :key="index" class="diff-part" :class="getDiffClass(part)">
              <pre v-if="!part.added && !part.removed">{{ part.value }}</pre>
              <pre v-if="part.added"><span class="addition">+</span>{{ part.value }}</pre>
              <pre v-if="part.removed"><span class="deletion">-</span>{{ part.value }}</pre>
            </div>
          </div>
          
          <div v-if="viewMode === 'side-by-side'" class="side-by-side-diff">
            <div class="diff-table">
              <div class="table-header">
                <div class="left-column">原始文本</div>
                <div class="right-column">新文本</div>
              </div>
              <div class="table-body">
                <template v-for="(pair, index) in formatSideBySide()" :key="index">
                  <div class="diff-row">
                    <div class="left-column" :class="{ 'removed': pair.left.removed }">
                      <pre v-if="pair.left.value">{{ pair.left.value }}</pre>
                    </div>
                    <div class="right-column" :class="{ 'added': pair.right.added }">
                      <pre v-if="pair.right.value">{{ pair.right.value }}</pre>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          
          <div v-if="viewMode === 'unified'" class="unified-diff">
            <pre v-html="formatUnifiedDiff()"></pre>
          </div>
          
          <div class="diff-stats">
            <div class="stat-item addition">
              <span class="stat-label">新增：</span>
              <span class="stat-value">{{ getDiffStats.added }}</span>
            </div>
            <div class="stat-item deletion">
              <span class="stat-label">删除：</span>
              <span class="stat-value">{{ getDiffStats.removed }}</span>
            </div>
            <div class="stat-item unchanged">
              <span class="stat-label">相同：</span>
              <span class="stat-value">{{ getDiffStats.unchanged }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="diff-info">
        <el-collapse>
          <el-collapse-item title="差异对比说明" name="explanation">
            <div class="info-content">
              <h4>对比模式说明</h4>
              <ul>
                <li><strong>行对比：</strong>按行对比两段文本，适合比较代码、文章段落等</li>
                <li><strong>词对比：</strong>按词语对比，能更精确地显示文字变化，适合比较文章内容</li>
                <li><strong>字符对比：</strong>按单个字符对比，显示最细粒度的差异，但可能不够直观</li>
              </ul>
              
              <h4>显示模式说明</h4>
              <ul>
                <li><strong>内联视图：</strong>在单一窗口中显示变化，删除内容和新增内容高亮标记</li>
                <li><strong>并排视图：</strong>左侧显示原始文本，右侧显示新文本，方便比较整体变化</li>
                <li><strong>统一视图：</strong>类似git diff的输出格式，使用-和+前缀标记变化</li>
              </ul>
              
              <h4>对比结果颜色标记</h4>
              <ul>
                <li><span class="example-color addition-bg"></span> <strong>绿色：</strong>新增内容</li>
                <li><span class="example-color deletion-bg"></span> <strong>红色：</strong>删除内容</li>
                <li><span class="example-color unchanged-bg"></span> <strong>白色/灰色：</strong>未变化内容</li>
              </ul>
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="常见用途" name="usage">
            <div class="info-content">
              <h4>文本差异对比常用场景</h4>
              <ul>
                <li><strong>代码审查：</strong>对比代码变更，检查新增和删除的代码</li>
                <li><strong>文档版本比较：</strong>比较文档的不同版本，找出修改内容</li>
                <li><strong>文本编辑校对：</strong>检查编辑前后的文本差异，确认修改是否正确</li>
                <li><strong>抄袭检测：</strong>比较原文和疑似抄袭文本，分析相似度</li>
                <li><strong>翻译对比：</strong>对比翻译前后文本结构变化</li>
                <li><strong>配置文件比较：</strong>查看配置文件的变更点</li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, DocumentCopy, Refresh, View } from '@element-plus/icons-vue';
import * as Diff from 'diff';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';

// 文本输入
const oldText = ref('');
const newText = ref('');

// 对比选项
const diffMode = ref('line');
const viewMode = ref('inline');
const options = ref({
  ignoreCase: false,
  ignoreWhitespace: false,
  contextLines: true
});

// 对比结果
const diffResult = ref([]);
const isComparing = ref(false);

// 文本统计信息
const getOldTextStats = computed(() => {
  if (!oldText.value) return '0 个字符';
  
  const lines = oldText.value.split('\n').length;
  const words = oldText.value.trim().split(/\s+/).length;
  const chars = oldText.value.length;
  
  return `${chars} 个字符，${words} 个词，${lines} 行`;
});

const getNewTextStats = computed(() => {
  if (!newText.value) return '0 个字符';
  
  const lines = newText.value.split('\n').length;
  const words = newText.value.trim().split(/\s+/).length;
  const chars = newText.value.length;
  
  return `${chars} 个字符，${words} 个词，${lines} 行`;
});

// 是否可以比较
const canCompare = computed(() => {
  return oldText.value.trim() !== '' && newText.value.trim() !== '';
});

// 获取对比结果统计
const getDiffStats = computed(() => {
  if (!diffResult.value.length) {
    return { added: 0, removed: 0, unchanged: 0 };
  }
  
  let stats = { added: 0, removed: 0, unchanged: 0 };
  
  diffResult.value.forEach(part => {
    if (part.added) {
      if (diffMode.value === 'line') {
        stats.added += part.value.split('\n').length - (part.value.endsWith('\n') ? 1 : 0);
      } else if (diffMode.value === 'word') {
        stats.added += part.value.trim().split(/\s+/).length;
      } else {
        stats.added += part.value.length;
      }
    } else if (part.removed) {
      if (diffMode.value === 'line') {
        stats.removed += part.value.split('\n').length - (part.value.endsWith('\n') ? 1 : 0);
      } else if (diffMode.value === 'word') {
        stats.removed += part.value.trim().split(/\s+/).length;
      } else {
        stats.removed += part.value.length;
      }
    } else {
      if (diffMode.value === 'line') {
        stats.unchanged += part.value.split('\n').length - (part.value.endsWith('\n') ? 1 : 0);
      } else if (diffMode.value === 'word') {
        stats.unchanged += part.value.trim().split(/\s+/).length;
      } else {
        stats.unchanged += part.value.length;
      }
    }
  });
  
  return stats;
});

// 执行文本对比
const compareDiff = () => {
  if (!canCompare.value) return;
  
  isComparing.value = true;
  
  try {
    let result;
    const diffOptions = {
      ignoreCase: options.value.ignoreCase,
      ignoreWhitespace: options.value.ignoreWhitespace
    };
    
    if (diffMode.value === 'line') {
      result = Diff.diffLines(oldText.value, newText.value, diffOptions);
    } else if (diffMode.value === 'word') {
      result = Diff.diffWords(oldText.value, newText.value, diffOptions);
    } else { // char
      result = Diff.diffChars(oldText.value, newText.value, diffOptions);
    }
    
    diffResult.value = result;
    ElMessage.success('文本对比完成');
  } catch (error) {
    console.error('文本对比失败:', error);
    ElMessage.error('文本对比失败: ' + error.message);
  } finally {
    isComparing.value = false;
  }
};

// 获取差异部分的CSS类
const getDiffClass = (part) => {
  if (part.added) return 'added';
  if (part.removed) return 'removed';
  return 'unchanged';
};

// 格式化为并排视图数据
const formatSideBySide = () => {
  const result = [];
  let leftParts = [];
  let rightParts = [];
  
  diffResult.value.forEach(part => {
    if (part.removed) {
      leftParts.push(part);
    } else if (part.added) {
      rightParts.push(part);
    } else {
      // 处理未变化的部分，需要同时显示在左右两侧
      const lines = part.value.split('\n');
      
      // 最后一行如果是空行则移除
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }
      
      lines.forEach(line => {
        leftParts.push({ value: line });
        rightParts.push({ value: line });
      });
    }
  });
  
  // 将左右两侧的部分配对显示
  const maxLength = Math.max(leftParts.length, rightParts.length);
  for (let i = 0; i < maxLength; i++) {
    result.push({
      left: leftParts[i] || { value: '' },
      right: rightParts[i] || { value: '' }
    });
  }
  
  return result;
};

// 格式化为统一视图数据
const formatUnifiedDiff = () => {
  let result = '';
  let lineNumber = 1;
  
  diffResult.value.forEach(part => {
    const lines = part.value.split('\n');
    
    // 最后一行如果是空行则移除
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    
    lines.forEach(line => {
      let prefix = '';
      let color = '';
      
      if (part.added) {
        prefix = '+';
        color = 'addition';
      } else if (part.removed) {
        prefix = '-';
        color = 'deletion';
      } else {
        prefix = ' ';
        color = 'unchanged';
      }
      
      result += `<span class="${color}">${prefix} ${line}</span>\n`;
    });
  });
  
  return result;
};

// 清空输入框
const clearInput = (type) => {
  if (type === 'old') {
    oldText.value = '';
  } else if (type === 'new') {
    newText.value = '';
  }
  
  diffResult.value = [];
  ElMessage.info(`已清空${type === 'old' ? '原始' : '新'}文本`);
};

// 从剪贴板粘贴
const pasteFromClipboard = (type) => {
  navigator.clipboard.readText()
    .then(text => {
      if (type === 'old') {
        oldText.value = text;
      } else if (type === 'new') {
        newText.value = text;
      }
      
      ElMessage.success(`已从剪贴板粘贴到${type === 'old' ? '原始' : '新'}文本`);
    })
    .catch(() => {
      ElMessage.error('粘贴失败，请手动粘贴');
    });
};

// 复制对比结果
const copyDiffResult = () => {
  if (!diffResult.value.length) return;
  
  let textResult = '';
  
  if (viewMode.value === 'unified') {
    // 去除HTML标签，仅保留文本内容
    diffResult.value.forEach(part => {
      const prefix = part.added ? '+' : (part.removed ? '-' : ' ');
      const lines = part.value.split('\n');
      
      // 最后一行如果是空行则移除
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }
      
      lines.forEach(line => {
        textResult += `${prefix} ${line}\n`;
      });
    });
  } else {
    // 其他视图模式的复制格式
    diffResult.value.forEach(part => {
      const prefix = part.added ? '[+] ' : (part.removed ? '[-] ' : '    ');
      textResult += prefix + part.value;
    });
  }
  
  navigator.clipboard.writeText(textResult)
    .then(() => {
      ElMessage.success('已复制对比结果到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制');
    });
};

// 加载示例文本
const loadSampleTexts = () => {
  oldText.value = `这是一个示例文本，用于演示文本差异对比工具的功能。
这段文字将保持不变。
这一行会被修改。
这一行将被删除。
最后一行也是不变的。`;

  newText.value = `这是一个示例文本，用来演示文本差异对比工具的各项功能。
这段文字将保持不变。
这一行已经被修改为新的内容。
这是新增的一行内容。
最后一行也是不变的。`;

  diffResult.value = [];
  ElMessage.success('已加载示例文本');
};
</script>

<style lang="scss" scoped>
.text-diff {
  .diff-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .diff-header {
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
    
    .diff-content {
      .input-panels {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        
        @media (max-width: 768px) {
          flex-direction: column;
        }
        
        .input-panel {
          flex: 1;
          
          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            
            .panel-title {
              font-weight: bold;
              color: var(--text-color, #333);
            }
            
            .panel-controls {
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
        
        .panel-divider {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          
          @media (max-width: 768px) {
            margin: 10px 0;
          }
          
          .sample-controls {
            margin: 10px 0;
          }
        }
      }
      
      .diff-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px;
        border-radius: 8px;
        background-color: var(--secondary-background, #f9f9f9);
        
        .diff-options, .view-options {
          display: flex;
          align-items: center;
          gap: 10px;
          
          .options-label {
            font-weight: bold;
            color: var(--text-color, #333);
          }
        }
        
        .advanced-options {
          display: flex;
          gap: 15px;
          margin-left: 20px;
        }
        
        .el-button {
          margin-left: auto;
          
          @media (max-width: 768px) {
            margin-left: 0;
            width: 100%;
          }
        }
        
        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
        }
      }
      
      .diff-result {
        margin-top: 20px;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid var(--border-color, #eee);
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          
          h4 {
            margin: 0;
            color: var(--text-color, #333);
          }
        }
        
        .inline-diff {
          .diff-part {
            margin-bottom: 5px;
            
            &.added {
              background-color: rgba(76, 175, 80, 0.1);
              color: #2e7d32;
              
              pre {
                margin: 0;
                white-space: pre-wrap;
              }
              
              .addition {
                color: #2e7d32;
                font-weight: bold;
                margin-right: 5px;
              }
            }
            
            &.removed {
              background-color: rgba(244, 67, 54, 0.1);
              color: #c62828;
              
              pre {
                margin: 0;
                white-space: pre-wrap;
              }
              
              .deletion {
                color: #c62828;
                font-weight: bold;
                margin-right: 5px;
              }
            }
            
            &.unchanged {
              pre {
                margin: 0;
                white-space: pre-wrap;
                color: var(--text-color, #333);
              }
            }
          }
        }
        
        .side-by-side-diff {
          .diff-table {
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border-color, #eee);
            border-radius: 6px;
            overflow: hidden;
            
            .table-header {
              display: flex;
              background-color: var(--secondary-background, #f5f7fa);
              font-weight: bold;
              
              .left-column, .right-column {
                flex: 1;
                padding: 10px;
                border-bottom: 1px solid var(--border-color, #eee);
                color: var(--text-color, #333);
              }
              
              .left-column {
                border-right: 1px solid var(--border-color, #eee);
              }
            }
            
            .table-body {
              .diff-row {
                display: flex;
                
                .left-column, .right-column {
                  flex: 1;
                  padding: 5px 10px;
                  min-height: 20px;
                  word-break: break-all;
                  
                  pre {
                    margin: 0;
                    white-space: pre-wrap;
                    color: var(--text-color, #333);
                  }
                }
                
                .left-column {
                  border-right: 1px solid var(--border-color, #eee);
                  
                  &.removed {
                    background-color: rgba(244, 67, 54, 0.1);
                    
                    pre {
                      color: #c62828;
                    }
                  }
                }
                
                .right-column {
                  &.added {
                    background-color: rgba(76, 175, 80, 0.1);
                    
                    pre {
                      color: #2e7d32;
                    }
                  }
                }
              }
            }
          }
        }
        
        .unified-diff {
          background-color: var(--secondary-background, #f5f7fa);
          padding: 10px;
          border-radius: 6px;
          overflow-x: auto;
          
          pre {
            margin: 0;
            color: var(--text-color, #333);
            font-family: monospace;
            white-space: pre-wrap;
            
            .addition {
              color: #2e7d32;
            }
            
            .deletion {
              color: #c62828;
            }
            
            .unchanged {
              color: var(--text-color-light, #666);
            }
          }
        }
        
        .diff-stats {
          display: flex;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--border-color, #eee);
          
          .stat-item {
            margin-right: 20px;
            
            .stat-label {
              font-weight: bold;
            }
            
            &.addition {
              .stat-value {
                color: #2e7d32;
              }
            }
            
            &.deletion {
              .stat-value {
                color: #c62828;
              }
            }
            
            &.unchanged {
              .stat-value {
                color: var(--text-color-light, #666);
              }
            }
          }
        }
      }
    }
    
    .diff-info {
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
            
            .example-color {
              display: inline-block;
              width: 16px;
              height: 16px;
              border-radius: 4px;
              margin-right: 5px;
              vertical-align: middle;
              
              &.addition-bg {
                background-color: rgba(76, 175, 80, 0.3);
              }
              
              &.deletion-bg {
                background-color: rgba(244, 67, 54, 0.3);
              }
              
              &.unchanged-bg {
                background-color: rgba(158, 158, 158, 0.3);
              }
            }
          }
        }
      }
    }
  }
}

// 深色模式下的颜色调整
:deep(.dark-mode) {
  .text-diff {
    .diff-container {
      .diff-content {
        .diff-result {
          .inline-diff {
            .diff-part {
              &.added {
                background-color: rgba(76, 175, 80, 0.15);
                color: #81c784;
              }
              
              &.removed {
                background-color: rgba(244, 67, 54, 0.15);
                color: #e57373;
              }
            }
          }
          
          .side-by-side-diff {
            .diff-table {
              .table-body {
                .diff-row {
                  .left-column {
                    &.removed {
                      background-color: rgba(244, 67, 54, 0.15);
                      
                      pre {
                        color: #e57373;
                      }
                    }
                  }
                  
                  .right-column {
                    &.added {
                      background-color: rgba(76, 175, 80, 0.15);
                      
                      pre {
                        color: #81c784;
                      }
                    }
                  }
                }
              }
            }
          }
          
          .unified-diff {
            pre {
              .addition {
                color: #81c784;
              }
              
              .deletion {
                color: #e57373;
              }
            }
          }
          
          .diff-stats {
            .stat-item {
              &.addition {
                .stat-value {
                  color: #81c784;
                }
              }
              
              &.deletion {
                .stat-value {
                  color: #e57373;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style> 