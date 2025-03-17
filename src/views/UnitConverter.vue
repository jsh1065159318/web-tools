<template>
  <div class="unit-converter">
    <div class="page-header">
      <h1 class="page-title">单位转换</h1>
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
          <el-menu-item v-for="tool in unitTools" :key="tool.id" :index="tool.id">
            <el-icon><component :is="resolveIcon(tool.icon)" /></el-icon>
            <span>{{ tool.name }}</span>
            <el-tag v-if="tool.isImplemented === false" size="small" type="info">开发中</el-tag>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="content">
        <div class="tool-container">
          <h2 class="tool-title">
            {{ currentTool.name }}
            <el-tooltip :content="currentTool.helpText || '暂无帮助信息'" placement="top">
              <el-button type="info" circle size="small">
                <el-icon><QuestionFilled /></el-icon>
              </el-button>
            </el-tooltip>
          </h2>
          <p class="tool-description">{{ currentTool.description }}</p>
          
          <div class="tool-interface">
            <component 
              v-if="currentComponent && currentTool.isImplemented !== false" 
              :is="currentComponent" 
            />
            <div v-else class="placeholder">
              <el-empty :description="currentTool.isImplemented === false ? '该工具正在开发中，敬请期待' : '请选择左侧工具开始使用'" />
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

const router = useRouter();
const activeToolId = ref('length-converter');
const forceUpdate = ref(0); // 用于强制组件重新渲染
const currentComponent = shallowRef(null);

// 懒加载组件
const LengthConverter = defineAsyncComponent(() => 
  import('@/tools/unit/LengthConverter.vue')
);
const WeightConverter = defineAsyncComponent(() => 
  import('@/tools/unit/WeightConverter.vue')
);
const TemperatureConverter = defineAsyncComponent(() => 
  import('@/tools/unit/TemperatureConverter.vue')
);

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

const unitTools = [
  {
    id: 'length-converter',
    name: '长度单位转换',
    description: '在米、厘米、英寸、英尺等长度单位之间进行转换',
    icon: 'ScaleToOriginal',
    component: LengthConverter,
    isImplemented: true,
    helpText: '输入一个长度值，选择输入单位，即可看到其他单位的换算结果'
  },
  {
    id: 'weight-converter',
    name: '重量单位转换',
    description: '在千克、克、磅等重量单位之间进行转换',
    icon: 'Briefcase',
    component: WeightConverter,
    isImplemented: true,
    helpText: '输入一个重量值，选择输入单位，即可看到其他单位的换算结果'
  },
  {
    id: 'temperature-converter',
    name: '温度单位转换',
    description: '在摄氏度、华氏度、开尔文等温度单位之间进行转换',
    icon: 'Sunny',
    component: TemperatureConverter,
    isImplemented: true,
    helpText: '输入一个温度值，选择输入单位，查看温度单位转换以及温度可视化展示'
  },
  {
    id: 'area-converter',
    name: '面积单位转换',
    description: '在平方米、平方英尺、亩、公顷等面积单位之间进行转换',
    icon: 'Position',
    isImplemented: false
  },
  {
    id: 'volume-converter',
    name: '体积单位转换',
    description: '在立方米、升、加仑等体积单位之间进行转换',
    icon: 'DataLine',
    isImplemented: false
  },
  {
    id: 'time-converter',
    name: '时间单位转换',
    description: '在秒、分、时、天等时间单位之间进行转换',
    icon: 'Timer',
    isImplemented: false
  },
  {
    id: 'data-converter',
    name: '数据存储单位转换',
    description: '在B、KB、MB、GB等数据存储单位之间进行转换',
    icon: 'DataLine',
    isImplemented: false
  },
  {
    id: 'speed-converter',
    name: '速度单位转换',
    description: '在米/秒、千米/时、英里/时等速度单位之间进行转换',
    icon: 'Odometer',
    isImplemented: false
  }
];

const resolveIcon = (iconName) => {
  return ElementPlusIconsVue[iconName] || iconName;
};

const currentTool = computed(() => {
  return unitTools.find(tool => tool.id === activeToolId.value) || unitTools[0];
});

const handleToolSelect = (id) => {
  activeToolId.value = id;
  loadToolComponent(id);
};

const loadToolComponent = (toolId) => {
  const tool = unitTools.find(t => t.id === toolId);
  currentComponent.value = tool?.component || null;
};

const goHome = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.unit-converter {
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
        
        .el-menu-item {
          display: flex;
          align-items: center;
          
          .el-tag {
            margin-left: auto;
          }
        }
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
  .unit-converter {
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