<template>
  <div class="text-tools">
    <div class="page-header">
      <h1 class="page-title">文本工具</h1>
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
          <el-menu-item v-for="tool in textTools" :key="tool.id" :index="tool.id">
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

// 使用异步组件，懒加载工具组件
const CaseConverter = defineAsyncComponent(() => import('../tools/text/CaseConverter.vue'));
const Base64Converter = defineAsyncComponent(() => import('../tools/text/Base64Converter.vue'));
const TextCounter = defineAsyncComponent(() => import('../tools/text/TextCounter.vue'));

const router = useRouter();
const activeToolId = ref('text-case-converter');
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

const textTools = [
  {
    id: 'text-case-converter',
    name: '大小写转换',
    description: '快速转换文本大小写，支持全部大写、全部小写、首字母大写等多种模式',
    icon: 'Edit',
    component: CaseConverter,
    implemented: true,
    helpText: '选择转换模式，输入文本后即可转换大小写'
  },
  {
    id: 'text-encoder',
    name: 'Base64编码/解码',
    description: '支持Base64、URL编码、HTML转义等多种编码格式的转换',
    icon: 'Connection',
    component: Base64Converter,
    implemented: true,
    helpText: '选择编码或解码模式，输入文本后点击按钮进行转换'
  },
  {
    id: 'text-counter',
    name: '文本字符统计',
    description: '统计文本中的字符数、单词数、行数等信息',
    icon: 'Document',
    component: TextCounter,
    implemented: true,
    helpText: '输入文本后自动统计各项数据，可生成统计报告'
  },
  {
    id: 'text-diff',
    name: '文本差异对比',
    description: '对比两段文本，以直观方式显示它们之间的差异',
    icon: 'Document',
    implemented: false
  },
  {
    id: 'regex-tester',
    name: '正则表达式测试',
    description: '测试和验证正则表达式，实时查看匹配结果',
    icon: 'Search',
    implemented: false
  },
  {
    id: 'text-replacer',
    name: '文本替换工具',
    description: '批量替换文本中的指定内容，支持正则表达式',
    icon: 'Edit',
    implemented: false
  },
  {
    id: 'random-text-generator',
    name: '随机文本生成器',
    description: '生成指定长度和特定模式的随机文本',
    icon: 'RefreshRight',
    implemented: false
  }
];

const resolveIcon = (iconName) => {
  return ElementPlusIconsVue[iconName] || iconName;
};

const currentTool = computed(() => {
  return textTools.find(tool => tool.id === activeToolId.value) || textTools[0];
});

const handleToolSelect = (id) => {
  activeToolId.value = id;
  loadToolComponent(id);
};

// 加载选中的工具组件
const loadToolComponent = (toolId) => {
  const tool = textTools.find(t => t.id === toolId);
  
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
.text-tools {
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
  .text-tools {
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