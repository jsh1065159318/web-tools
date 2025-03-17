<template>
  <div class="length-converter">
    <div class="converter-container">
      <div class="converter-header">
        <h3>长度单位转换</h3>
        <p class="converter-description">
          在不同长度单位之间进行转换，支持公制、英制等常用长度单位
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
        <div class="reference-item" v-if="fromUnit === 'm'">
          {{ inputValue }} 米 ≈ {{ formatValue(inputValue * 3.28084) }} 英尺
        </div>
        <div class="reference-item" v-if="fromUnit === 'ft'">
          {{ inputValue }} 英尺 ≈ {{ formatValue(inputValue * 0.3048) }} 米
        </div>
        <div class="reference-item" v-if="fromUnit === 'km'">
          {{ inputValue }} 千米 ≈ {{ formatValue(inputValue * 0.621371) }} 英里
        </div>
        <div class="reference-item" v-if="fromUnit === 'mi'">
          {{ inputValue }} 英里 ≈ {{ formatValue(inputValue * 1.60934) }} 千米
        </div>
      </div>
    </div>
    
    <div class="unit-information">
      <el-collapse>
        <el-collapse-item title="长度单位说明" name="info">
          <p>长度是描述物体一维空间延伸性的物理量。不同的文化和应用领域使用不同的长度单位。</p>
          
          <h5>公制单位</h5>
          <ul>
            <li><strong>千米(km)</strong>：1千米 = 1000米，常用于测量城市间距离</li>
            <li><strong>米(m)</strong>：国际单位制的基本长度单位</li>
            <li><strong>分米(dm)</strong>：1分米 = 0.1米 = 10厘米</li>
            <li><strong>厘米(cm)</strong>：1厘米 = 0.01米，常用于日常测量</li>
            <li><strong>毫米(mm)</strong>：1毫米 = 0.001米，常用于精密测量</li>
            <li><strong>微米(μm)</strong>：1微米 = 0.000001米，人眼可见的最小长度约为100微米</li>
            <li><strong>纳米(nm)</strong>：1纳米 = 0.000000001米，用于纳米技术和分子尺度</li>
          </ul>
          
          <h5>英制单位</h5>
          <ul>
            <li><strong>英里(mi)</strong>：1英里 = 1609.344米，用于测量较长距离</li>
            <li><strong>码(yd)</strong>：1码 = 0.9144米，约为3英尺</li>
            <li><strong>英尺(ft)</strong>：1英尺 = 0.3048米，约为12英寸</li>
            <li><strong>英寸(in)</strong>：1英寸 = 2.54厘米，常用于屏幕尺寸等</li>
          </ul>
          
          <h5>航海单位</h5>
          <ul>
            <li><strong>海里(nmi)</strong>：1海里 = 1852米，用于海上和航空导航</li>
            <li><strong>英寻(fathom)</strong>：1英寻 = 1.8288米，用于测量水深</li>
          </ul>
          
          <h5>天文单位</h5>
          <ul>
            <li><strong>天文单位(AU)</strong>：1AU = 约1.496亿千米，地球到太阳的平均距离</li>
            <li><strong>光年(ly)</strong>：光在真空中1年走过的距离，约9.461万亿千米</li>
            <li><strong>秒差距(pc)</strong>：1秒差距 = 约3.086万亿千米 = 3.262光年</li>
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
const fromUnit = ref('m');
const toUnit = ref('');  // 用于高亮显示特定结果
const precision = ref(4); // 小数位数

// 定义单位组和单位
const unitGroups = [
  {
    label: '公制',
    units: [
      { label: '千米 (km)', value: 'km' },
      { label: '米 (m)', value: 'm' },
      { label: '分米 (dm)', value: 'dm' },
      { label: '厘米 (cm)', value: 'cm' },
      { label: '毫米 (mm)', value: 'mm' },
      { label: '微米 (μm)', value: 'um' },
      { label: '纳米 (nm)', value: 'nm' }
    ]
  },
  {
    label: '英制',
    units: [
      { label: '英里 (mi)', value: 'mi' },
      { label: '码 (yd)', value: 'yd' },
      { label: '英尺 (ft)', value: 'ft' },
      { label: '英寸 (in)', value: 'in' }
    ]
  },
  {
    label: '航海/航空',
    units: [
      { label: '海里 (nmi)', value: 'nmi' },
      { label: '英寻 (fathom)', value: 'fathom' }
    ]
  },
  {
    label: '天文',
    units: [
      { label: '天文单位 (AU)', value: 'au' },
      { label: '光年 (ly)', value: 'ly' },
      { label: '秒差距 (pc)', value: 'pc' }
    ]
  }
];

// 单位到米的转换因子
const conversionFactors = {
  // 公制
  km: 1000,          // 千米到米
  m: 1,              // 米到米（基准单位）
  dm: 0.1,           // 分米到米
  cm: 0.01,          // 厘米到米
  mm: 0.001,         // 毫米到米
  um: 0.000001,      // 微米到米
  nm: 0.000000001,   // 纳米到米
  
  // 英制
  mi: 1609.344,      // 英里到米
  yd: 0.9144,        // 码到米
  ft: 0.3048,        // 英尺到米
  in: 0.0254,        // 英寸到米
  
  // 航海/航空
  nmi: 1852,         // 海里到米
  fathom: 1.8288,    // 英寻到米
  
  // 天文
  au: 149597870700,  // 天文单位到米
  ly: 9460730472580800, // 光年到米
  pc: 30856775814671900 // 秒差距到米
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
  
  // 先转换为米
  const inMeters = input * conversionFactors[fromUnit.value];
  
  // 再从米转换到各个单位
  return Object.keys(conversionFactors).map(unit => {
    return {
      unit: unit,
      value: inMeters / conversionFactors[unit]
    };
  });
});

// 获取输入框的步进值
const getStepValue = computed(() => {
  // 根据单位精度确定步进值
  if (['mm', 'cm', 'in'].includes(fromUnit.value)) {
    return 0.1;
  } else if (['um', 'nm'].includes(fromUnit.value)) {
    return 0.01;
  } else if (['au', 'ly', 'pc'].includes(fromUnit.value)) {
    return 0.0000001;
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
  if (Math.abs(value) >= 1e9 || (Math.abs(value) < 1e-9 && Math.abs(value) > 0)) {
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
.length-converter {
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
  .length-converter {
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