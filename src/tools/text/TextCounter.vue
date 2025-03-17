<template>
  <div class="text-counter">
    <div class="tool-section">
      <h3>输入文本</h3>
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="8"
        placeholder="请输入要分析的文本..."
        @input="updateStats"
      ></el-input>
    </div>
    
    <div class="stats-container">
      <div class="basic-stats">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <h3>基本统计</h3>
            </div>
          </template>
          <div class="stat-item">
            <span class="stat-label">字符数（含空格）：</span>
            <span class="stat-value">{{ stats.charCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">字符数（不含空格）：</span>
            <span class="stat-value">{{ stats.charNoSpaceCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">单词数：</span>
            <span class="stat-value">{{ stats.wordCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">行数：</span>
            <span class="stat-value">{{ stats.lineCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">段落数：</span>
            <span class="stat-value">{{ stats.paragraphCount }}</span>
          </div>
        </el-card>
      </div>
      
      <div class="detailed-stats">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <h3>详细统计</h3>
            </div>
          </template>
          <div class="stat-item">
            <span class="stat-label">中文字符：</span>
            <span class="stat-value">{{ stats.chineseCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">英文字母：</span>
            <span class="stat-value">{{ stats.letterCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">数字：</span>
            <span class="stat-value">{{ stats.digitCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">标点符号：</span>
            <span class="stat-value">{{ stats.punctuationCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">空格：</span>
            <span class="stat-value">{{ stats.spaceCount }}</span>
          </div>
        </el-card>
      </div>
    </div>
    
    <div class="frequency-analysis" v-if="inputText">
      <el-tabs type="border-card">
        <el-tab-pane label="字符频率">
          <div class="char-frequency">
            <table class="frequency-table">
              <thead>
                <tr>
                  <th>字符</th>
                  <th>出现次数</th>
                  <th>频率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in characterFrequency" :key="index">
                  <td>{{ item.char === ' ' ? '空格' : item.char }}</td>
                  <td>{{ item.count }}</td>
                  <td>{{ (item.frequency * 100).toFixed(2) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="词频分析">
          <div class="word-frequency">
            <div class="filter-section">
              <el-input
                v-model="minWordLength"
                type="number"
                placeholder="最小词长"
                style="width: 100px"
                @change="updateWordFrequency"
              ></el-input>
              <span class="filter-separator">筛选条件：最小词长 ≥ {{ minWordLength || 1 }} 个字符</span>
            </div>
            <table class="frequency-table">
              <thead>
                <tr>
                  <th>单词</th>
                  <th>出现次数</th>
                  <th>频率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredWordFrequency" :key="index">
                  <td>{{ item.word }}</td>
                  <td>{{ item.count }}</td>
                  <td>{{ (item.frequency * 100).toFixed(2) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <el-divider v-if="inputText">
      <el-icon><Histogram /></el-icon>
    </el-divider>
    
    <div class="tool-actions" v-if="inputText">
      <el-button type="primary" @click="generateReport">
        <el-icon><Document /></el-icon> 生成报告
      </el-button>
      <el-button @click="clearText">
        <el-icon><Delete /></el-icon> 清空文本
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Delete, Document, Histogram } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';

const inputText = ref('');
const minWordLength = ref(1);

// 统计数据
const stats = reactive({
  charCount: 0,
  charNoSpaceCount: 0,
  wordCount: 0,
  lineCount: 0,
  paragraphCount: 0,
  chineseCount: 0,
  letterCount: 0,
  digitCount: 0,
  punctuationCount: 0,
  spaceCount: 0
});

// 字符频率和词频
const charFrequency = ref({});
const wordFrequency = ref({});

// 更新统计数据
const updateStats = () => {
  const text = inputText.value;
  
  // 基本统计
  stats.charCount = text.length;
  stats.charNoSpaceCount = text.replace(/\s/g, '').length;
  stats.wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  stats.lineCount = text ? text.split('\n').length : 0;
  stats.paragraphCount = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  
  // 详细统计
  stats.chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  stats.letterCount = (text.match(/[a-zA-Z]/g) || []).length;
  stats.digitCount = (text.match(/\d/g) || []).length;
  stats.punctuationCount = (text.match(/[^\w\s\u4e00-\u9fa5]/g) || []).length;
  stats.spaceCount = (text.match(/\s/g) || []).length;
  
  // 字符频率分析
  updateCharFrequency();
  
  // 词频分析
  updateWordFrequency();
};

// 更新字符频率
const updateCharFrequency = () => {
  const text = inputText.value;
  const freq = {};
  
  // 计算每个字符出现的次数
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    freq[char] = (freq[char] || 0) + 1;
  }
  
  charFrequency.value = freq;
};

// 更新词频
const updateWordFrequency = () => {
  const text = inputText.value;
  const freq = {};
  
  if (text.trim()) {
    // 提取单词并计算频率
    const words = text.toLowerCase().match(/\b[a-z0-9_\u4e00-\u9fa5]+\b/gi) || [];
    
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  
  wordFrequency.value = freq;
};

// 排序后的字符频率
const characterFrequency = computed(() => {
  const result = [];
  for (const char in charFrequency.value) {
    result.push({
      char,
      count: charFrequency.value[char],
      frequency: charFrequency.value[char] / stats.charCount
    });
  }
  
  return result.sort((a, b) => b.count - a.count).slice(0, 20);
});

// 过滤后的词频
const filteredWordFrequency = computed(() => {
  const result = [];
  const minLength = parseInt(minWordLength.value) || 1;
  
  for (const word in wordFrequency.value) {
    if (word.length >= minLength) {
      result.push({
        word,
        count: wordFrequency.value[word],
        frequency: wordFrequency.value[word] / stats.wordCount
      });
    }
  }
  
  return result.sort((a, b) => b.count - a.count).slice(0, 20);
});

// 生成报告
const generateReport = () => {
  let report = `文本统计报告\n\n`;
  report += `基本统计：\n`;
  report += `字符数（含空格）：${stats.charCount}\n`;
  report += `字符数（不含空格）：${stats.charNoSpaceCount}\n`;
  report += `单词数：${stats.wordCount}\n`;
  report += `行数：${stats.lineCount}\n`;
  report += `段落数：${stats.paragraphCount}\n\n`;
  
  report += `详细统计：\n`;
  report += `中文字符：${stats.chineseCount}\n`;
  report += `英文字母：${stats.letterCount}\n`;
  report += `数字：${stats.digitCount}\n`;
  report += `标点符号：${stats.punctuationCount}\n`;
  report += `空格：${stats.spaceCount}\n\n`;
  
  report += `词频统计（前10个）：\n`;
  filteredWordFrequency.value.slice(0, 10).forEach((item, index) => {
    report += `${index + 1}. ${item.word}: ${item.count}次 (${(item.frequency * 100).toFixed(2)}%)\n`;
  });
  
  // 复制报告到剪贴板
  navigator.clipboard.writeText(report)
    .then(() => {
      ElMessage({
        message: '统计报告已复制到剪贴板',
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

// 清空文本
const clearText = () => {
  inputText.value = '';
  updateStats();
};

// 初始化
updateStats();
</script>

<style lang="scss" scoped>
.text-counter {
  .tool-section {
    margin-bottom: 20px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      color: var(--text-color, #333);
    }
  }
  
  .stats-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
    
    .basic-stats, .detailed-stats {
      flex: 1;
      min-width: 240px;
    }
    
    .stats-card {
      height: 100%;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0;
          font-size: 1.1rem;
        }
      }
      
      .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.95rem;
        
        .stat-label {
          color: var(--text-color-light, #666);
        }
        
        .stat-value {
          font-weight: bold;
          color: var(--text-color, #333);
        }
      }
    }
  }
  
  .frequency-analysis {
    margin-top: 30px;
    margin-bottom: 20px;
    
    .char-frequency, .word-frequency {
      overflow-x: auto;
    }
    
    .filter-section {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      
      .filter-separator {
        margin-left: 10px;
        color: var(--text-color-light, #666);
      }
    }
    
    .frequency-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 8px 15px;
        text-align: left;
        border-bottom: 1px solid var(--border-color, #eee);
      }
      
      th {
        background-color: var(--secondary-background, #f9f9f9);
        color: var(--text-color, #333);
        font-weight: bold;
      }
      
      tr:nth-child(even) {
        background-color: var(--secondary-background, #f9f9f9);
      }
    }
  }
  
  .tool-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .text-counter {
    .stats-container {
      flex-direction: column;
    }
    
    .frequency-analysis {
      .frequency-table {
        th, td {
          padding: 8px;
        }
      }
    }
  }
}
</style> 