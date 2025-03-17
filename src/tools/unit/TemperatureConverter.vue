<template>
  <div class="temperature-converter">
    <div class="converter-container">
      <div class="converter-header">
        <h3>温度单位转换</h3>
        <p class="converter-description">
          在摄氏度、华氏度、开尔文等温度单位之间进行转换
        </p>
      </div>
      
      <div class="input-section">
        <el-form label-position="top">
          <el-form-item label="输入值">
            <el-input 
              v-model="inputValue" 
              type="number" 
              placeholder="请输入温度值" 
              @input="convert"
              :step="1"
            >
              <template #append>
                <el-select v-model="fromUnit" @change="convert" style="width: 100px">
                  <el-option
                    v-for="unit in temperatureUnits"
                    :key="unit.value"
                    :label="unit.label"
                    :value="unit.value"
                  />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="temperature-chart" v-if="inputValue" style="display: none;">
        <div class="chart-container">
          <div class="temp-scale celsius">
            <div class="scale-label">摄氏度 (°C)</div>
            <div class="scale-bar">
              <div class="temp-indicator" :style="{ bottom: getCelsiusPosition + '%' }">
                <div class="indicator-value">{{ formatValue(temperatureValues.celsius) }}°C</div>
                <div class="indicator-line"></div>
                <div class="indicator-point"></div>
              </div>
              <div class="temp-marker freezing-point">
                <div class="marker-label">冰点: 0°C</div>
                <div class="marker-line"></div>
              </div>
              <div class="temp-marker boiling-point">
                <div class="marker-label">沸点: 100°C</div>
                <div class="marker-line"></div>
              </div>
              <div class="temp-marker room-temp">
                <div class="marker-label">室温: 20°C</div>
                <div class="marker-line"></div>
              </div>
            </div>
          </div>
          
          <div class="temp-scale fahrenheit">
            <div class="scale-label">华氏度 (°F)</div>
            <div class="scale-bar">
              <div class="temp-indicator" :style="{ bottom: getFahrenheitPosition + '%' }">
                <div class="indicator-value">{{ formatValue(temperatureValues.fahrenheit) }}°F</div>
                <div class="indicator-line"></div>
                <div class="indicator-point"></div>
              </div>
              <div class="temp-marker freezing-point">
                <div class="marker-label">冰点: 32°F</div>
                <div class="marker-line"></div>
              </div>
              <div class="temp-marker boiling-point">
                <div class="marker-label">沸点: 212°F</div>
                <div class="marker-line"></div>
              </div>
              <div class="temp-marker room-temp">
                <div class="marker-label">室温: 68°F</div>
                <div class="marker-line"></div>
              </div>
            </div>
          </div>
          
          <div class="temp-scale kelvin">
            <div class="scale-label">开尔文 (K)</div>
            <div class="scale-bar">
              <div class="temp-indicator" :style="{ bottom: getKelvinPosition + '%' }">
                <div class="indicator-value">{{ formatValue(temperatureValues.kelvin) }}K</div>
                <div class="indicator-line"></div>
                <div class="indicator-point"></div>
              </div>
              <div class="temp-marker absolute-zero">
                <div class="marker-label">绝对零度: 0K</div>
                <div class="marker-line"></div>
              </div>
              <div class="temp-marker freezing-point">
                <div class="marker-label">冰点: 273.15K</div>
                <div class="marker-line"></div>
              </div>
              <div class="temp-marker boiling-point">
                <div class="marker-label">沸点: 373.15K</div>
                <div class="marker-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="results-table">
        <h4>转换结果</h4>
        <el-table :data="results" style="width: 100%">
          <el-table-column prop="unit" label="温度单位" width="180">
            <template #default="scope">
              {{ scope.row.label }}
            </template>
          </el-table-column>
          <el-table-column prop="value" label="数值">
            <template #default="scope">
              <div class="result-value">
                {{ formatValue(scope.row.value) }}{{ scope.row.symbol }}
                <el-button 
                  type="primary" 
                  size="small" 
                  circle 
                  @click="copyToClipboard(scope.row.value, scope.row.symbol)"
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
            :max="6" 
            :step="1" 
            show-stops 
            @change="convert"
          />
          <div class="precision-value">{{ precision }}</div>
        </el-form-item>
      </div>
      
      <div class="temperature-comparison" v-if="inputValue">
        <h4>温度参考</h4>
        <div class="comparison-item" :class="getTemperatureClass(temperatureValues.celsius)">
          {{ getTemperatureDescription(temperatureValues.celsius) }}
        </div>
      </div>
    </div>
    
    <div class="temperature-information">
      <el-collapse>
        <el-collapse-item title="温度单位说明" name="info">
          <p>温度是表示物体冷热程度的物理量。不同温标具有不同的定义和应用场景。</p>
          
          <h5>常用温度单位</h5>
          <ul>
            <li><strong>摄氏度(°C)</strong>：定义为水在标准大气压下的冰点为0°C，沸点为100°C。是国际上最广泛使用的温度单位。</li>
            <li><strong>华氏度(°F)</strong>：定义为水在标准大气压下的冰点为32°F，沸点为212°F。主要在美国和一些英语国家使用。</li>
            <li><strong>开尔文(K)</strong>：国际单位制的温度单位，以绝对零度（理论上分子运动停止的温度）为0K。开尔文与摄氏度的刻度相同，只是起点不同。</li>
            <li><strong>兰氏度(°R)</strong>：华氏度的绝对温标，0°R等于绝对零度。主要用于工程领域。</li>
            <li><strong>列氏度(°Ré)</strong>：历史上使用的温标，定义水的冰点为0°Ré，沸点为80°Ré。</li>
          </ul>
          
          <h5>温度转换公式</h5>
          <ul>
            <li>摄氏度 → 华氏度：°F = °C × 9/5 + 32</li>
            <li>华氏度 → 摄氏度：°C = (°F - 32) × 5/9</li>
            <li>摄氏度 → 开尔文：K = °C + 273.15</li>
            <li>开尔文 → 摄氏度：°C = K - 273.15</li>
            <li>华氏度 → 开尔文：K = (°F + 459.67) × 5/9</li>
            <li>开尔文 → 华氏度：°F = K × 9/5 - 459.67</li>
          </ul>
          
          <h5>重要温度参考点</h5>
          <ul>
            <li>绝对零度：0K = -273.15°C = -459.67°F，理论上最低的温度</li>
            <li>水的冰点（标准大气压下）：0°C = 32°F = 273.15K</li>
            <li>人体正常体温：36.5-37.5°C = 97.7-99.5°F</li>
            <li>室温（常温）：20-25°C = 68-77°F</li>
            <li>水的沸点（标准大气压下）：100°C = 212°F = 373.15K</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { DocumentCopy } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';

// 用户输入值和单位
const inputValue = ref('');
const fromUnit = ref('celsius');
const precision = ref(2); // 小数位数

// 定义温度单位
const temperatureUnits = [
  { label: '摄氏度 (°C)', value: 'celsius', symbol: '°C' },
  { label: '华氏度 (°F)', value: 'fahrenheit', symbol: '°F' },
  { label: '开尔文 (K)', value: 'kelvin', symbol: 'K' },
  { label: '兰氏度 (°R)', value: 'rankine', symbol: '°R' },
  { label: '列氏度 (°Ré)', value: 'reaumur', symbol: '°Ré' }
];

// 计算各个温度单位的值
const temperatureValues = computed(() => {
  if (!inputValue.value) {
    return {
      celsius: 0,
      fahrenheit: 32,
      kelvin: 273.15,
      rankine: 491.67,
      reaumur: 0
    };
  }
  
  const input = parseFloat(inputValue.value);
  if (isNaN(input)) {
    return {
      celsius: 0,
      fahrenheit: 32,
      kelvin: 273.15,
      rankine: 491.67,
      reaumur: 0
    };
  }
  
  // 先转换为摄氏度
  let celsius;
  switch (fromUnit.value) {
    case 'celsius':
      celsius = input;
      break;
    case 'fahrenheit':
      celsius = (input - 32) * 5 / 9;
      break;
    case 'kelvin':
      celsius = input - 273.15;
      break;
    case 'rankine':
      celsius = (input - 491.67) * 5 / 9;
      break;
    case 'reaumur':
      celsius = input * 5 / 4;
      break;
    default:
      celsius = input;
  }
  
  // 从摄氏度转换到其他单位
  return {
    celsius: celsius,
    fahrenheit: celsius * 9 / 5 + 32,
    kelvin: celsius + 273.15,
    rankine: (celsius + 273.15) * 9 / 5,
    reaumur: celsius * 4 / 5
  };
});

// 获取Chart中温度指示器的位置（百分比）
// 设定显示范围：-50°C到150°C
const getCelsiusPosition = computed(() => {
  const celsius = temperatureValues.value.celsius;
  // 温度计范围从-50°C到150°C
  const minTemp = -50;
  const maxTemp = 150;
  const range = maxTemp - minTemp;
  
  // 限制温度在视图范围内
  const clampedTemp = Math.max(minTemp, Math.min(maxTemp, celsius));
  
  // 计算百分比位置（0-100%），底部为0%，顶部为100%
  return ((clampedTemp - minTemp) / range) * 100;
});

const getFahrenheitPosition = computed(() => {
  const fahrenheit = temperatureValues.value.fahrenheit;
  // 华氏温度计范围从-58°F到302°F，对应-50°C到150°C
  const minTemp = -58;
  const maxTemp = 302;
  const range = maxTemp - minTemp;
  
  // 限制温度在视图范围内
  const clampedTemp = Math.max(minTemp, Math.min(maxTemp, fahrenheit));
  
  // 计算百分比位置
  return ((clampedTemp - minTemp) / range) * 100;
});

const getKelvinPosition = computed(() => {
  const kelvin = temperatureValues.value.kelvin;
  // 开尔文温度计范围从223.15K到423.15K，对应-50°C到150°C
  const minTemp = 223.15;
  const maxTemp = 423.15;
  const range = maxTemp - minTemp;
  
  // 限制温度在视图范围内
  const clampedTemp = Math.max(minTemp, Math.min(maxTemp, kelvin));
  
  // 计算百分比位置
  return ((clampedTemp - minTemp) / range) * 100;
});

// 格式化结果数据
const results = computed(() => {
  if (!inputValue.value) {
    return [];
  }
  
  return temperatureUnits.map(unit => {
    return {
      label: unit.label,
      value: temperatureValues.value[unit.value],
      symbol: unit.symbol
    };
  });
});

// 根据温度获取描述
const getTemperatureDescription = (celsius) => {
  if (celsius <= -273.15) return "低于绝对零度（理论上不可能）";
  if (celsius < -50) return "极度严寒";
  if (celsius < -20) return "严寒";
  if (celsius < 0) return "寒冷，低于水的冰点";
  if (celsius < 10) return "很冷";
  if (celsius < 20) return "凉爽";
  if (celsius < 30) return "舒适温度";
  if (celsius < 40) return "温暖到炎热";
  if (celsius < 50) return "非常热";
  if (celsius < 100) return "极热";
  if (celsius === 100) return "水的沸点（标准大气压下）";
  if (celsius < 300) return "超高温，可熔化铅和锡";
  if (celsius < 1000) return "高温工业过程温度";
  if (celsius < 3000) return "极端高温，可熔化大多数金属";
  return "恒星内核级温度";
};

// 根据温度获取CSS类
const getTemperatureClass = (celsius) => {
  if (celsius < -20) return "extreme-cold";
  if (celsius < 0) return "very-cold";
  if (celsius < 10) return "cold";
  if (celsius < 20) return "cool";
  if (celsius < 30) return "comfortable";
  if (celsius < 40) return "warm";
  if (celsius < 50) return "hot";
  return "extreme-hot";
};

// 执行转换
const convert = () => {
  // 结果已通过计算属性自动更新
};

// 格式化显示值
const formatValue = (value) => {
  return value.toFixed(precision.value);
};

// 复制特定值到剪贴板
const copyToClipboard = (value, symbol) => {
  const textToCopy = formatValue(value) + symbol;
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

// 当单位改变时，重新转换
watch(fromUnit, () => {
  convert();
});

// 根据温度获取颜色
const getTempColor = (celsius) => {
  if (celsius < -20) return '#9b59b6'; // 紫色 - 极冷
  if (celsius < 0) return '#3498db';   // 蓝色 - 冰点以下
  if (celsius < 20) return '#2980b9';  // 深蓝色 - 冷
  if (celsius < 25) return '#2ecc71';  // 绿色 - 适宜
  if (celsius < 30) return '#27ae60';  // 深绿色 - 暖和
  if (celsius < 40) return '#f39c12';  // 橙色 - 热
  if (celsius < 80) return '#e67e22';  // 深橙色 - 很热
  if (celsius < 100) return '#d35400'; // 红棕色 - 极热
  return '#e74c3c';                    // 红色 - 沸点及以上
};
</script>

<style lang="scss" scoped>
.temperature-converter {
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
      margin-bottom: 30px;
    }
    
    .temperature-chart {
      margin-bottom: 30px;
      
      .chart-container {
        display: flex;
        justify-content: space-around;
        height: 320px;
        border: 1px solid var(--border-color, #eee);
        border-radius: 12px;
        padding: 30px;
        background-color: var(--secondary-background, #f9f9f9);
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.03);
        
        .temp-scale {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 30%;
          
          .scale-label {
            font-weight: bold;
            margin-bottom: 15px;
            color: var(--text-color, #333);
            font-size: 1.1rem;
          }
          
          .scale-bar {
            position: relative;
            height: 250px;
            width: 24px;
            background: linear-gradient(to top, 
              #3498db 0%, // 冷（底部）
              #2ecc71 50%, // 中间（舒适）
              #e74c3c 100%  // 热（顶部）
            );
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.3);
            overflow: hidden;
            
            &:before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(to right, 
                rgba(255,255,255,0.1) 0%, 
                rgba(255,255,255,0.2) 50%, 
                rgba(255,255,255,0.1) 100%
              );
              pointer-events: none;
              border-radius: 12px;
            }
            
            .temp-indicator {
              position: absolute;
              left: 35px;
              display: flex;
              align-items: center;
              transition: bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              z-index: 10;
              
              .indicator-value {
                margin-right: 10px;
                background-color: v-bind('getTempColor(temperatureValues.celsius)');
                color: white;
                padding: 4px 10px;
                border-radius: 6px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                min-width: 70px;
                text-align: center;
                font-size: 1.05rem;
                transition: background-color 0.3s ease;
              }
              
              .indicator-line {
                width: 30px;
                height: 2px;
                background-color: v-bind('getTempColor(temperatureValues.celsius)');
                transition: background-color 0.3s ease;
              }
              
              .indicator-point {
                position: absolute;
                left: 15px;
                width: 14px;
                height: 14px;
                background-color: v-bind('getTempColor(temperatureValues.celsius)');
                border-radius: 50%;
                transform: translateX(-50%);
                box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: background-color 0.3s ease;
              }
            }
            
            .temp-marker {
              position: absolute;
              left: -70px;
              display: flex;
              align-items: center;
              width: 80px;
              
              .marker-label {
                font-size: 0.9rem;
                color: var(--text-color-light, #666);
                margin-right: 5px;
                white-space: nowrap;
                width: 100%;
                text-align: right;
              }
              
              .marker-line {
                width: 80px;
                height: 1px;
                background-color: var(--border-color, #ddd);
                position: relative;
                
                &:after {
                  content: '';
                  position: absolute;
                  right: 0;
                  top: -2px;
                  width: 5px;
                  height: 5px;
                  background-color: var(--border-color, #ddd);
                  border-radius: 50%;
                }
              }
              
              &.freezing-point {
                bottom: 36.3%;  // 对应0°C在-50到150范围内的位置
                
                .marker-line {
                  background-color: #3498db;
                  
                  &:after {
                    background-color: #3498db;
                  }
                }
                
                .marker-label {
                  color: #3498db;
                  font-weight: bold;
                }
              }
              
              &.boiling-point {
                bottom: 75%;  // 对应100°C在-50到150范围内的位置
                
                .marker-line {
                  background-color: #e74c3c;
                  
                  &:after {
                    background-color: #e74c3c;
                  }
                }
                
                .marker-label {
                  color: #e74c3c;
                  font-weight: bold;
                }
              }
              
              &.room-temp {
                bottom: 46.6%;  // 对应20°C在-50到150范围内的位置
                
                .marker-line {
                  background-color: #2ecc71;
                  
                  &:after {
                    background-color: #2ecc71;
                  }
                }
                
                .marker-label {
                  color: #2ecc71;
                  font-weight: bold;
                }
              }
              
              &.absolute-zero {
                bottom: 0;
                
                .marker-line {
                  background-color: #9b59b6;
                  
                  &:after {
                    background-color: #9b59b6;
                  }
                }
                
                .marker-label {
                  color: #9b59b6;
                  font-weight: bold;
                }
              }
            }
          }
          
          &.celsius .temp-marker.freezing-point {
            bottom: 25%;
          }
          
          &.celsius .temp-marker.boiling-point {
            bottom: 75%;
          }
          
          &.celsius .temp-marker.room-temp {
            bottom: 35%;
          }
          
          &.fahrenheit .temp-marker.freezing-point {
            bottom: 25%;
          }
          
          &.fahrenheit .temp-marker.boiling-point {
            bottom: 75%;
          }
          
          &.fahrenheit .temp-marker.room-temp {
            bottom: 35%;
          }
          
          &.kelvin .temp-marker.absolute-zero {
            bottom: 0%;
          }
          
          &.kelvin .temp-marker.freezing-point {
            bottom: 25%;
          }
          
          &.kelvin .temp-marker.boiling-point {
            bottom: 75%;
          }
        }
      }
    }
    
    .results-table {
      margin-bottom: 20px;
      
      h4 {
        margin-top: 0;
        margin-bottom: 15px;
        color: var(--text-color, #333);
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
    
    .temperature-comparison {
      margin-top: 20px;
      padding: 15px;
      border-radius: 6px;
      
      h4 {
        margin-top: 0;
        margin-bottom: 10px;
        color: var(--text-color, #333);
      }
      
      .comparison-item {
        padding: 10px 15px;
        border-radius: 4px;
        font-weight: bold;
        margin-bottom: 5px;
        
        &.extreme-cold {
          background-color: #caf0ff;
          color: #0066cc;
        }
        
        &.very-cold {
          background-color: #d4f1f9;
          color: #006699;
        }
        
        &.cold {
          background-color: #e6f7ff;
          color: #0099cc;
        }
        
        &.cool {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        &.comfortable {
          background-color: #f1f8e9;
          color: #558b2f;
        }
        
        &.warm {
          background-color: #fff8e1;
          color: #ff8f00;
        }
        
        &.hot {
          background-color: #ffebee;
          color: #c62828;
        }
        
        &.extreme-hot {
          background-color: #ffcdd2;
          color: #b71c1c;
        }
      }
    }
  }
  
  .temperature-information {
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
  .temperature-converter {
    .converter-container {
      padding: 15px;
      
      .temperature-chart {
        .chart-container {
          flex-direction: column;
          height: auto;
          padding: 20px 10px;
          
          .temp-scale {
            width: 100%;
            margin-bottom: 30px;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .scale-label {
              writing-mode: vertical-lr;
              transform: rotate(180deg);
              margin-bottom: 0;
              margin-right: 15px;
            }
            
            .scale-bar {
              height: 200px;
              
              .temp-indicator {
                left: 30px;
              }
              
              .temp-marker {
                left: auto;
                right: 30px;
                
                .marker-label {
                  text-align: left;
                  margin-right: 0;
                  margin-left: 5px;
                  order: 2;
                }
                
                .marker-line {
                  width: 40px;
                  order: 1;
                  
                  &:after {
                    right: auto;
                    left: 0;
                  }
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