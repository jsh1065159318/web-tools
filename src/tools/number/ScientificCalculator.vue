<template>
  <div class="scientific-calculator">
    <div class="calculator-layout">
      <!-- 计算历史侧边栏 -->
      <div class="calculator-history" :class="{ 'has-history': calculationHistory.length > 0 }">
        <div class="history-header">
          <h3>计算历史</h3>
          <el-button type="text" @click="clearHistory" size="small" :disabled="!calculationHistory.length">
            清除历史
          </el-button>
        </div>
        <div class="history-list" v-if="calculationHistory.length > 0">
          <div 
            v-for="(item, index) in calculationHistory" 
            :key="index" 
            class="history-item"
            @click="loadFromHistory(item)"
          >
            <div class="history-formula">{{ item.formula }}</div>
            <div class="history-result">= {{ item.result }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无计算历史" />
      </div>
      
      <!-- 计算器主体 -->
      <div class="calculator-main">
        <div class="calculator-display">
          <div class="input-display">{{ displayFormula }}</div>
          <div class="result-display">{{ displayResult }}</div>
        </div>
        
        <div class="calculator-keypad">
          <div class="function-keys">
            <el-button @click="addFunction('sin')" :disabled="isDisabled" class="function-btn">sin</el-button>
            <el-button @click="addFunction('cos')" :disabled="isDisabled" class="function-btn">cos</el-button>
            <el-button @click="addFunction('tan')" :disabled="isDisabled" class="function-btn">tan</el-button>
            <el-button @click="addFunction('log')" :disabled="isDisabled" class="function-btn">log</el-button>
            <el-button @click="addFunction('ln')" :disabled="isDisabled" class="function-btn">ln</el-button>
          </div>
          <div class="function-keys">
            <el-button @click="addOperator('^')" :disabled="isDisabled" class="function-btn">x<sup>y</sup></el-button>
            <el-button @click="addFunction('sqrt')" :disabled="isDisabled" class="function-btn">√</el-button>
            <el-button @click="addConstant('PI')" :disabled="isDisabled" class="function-btn">π</el-button>
            <el-button @click="addConstant('E')" :disabled="isDisabled" class="function-btn">e</el-button>
            <el-button @click="toggleDegRad" :disabled="isDisabled" class="function-btn">{{ angleMode }}</el-button>
          </div>
          
          <div class="main-keypad">
            <div class="keypad-grid">
              <el-button @click="clearEntry" type="danger" :disabled="isDisabled" class="calc-btn">CE</el-button>
              <el-button @click="clearAll" type="danger" :disabled="isDisabled" class="calc-btn">C</el-button>
              <el-button @click="backspace" :disabled="isDisabled" class="calc-btn">
                <el-icon><Back /></el-icon>
              </el-button>
              <el-button @click="addOperator('/')" type="warning" :disabled="isDisabled" class="calc-btn">÷</el-button>

              <el-button @click="addToFormula('7')" :disabled="isDisabled" class="calc-btn">7</el-button>
              <el-button @click="addToFormula('8')" :disabled="isDisabled" class="calc-btn">8</el-button>
              <el-button @click="addToFormula('9')" :disabled="isDisabled" class="calc-btn">9</el-button>
              <el-button @click="addOperator('*')" type="warning" :disabled="isDisabled" class="calc-btn">×</el-button>

              <el-button @click="addToFormula('4')" :disabled="isDisabled" class="calc-btn">4</el-button>
              <el-button @click="addToFormula('5')" :disabled="isDisabled" class="calc-btn">5</el-button>
              <el-button @click="addToFormula('6')" :disabled="isDisabled" class="calc-btn">6</el-button>
              <el-button @click="addOperator('-')" type="warning" :disabled="isDisabled" class="calc-btn">-</el-button>

              <el-button @click="addToFormula('1')" :disabled="isDisabled" class="calc-btn">1</el-button>
              <el-button @click="addToFormula('2')" :disabled="isDisabled" class="calc-btn">2</el-button>
              <el-button @click="addToFormula('3')" :disabled="isDisabled" class="calc-btn">3</el-button>
              <el-button @click="addOperator('+')" type="warning" :disabled="isDisabled" class="calc-btn">+</el-button>

              <el-button @click="addParenthesis('(')" :disabled="isDisabled" class="calc-btn">(</el-button>
              <el-button @click="addToFormula('0')" :disabled="isDisabled" class="calc-btn">0</el-button>
              <el-button @click="addParenthesis(')')" :disabled="isDisabled" class="calc-btn">)</el-button>
              <el-button @click="calculate" type="primary" :disabled="isDisabled" class="calc-btn">=</el-button>

              <el-button @click="addToFormula('.')" :disabled="isDisabled" class="calc-btn decimal-btn">.</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      @close="clearError"
    />
  </div>
</template>

<script setup>
import { Back } from '@element-plus/icons-vue';
import * as math from 'mathjs';
import { computed, ref } from 'vue';

const currentFormula = ref('');
const currentResult = ref('');
const errorMessage = ref('');
const angleMode = ref('DEG'); // DEG为角度制，RAD为弧度制
const calculationHistory = ref([]);
const isCalculating = ref(false);

// 用于在显示时格式化公式
const displayFormula = computed(() => {
  return currentFormula.value
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/sqrt/g, '√')
    .replace(/PI/g, 'π')
    .replace(/sin/g, 'sin')
    .replace(/cos/g, 'cos')
    .replace(/tan/g, 'tan')
    .replace(/log/g, 'log')
    .replace(/ln/g, 'ln');
});

// 显示结果
const displayResult = computed(() => {
  if (!currentResult.value) return '';
  
  // 如果结果是数字，格式化显示
  if (!isNaN(currentResult.value)) {
    const num = parseFloat(currentResult.value);
    // 处理非常大或非常小的数字，使用科学计数法
    if (Math.abs(num) < 0.0000001 || Math.abs(num) > 10000000) {
      return num.toExponential(6);
    }
    // 最多显示10位有效数字
    return parseFloat(num.toPrecision(10)).toString();
  }
  
  return currentResult.value;
});

// 是否禁用按钮
const isDisabled = computed(() => {
  return isCalculating.value;
});

// 添加数字或小数点到公式
const addToFormula = (value) => {
  currentFormula.value += value;
};

// 添加运算符
const addOperator = (operator) => {
  // 如果公式为空且用户输入减号，允许输入负数
  if (currentFormula.value === '' && operator === '-') {
    currentFormula.value = '-';
    return;
  }
  
  // 防止连续输入多个运算符
  const lastChar = currentFormula.value.slice(-1);
  if (['+', '-', '*', '/', '^'].includes(lastChar)) {
    // 如果最后一个字符是运算符，替换它
    currentFormula.value = currentFormula.value.slice(0, -1) + operator;
  } else {
    currentFormula.value += operator;
  }
};

// 添加函数
const addFunction = (func) => {
  // 确保函数后跟左括号
  currentFormula.value += `${func}(`;
};

// 添加常量
const addConstant = (constant) => {
  currentFormula.value += constant;
};

// 添加括号
const addParenthesis = (parenthesis) => {
  currentFormula.value += parenthesis;
};

// 清除当前输入
const clearEntry = () => {
  currentFormula.value = '';
  clearError();
};

// 清除全部（输入和结果）
const clearAll = () => {
  currentFormula.value = '';
  currentResult.value = '';
  clearError();
};

// 退格键
const backspace = () => {
  currentFormula.value = currentFormula.value.slice(0, -1);
};

// 切换角度制/弧度制
const toggleDegRad = () => {
  angleMode.value = angleMode.value === 'DEG' ? 'RAD' : 'DEG';
};

// 计算结果
const calculate = () => {
  if (!currentFormula.value) return;
  
  clearError();
  isCalculating.value = true;
  
  try {
    // 创建数学环境
    const mathScope = { PI: Math.PI, E: Math.E };
    
    // 替换角度制的三角函数
    let formula = currentFormula.value;
    if (angleMode.value === 'DEG') {
      // 角度转弧度
      formula = formula
        .replace(/sin\(/g, `sin((PI/180)*`)
        .replace(/cos\(/g, `cos((PI/180)*`)
        .replace(/tan\(/g, `tan((PI/180)*`);
    }
    
    // 替换自然对数
    formula = formula.replace(/ln\(/g, `log(E,`);
    
    // 执行计算
    const result = math.evaluate(formula, mathScope);
    
    // 更新结果
    currentResult.value = result;
    
    // 添加到历史记录
    calculationHistory.value.unshift({
      formula: displayFormula.value,
      result: displayResult.value
    });
    
    // 限制历史记录数量
    if (calculationHistory.value.length > 10) {
      calculationHistory.value.pop();
    }
  } catch (error) {
    errorMessage.value = `计算错误：${error.message}`;
    console.error(error);
    currentResult.value = 'Error';
  } finally {
    isCalculating.value = false;
  }
};

// 清除错误信息
const clearError = () => {
  errorMessage.value = '';
};

// 清除历史记录
const clearHistory = () => {
  calculationHistory.value = [];
};

// 从历史记录加载
const loadFromHistory = (item) => {
  // 将显示格式转换回计算格式
  let formula = item.formula
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'PI');
  
  currentFormula.value = formula;
};
</script>

<style lang="scss" scoped>
.scientific-calculator {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
  
  .calculator-layout {
    display: flex;
    gap: 20px;
    
    .calculator-history {
      width: 280px;
      flex-shrink: 0;
      height: 600px;
      border: 1px solid var(--border-color, #eee);
      border-radius: 8px;
      padding: 15px;
      background-color: var(--secondary-background, #f9f9f9);
      
      &.has-history {
        display: flex;
        flex-direction: column;
      }
      
      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        h3 {
          margin: 0;
          color: var(--text-color, #333);
        }
      }
      
      .history-list {
        flex-grow: 1;
        overflow-y: auto;
        
        .history-item {
          padding: 10px;
          margin-bottom: 10px;
          background-color: var(--card-bg, white);
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          
          &:hover {
            background-color: rgba(66, 185, 131, 0.1);
          }
          
          .history-formula {
            color: var(--text-color-light, #666);
            font-size: 1rem;
            word-break: break-all;
          }
          
          .history-result {
            font-weight: bold;
            color: var(--text-color, #333);
            font-size: 1.1rem;
            margin-top: 5px;
          }
        }
      }
    }
    
    .calculator-main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .calculator-display {
        background-color: var(--secondary-background, #f9f9f9);
        border: 1px solid var(--border-color, #eee);
        border-radius: 8px;
        padding: 20px;
        text-align: right;
        
        .input-display {
          font-size: 1.4rem;
          color: var(--text-color-light, #666);
          min-height: 1.8rem;
          word-break: break-all;
          margin-bottom: 10px;
        }
        
        .result-display {
          font-size: 2.2rem;
          font-weight: bold;
          color: var(--text-color, #333);
          min-height: 2.8rem;
        }
      }
      
      .calculator-keypad {
        display: flex;
        flex-direction: column;
        gap: 15px;
        
        .function-keys {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          
          .function-btn {
            height: 50px;
            font-size: 1.2rem;
            font-weight: bold;
          }
        }
        
        .main-keypad {
          .keypad-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(6, 1fr);
            gap: 10px;
            
            .calc-btn {
              height: 60px;
              font-size: 1.4rem;
              font-weight: bold;
            }
            
            .decimal-btn {
              grid-column: span 4;
            }
          }
        }
      }
    }
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .scientific-calculator {
    .calculator-layout {
      .calculator-history {
        width: 220px;
      }
      
      .calculator-main {
        .calculator-keypad {
          .function-keys {
            .function-btn {
              height: 45px;
              font-size: 1.1rem;
            }
          }
          
          .main-keypad {
            .keypad-grid {
              .calc-btn {
                height: 55px;
                font-size: 1.3rem;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .scientific-calculator {
    .calculator-layout {
      flex-direction: column-reverse;
      
      .calculator-history {
        width: 100%;
        height: auto;
        max-height: 300px;
      }
      
      .calculator-main {
        .calculator-display {
          padding: 15px;
          
          .input-display {
            font-size: 1.2rem;
          }
          
          .result-display {
            font-size: 1.8rem;
          }
        }
        
        .calculator-keypad {
          .function-keys {
            grid-template-columns: repeat(3, 1fr);
            
            .function-btn {
              height: 45px;
              font-size: 1rem;
            }
          }
          
          .main-keypad {
            .keypad-grid {
              .calc-btn {
                height: 50px;
                font-size: 1.2rem;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .scientific-calculator {
    .calculator-layout {
      .calculator-main {
        .calculator-keypad {
          .function-keys {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      }
    }
  }
}
</style> 