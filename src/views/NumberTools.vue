<template>
  <div class="number-tools">
    <div class="page-header">
      <h1 class="page-title">数字工具</h1>
      <el-button type="primary" plain @click="goHome">
        <el-icon><Back /></el-icon>返回主页
      </el-button>
    </div>
    
    <div class="tools-layout">
      <div class="sidebar">
        <h2 class="sidebar-title">工具列表</h2>
        <el-menu 
          :default-active="activeToolId"
          class="tool-menu"
          :background-color="getMenuBackground"
          :text-color="getTextColor"
          :active-text-color="getPrimaryColor"
          @select="handleToolSelect">
          <el-menu-item v-for="tool in numberTools" :key="tool.id" :index="tool.id">
            <el-icon><component :is="resolveIcon(tool.icon)" /></el-icon>
            <span>{{ tool.name }}</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="content">
        <div class="tool-container">
          <h2 class="tool-title">
            {{ currentTool.name }}
            <el-tooltip :content="currentTool.helpText || '查看使用帮助'" placement="top">
              <el-button type="info" circle size="small">
                <el-icon><QuestionFilled /></el-icon>
              </el-button>
            </el-tooltip>
          </h2>
          <p class="tool-description">{{ currentTool.description }}</p>
          
          <div class="tool-interface">
            <!-- 动态加载选中的工具组件 -->
            <component 
              v-if="currentToolComponent" 
              :is="currentToolComponent"
            />
            <!-- 未实现工具的占位符 -->
            <div v-else-if="!currentTool.implemented" class="placeholder">
              <el-empty description="该工具正在开发中，敬请期待..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { Back, QuestionFilled } from '@element-plus/icons-vue';
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';

// 异步加载工具组件
const ScientificCalculator = defineAsyncComponent(() => import('../tools/number/ScientificCalculator.vue'));
const RandomGenerator = defineAsyncComponent(() => import('../tools/number/RandomGenerator.vue'));
const BaseConverter = defineAsyncComponent(() => import('../tools/number/BaseConverter.vue'));

const router = useRouter();
const activeToolId = ref('scientific-calculator');
const currentToolComponent = shallowRef(null);
const forceUpdate = ref(0); // 用于强制组件重新渲染

// 监听主题变化事件
onMounted(() => {
  window.addEventListener('theme-changed', handleThemeChange);
  loadToolComponent(activeToolId.value);
});

onUnmounted(() => {
  window.removeEventListener('theme-changed', handleThemeChange);
});

const handleThemeChange = () => {
  forceUpdate.value += 1; // 增加值以触发计算属性重新计算
};

// 菜单背景色
const getMenuBackground = computed(() => {
  // forceUpdate会在主题变化时改变，使这个计算属性重新计算
  forceUpdate.value;
  const isDarkMode = document.body.classList.contains('dark-mode');
  return isDarkMode ? '#1E1E1E' : '#f9f9f9';
});

// 菜单文字颜色
const getTextColor = computed(() => {
  forceUpdate.value;
  const isDarkMode = document.body.classList.contains('dark-mode');
  return isDarkMode ? '#BBBBBB' : '#666666';
});

// 菜单选中文字颜色
const getPrimaryColor = computed(() => {
  return '#42B983'; // 主色调一致
});

const numberTools = [
  {
    id: 'scientific-calculator',
    name: '科学计算器',
    description: '功能强大的科学计算器，支持多种数学函数和计算历史记录',
    icon: 'Histogram',
    component: ScientificCalculator,
    implemented: true,
    helpText: '使用界面上的按钮进行计算，支持数学函数和历史记录'
  },
  {
    id: 'random-generator',
    name: '随机数生成器',
    description: '生成随机数字或字符串，可自定义范围和格式',
    icon: 'Refresh',
    component: RandomGenerator,
    implemented: true,
    helpText: '设置随机数的范围、数量和格式，然后生成随机结果'
  },
  {
    id: 'base-converter',
    name: '进制转换器',
    description: '在二进制、八进制、十进制、十六进制等进制之间转换数值',
    icon: 'Switch',
    component: BaseConverter,
    implemented: true,
    helpText: '设置输入的进制和值，选择要转换的目标进制'
  },
  {
    id: 'number-sequence',
    name: '数字序列生成器',
    description: '生成等差数列、等比数列、斐波那契数列等数字序列',
    icon: 'Sort',
    implemented: false
  },
  {
    id: 'prime-checker',
    name: '素数检测器',
    description: '检测一个数是否为素数，分解质因数',
    icon: 'Search',
    implemented: false
  },
  {
    id: 'statistical-analysis',
    name: '数据统计分析',
    description: '计算平均值、中位数、方差、标准差等统计指标',
    icon: 'DataLine',
    implemented: false
  }
];

const resolveIcon = (iconName) => {
  return ElementPlusIconsVue[iconName] || iconName;
};

const currentTool = computed(() => {
  return numberTools.find(tool => tool.id === activeToolId.value) || numberTools[0];
});

const handleToolSelect = (id) => {
  activeToolId.value = id;
  loadToolComponent(id);
};

// 加载选中的工具组件
const loadToolComponent = (toolId) => {
  const tool = numberTools.find(t => t.id === toolId);
  
  if (tool && tool.implemented && tool.component) {
    currentToolComponent.value = tool.component;
  } else {
    currentToolComponent.value = null;
  }
};

const goHome = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.number-tools {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: var(--secondary-background, #f9f9f9);
    border-bottom: 1px solid var(--border-color, #eee);
    
    .page-title {
      margin: 0;
      color: var(--text-color, #333);
      font-size: 1.8rem;
    }
  }
  
  .tools-layout {
    display: flex;
    min-height: calc(100vh - 180px);
    
    .sidebar {
      width: 240px;
      border-right: 1px solid var(--border-color, #eee);
      background-color: var(--secondary-background, #f9f9f9);
      padding: 20px 0;
      
      .sidebar-title {
        padding: 0 20px;
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 1.2rem;
        color: var(--text-color-light, #666);
      }
      
      .tool-menu {
        border-right: none;
      }
    }
    
    .content {
      flex: 1;
      padding: 20px;
      
      .tool-container {
        .tool-title {
          display: flex;
          align-items: center;
          font-size: 1.5rem;
          margin-top: 0;
          color: var(--text-color, #333);
          
          .el-button {
            margin-left: 10px;
          }
        }
        
        .tool-description {
          color: var(--text-color-light, #666);
          margin-bottom: 20px;
        }
        
        .tool-interface {
          background-color: var(--card-bg, white);
          border-radius: 8px;
          box-shadow: var(--card-shadow, 0 2px 12px rgba(0, 0, 0, 0.05));
          padding: 20px;
          min-height: 300px;
          
          .placeholder {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .number-tools {
    .page-header {
      padding: 15px;
      
      .page-title {
        font-size: 1.5rem;
      }
    }
    
    .tools-layout {
      flex-direction: column;
      
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border-color, #eee);
        padding: 10px 0;
      }
      
      .content {
        padding: 15px;
      }
    }
  }
}
</style> 