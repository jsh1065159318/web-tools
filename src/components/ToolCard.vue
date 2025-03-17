<template>
  <router-link :to="to" custom v-slot="{ navigate }">
    <div class="tool-card" @click="navigate" role="link">
      <div class="tool-icon">
        <el-icon :size="32"><component :is="resolveIcon(icon)" /></el-icon>
      </div>
      <div class="tool-info">
        <h2 class="tool-title">{{ title }}</h2>
        <p class="tool-description">{{ description }}</p>
        <p class="tool-count">{{ count }}个工具</p>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  to: {
    type: String,
    required: true
  }
});

const resolveIcon = (iconName) => {
  return ElementPlusIconsVue[iconName];
};
</script>

<style lang="scss" scoped>
.tool-card {
  display: flex;
  flex-direction: column;
  background-color: var(--card-bg, white);
  border-radius: 8px;
  box-shadow: var(--card-shadow, 0 4px 12px rgba(0, 0, 0, 0.05));
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  .tool-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 64px;
    height: 64px;
    background-color: rgba(66, 185, 131, 0.1);
    border-radius: 50%;
    margin-bottom: 16px;
    color: var(--primary-color, #42B983);
    
    .el-icon {
      font-size: 32px;
    }
  }
  
  .tool-info {
    flex: 1;
    
    .tool-title {
      font-size: 1.5rem;
      margin: 0 0 8px 0;
      color: var(--text-color, #333);
    }
    
    .tool-description {
      color: var(--text-color-light, #666);
      margin: 0 0 12px 0;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    
    .tool-count {
      font-size: 0.8rem;
      color: #999;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .tool-card {
    padding: 16px;
    
    .tool-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      
      .el-icon {
        font-size: 24px;
      }
    }
    
    .tool-info {
      .tool-title {
        font-size: 1.3rem;
      }
    }
  }
}
</style> 