<template>
  <div class="weight-converter">
    <div class="converter-container">
      <div class="converter-header">
        <h3>重量单位转换</h3>
        <p class="converter-description">
          在不同重量/质量单位之间进行转换，支持公制、英制等常用重量单位
        </p>
      </div>
      
      <div class="input-section">
        <el-form label-position="top">
          <el-form-item label="输入值">
            <el-input 
              v-model="inputValue" 
              type="number" 
              placeholder="请输入数值" 
              @input="convert"
              :step="getStepValue"
            >
              <template #append>
                <el-select v-model="fromUnit" @change="convert" style="width: 120px">
                  <el-option-group v-for="group in unitGroups" :key="group.label" :label="group.label">
                    <el-option
                      v-for="unit in group.units"
                      :key="unit.value"
                      :label="unit.label"
                      :value="unit.value"
                    />
                  </el-option-group>
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="conversion-results">
        <div class="results-header">
          <h4>转换结果</h4>
          <div class="results-actions">
            <el-button type="text" size="small" @click="copyAll" :disabled="!inputValue">
              <el-icon><DocumentCopy /></el-icon> 复制全部
            </el-button>
            <el-button type="text" size="small" @click="swap" :disabled="!inputValue">
              <el-icon><Sort /></el-icon> 交换单位
            </el-button>
          </div>
        </div>
        
        <el-table :data="results" style="width: 100%">
          <el-table-column prop="unit" label="单位" width="200">
            <template #default="scope">
              <el-radio 
                v-model="toUnit" 
                :label="scope.row.unit" 
                border 
                size="small"
                @change="highlightResult(scope.row.unit)"
              >
                {{ getUnitLabel(scope.row.unit) }}
              </el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="转换值">
            <template #default="scope">
              <div class="result-value">
                {{ formatValue(scope.row.value) }}
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
      
      <div class="precision-control">
        <el-form-item label="小数位数">
          <el-slider 
            v-model="precision" 
            :min="0" 
            :max="10" 
            :step="1" 
            show-stops 
            @change="convert"
          />
          <div class="precision-value">{{ precision }}</div>
        </el-form-item>
      </div>
      
      <div class="common-conversions" v-if="inputValue">
        <h4>常用换算参考</h4>
        <div class="reference-item" v-if="fromUnit === 'kg'">
          {{ inputValue }} 千克 ≈ {{ formatValue(inputValue * 2.20462) }} 磅
        </div>
        <div class="reference-item" v-if="fromUnit === 'lb'">
          {{ inputValue }} 磅 ≈ {{ formatValue(inputValue * 0.453592) }} 千克
        </div>
        <div class="reference-item" v-if="fromUnit === 'g'">
          {{ inputValue }} 克 ≈ {{ formatValue(inputValue * 0.035274) }} 盎司
        </div>
        <div class="reference-item" v-if="fromUnit === 'oz'">
          {{ inputValue }} 盎司 ≈ {{ formatValue(inputValue * 28.3495) }} 克
        </div>
      </div>
    </div>
    
    <div class="unit-information">
      <el-collapse>
        <el-collapse-item title="重量/质量单位说明" name="info">
          <p>重量是物体受地球引力作用而产生的力，而质量是物体的固有属性，不随环境变化。在日常生活中，我们通常不严格区分这两个概念。</p>
          
          <h5>公制单位</h5>
          <ul>
            <li><strong>吨(t)</strong>：1吨 = 1000千克，常用于大宗货物</li>
            <li><strong>千克(kg)</strong>：国际单位制的基本质量单位</li>
            <li><strong>克(g)</strong>：1克 = 0.001千克，常用于日常称量</li>
            <li><strong>毫克(mg)</strong>：1毫克 = 0.001克，常用于药品剂量</li>
            <li><strong>微克(μg)</strong>：1微克 = 0.000001克</li>
          </ul>
          
          <h5>英制单位</h5>
          <ul>
            <li><strong>长吨(long ton)</strong>：1长吨 = 1016.05千克，英国及英联邦国家使用</li>
            <li><strong>短吨(short ton)</strong>：1短吨 = 907.185千克，美国使用</li>
            <li><strong>英石(stone)</strong>：1英石 = 6.35029千克，英国常用来衡量人体重量</li>
            <li><strong>磅(lb)</strong>：1磅 = 0.453592千克，美国常用</li>
            <li><strong>盎司(oz)</strong>：1盎司 = 28.3495克，16盎司 = 1磅</li>
            <li><strong>打兰(dr)</strong>：1打兰 = 1.77185克，常用于宝石和药品</li>
            <li><strong>格令(gr)</strong>：1格令 = 0.0648克，药物计量单位</li>
          </ul>
          
          <h5>其他单位</h5>
          <ul>
            <li><strong>克拉(ct)</strong>：1克拉 = 0.2克，用于珠宝和宝石计量</li>
            <li><strong>原子质量单位(u)</strong>：约等于1.6605 × 10<sup>-27</sup>千克，用于原子和分子质量</li>
            <li><strong>担(dan)</strong>：中国传统单位，1担 = 50千克或100斤</li>
            <li><strong>斤(jin)</strong>：中国传统单位，1斤 = 0.5千克</li>
            <li><strong>两(liang)</strong>：中国传统单位，1两 = 50克 = 0.1斤</li>
          </ul>
          
          <h5>趣味对比</h5>
          <ul>
            <li>一张A4纸重约5克</li>
            <li>一个苹果重约150-200克</li>
            <li>一个标准篮球重约600克</li>
            <li>成年人平均体重约60-70千克</li>
            <li>一辆普通轿车重约1.5吨</li>
            <li>一头成年非洲象重约5-6吨</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { DocumentCopy, Sort } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';

// 用户输入值和单位
const inputValue = ref('');
const fromUnit = ref('kg');
const toUnit = ref('');
const precision = ref(4); // 小数位数

// 定义单位组和单位
const unitGroups = [
  {
    label: '公制',
    units: [
      { label: '吨 (t)', value: 't' },
      { label: '千克 (kg)', value: 'kg' },
      { label: '克 (g)', value: 'g' },
      { label: '毫克 (mg)', value: 'mg' },
      { label: '微克 (μg)', value: 'ug' }
    ]
  },
  {
    label: '英制',
    units: [
      { label: '长吨 (long ton)', value: 'long_ton' },
      { label: '短吨 (short ton)', value: 'short_ton' },
      { label: '英石 (stone)', value: 'stone' },
      { label: '磅 (lb)', value: 'lb' },
      { label: '盎司 (oz)', value: 'oz' },
      { label: '打兰 (dr)', value: 'dr' },
      { label: '格令 (gr)', value: 'gr' }
    ]
  },
  {
    label: '其他单位',
    units: [
      { label: '克拉 (ct)', value: 'ct' },
      { label: '担 (dan)', value: 'dan' },
      { label: '斤 (jin)', value: 'jin' },
      { label: '两 (liang)', value: 'liang' }
    ]
  }
];

// 单位到千克的转换因子
const conversionFactors = {
  // 公制
  t: 1000,             // 吨到千克
  kg: 1,               // 千克到千克（基准单位）
  g: 0.001,            // 克到千克
  mg: 0.000001,        // 毫克到千克
  ug: 0.000000001,     // 微克到千克
  
  // 英制
  long_ton: 1016.05,   // 长吨到千克
  short_ton: 907.185,  // 短吨到千克
  stone: 6.35029,      // 英石到千克
  lb: 0.453592,        // 磅到千克
  oz: 0.0283495,       // 盎司到千克
  dr: 0.001771845,     // 打兰到千克
  gr: 0.0000648,       // 格令到千克
  
  // 其他单位
  ct: 0.0002,          // 克拉到千克
  dan: 50,             // 担到千克（中国）
  jin: 0.5,            // 斤到千克（中国）
  liang: 0.05          // 两到千克（中国）
};

// 计算所有转换结果
const results = computed(() => {
  if (!inputValue.value) {
    return [];
  }
  
  const input = parseFloat(inputValue.value);
  if (isNaN(input)) {
    return [];
  }
  
  // 先转换为千克
  const inKilograms = input * conversionFactors[fromUnit.value];
  
  // 再从千克转换到各个单位
  return Object.keys(conversionFactors).map(unit => {
    return {
      unit: unit,
      value: inKilograms / conversionFactors[unit]
    };
  });
});

// 获取输入框的步进值
const getStepValue = computed(() => {
  // 根据单位精度确定步进值
  if (['kg', 'lb', 'stone'].includes(fromUnit.value)) {
    return 0.1;
  } else if (['g', 'oz'].includes(fromUnit.value)) {
    return 1;
  } else if (['mg', 'gr', 'ct'].includes(fromUnit.value)) {
    return 10;
  } else if (['ug'].includes(fromUnit.value)) {
    return 100;
  }
  return 1;
});

// 执行转换
const convert = () => {
  // 结果已通过计算属性自动更新
};

// 交换单位
const swap = () => {
  if (!toUnit.value) {
    ElMessage({
      message: '请先选择一个目标单位',
      type: 'warning'
    });
    return;
  }
  
  // 保存当前输入值和目标单位
  const currentValue = inputValue.value;
  const targetUnit = toUnit.value;
  
  // 在结果中找到对应的转换值
  const targetResult = results.value.find(item => item.unit === targetUnit);
  if (!targetResult) return;
  
  // 交换单位和值
  inputValue.value = targetResult.value.toString();
  fromUnit.value = targetUnit;
  toUnit.value = ''; // 清除选择
  
  // 重新转换
  convert();
};

// 格式化显示值
const formatValue = (value) => {
  // 检查是否是极大或极小的数
  if (Math.abs(value) >= 1e10 || (Math.abs(value) < 1e-9 && Math.abs(value) > 0)) {
    return value.toExponential(precision.value);
  }
  return value.toFixed(precision.value);
};

// 获取单位显示标签
const getUnitLabel = (unitValue) => {
  for (const group of unitGroups) {
    for (const unit of group.units) {
      if (unit.value === unitValue) {
        return unit.label;
      }
    }
  }
  return unitValue;
};

// 高亮显示特定结果
const highlightResult = (unit) => {
  // 可以在这里添加高亮显示逻辑
};

// 复制特定值到剪贴板
const copyToClipboard = (value) => {
  const textToCopy = formatValue(value);
  navigator.clipboard.writeText(textToCopy)
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

// 复制全部结果
const copyAll = () => {
  if (!results.value.length) return;
  
  const textToCopy = results.value.map(result => {
    return `${formatValue(result.value)} ${getUnitLabel(result.unit)}`;
  }).join('\n');
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      ElMessage({
        message: '已复制全部结果到剪贴板',
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

// 当单位改变时，重新转换
watch(fromUnit, () => {
  convert();
});
</script>

<style lang="scss" scoped>
.weight-converter {
  .converter-container {
    background-color: var(--card-bg, white);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
    
    .converter-header {
      margin-bottom: 20px;
      
      h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: var(--text-color, #333);
      }
      
      .converter-description {
        color: var(--text-color-light, #666);
        margin: 0;
      }
    }
    
    .input-section {
      margin-bottom: 20px;
    }
    
    .conversion-results {
      margin-bottom: 20px;
      
      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        h4 {
          margin: 0;
          color: var(--text-color, #333);
        }
        
        .results-actions {
          display: flex;
          gap: 10px;
        }
      }
      
      .result-value {
        display: flex;
        align-items: center;
        font-family: 'Courier New', monospace;
        
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
    
    .precision-control {
      margin-bottom: 20px;
      
      .precision-value {
        text-align: center;
        margin-top: 5px;
        font-weight: bold;
        color: var(--text-color, #333);
      }
    }
    
    .common-conversions {
      margin-top: 20px;
      padding: 15px;
      background-color: var(--secondary-background, #f9f9f9);
      border-radius: 6px;
      
      h4 {
        margin-top: 0;
        margin-bottom: 10px;
        color: var(--text-color, #333);
      }
      
      .reference-item {
        margin-bottom: 5px;
        color: var(--text-color-light, #666);
        font-size: 0.95rem;
      }
    }
  }
  
  .unit-information {
    h5 {
      margin-top: 15px;
      margin-bottom: 10px;
      color: var(--text-color, #333);
    }
    
    p {
      margin: 0 0 10px;
      color: var(--text-color, #333);
    }
    
    ul {
      margin: 0 0 15px;
      padding-left: 20px;
      color: var(--text-color, #333);
      
      li {
        margin-bottom: 5px;
      }
    }
  }
}

@media (max-width: 768px) {
  .weight-converter {
    .converter-container {
      padding: 15px;
      
      .conversion-results {
        .results-header {
          flex-direction: column;
          align-items: flex-start;
          
          h4 {
            margin-bottom: 10px;
          }
        }
      }
    }
  }
}
</style> 