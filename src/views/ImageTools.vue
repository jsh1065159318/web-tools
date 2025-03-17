<template>
  <div class="image-tools">
    <div class="page-header">
      <h1 class="page-title">图片工具</h1>
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
          <el-menu-item v-for="tool in imageTools" :key="tool.id" :index="tool.id">
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
const activeToolId = ref('qrcode-generator');
const forceUpdate = ref(0); // 用于强制组件重新渲染
const currentComponent = shallowRef(null);

// 懒加载组件
const QRCodeGenerator = defineAsyncComponent(() => 
  import('@/tools/image/QRCodeGenerator.vue')
);
const ImageConverter = defineAsyncComponent(() => 
  import('@/tools/image/ImageConverter.vue')
);
const ImageCompressor = defineAsyncComponent(() => 
  import('@/tools/image/ImageCompressor.vue')
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

const imageTools = [
  {
    id: 'qrcode-generator',
    name: '二维码生成器',
    description: '生成自定义内容和样式的二维码，支持导出为多种格式',
    icon: 'Discount',
    component: QRCodeGenerator,
    isImplemented: true,
    helpText: '输入文本或网址，调整选项，生成二维码，支持下载为PNG、JPEG或SVG格式'
  },
  {
    id: 'image-converter',
    name: '图片格式转换',
    description: '将图片转换为JPG、PNG、WebP等不同格式',
    icon: 'Picture',
    component: ImageConverter,
    isImplemented: true,
    helpText: '上传图片，选择目标格式和质量，批量转换并下载转换后的图片'
  },
  {
    id: 'image-compressor',
    name: '图片压缩',
    description: '压缩图片大小，减小文件体积，保持良好的视觉质量',
    icon: 'PictureFilled',
    component: ImageCompressor,
    isImplemented: true,
    helpText: '上传图片，选择压缩程度，压缩后可比较压缩前后的差异并下载'
  },
  {
    id: 'image-resize',
    name: '图片调整大小',
    description: '调整图片尺寸，支持按比例缩放或自定义宽高',
    icon: 'ScaleToOriginal',
    isImplemented: false
  },
  {
    id: 'image-filter',
    name: '图片滤镜效果',
    description: '为图片添加各种滤镜效果，如灰度、复古、模糊等',
    icon: 'Filter',
    isImplemented: false
  },
  {
    id: 'image-watermark',
    name: '图片添加水印',
    description: '为图片添加文字或图片水印，支持自定义位置和透明度',
    icon: 'Stamp',
    isImplemented: false
  },
  {
    id: 'image-color-extract',
    name: '图片色彩提取',
    description: '提取图片中的主色调和配色方案',
    icon: 'PictureFilled',
    isImplemented: false
  },
  {
    id: 'image-to-base64',
    name: '图片转Base64',
    description: '将图片转换为Base64编码，方便在网页中嵌入使用',
    icon: 'Link',
    isImplemented: false
  }
];

const resolveIcon = (iconName) => {
  return ElementPlusIconsVue[iconName] || iconName;
};

const currentTool = computed(() => {
  return imageTools.find(tool => tool.id === activeToolId.value) || imageTools[0];
});

const handleToolSelect = (id) => {
  activeToolId.value = id;
  loadToolComponent(id);
};

const loadToolComponent = (toolId) => {
  const tool = imageTools.find(t => t.id === toolId);
  currentComponent.value = tool?.component || null;
};

const goHome = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.image-tools {
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
  .image-tools {
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