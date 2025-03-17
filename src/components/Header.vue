<template>
  <header class="header">
    <div class="logo-container">
      <h1 class="logo">Web工具合集</h1>
    </div>
    <div class="nav-container">
      <el-switch
        v-model="isDark"
        class="theme-switch"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
        @change="toggleTheme"
      />
    </div>
  </header>
</template>

<script setup>
import { Moon, Sunny } from '@element-plus/icons-vue';
import { onMounted, ref, watch } from 'vue';

const isDark = ref(false);

onMounted(() => {
  // 检查本地存储中的主题偏好
  const savedTheme = localStorage.getItem('theme');
  
  // 如果没有保存的主题，检查系统偏好
  if (!savedTheme) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = prefersDark;
    if (prefersDark) {
      applyDarkTheme();
    } else {
      applyLightTheme();
    }
  } else if (savedTheme === 'dark') {
    isDark.value = true;
    applyDarkTheme();
  } else {
    isDark.value = false;
    applyLightTheme();
  }
});

watch(isDark, (newValue) => {
  if (newValue) {
    applyDarkTheme();
  } else {
    applyLightTheme();
  }
});

const toggleTheme = () => {
  // 保存主题偏好到本地存储
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  
  // 立即触发一次自定义事件
  window.dispatchEvent(new CustomEvent('theme-changed', { 
    detail: { isDark: isDark.value } 
  }));
  
  // 添加一个小延迟，再次触发自定义事件，确保所有组件都能响应
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { isDark: isDark.value } 
    }));
  }, 100);
  
  // 再添加一个稍长的延迟，进行第三次触发，确保所有懒加载的组件都能响应
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { isDark: isDark.value } 
    }));
  }, 300);
};

const applyDarkTheme = () => {
  document.documentElement.style.setProperty('--primary-color', '#42B983');
  document.documentElement.style.setProperty('--accent-color', '#F5A623');
  document.documentElement.style.setProperty('--background-color', '#121212');
  document.documentElement.style.setProperty('--secondary-background', '#1E1E1E');
  document.documentElement.style.setProperty('--text-color', '#E0E0E0');
  document.documentElement.style.setProperty('--text-color-light', '#BBBBBB');
  document.documentElement.style.setProperty('--border-color', '#333333');
  
  // 修改header和tool-card的样式
  document.documentElement.style.setProperty('--header-bg', '#1E1E1E');
  document.documentElement.style.setProperty('--card-bg', '#1E1E1E');
  document.documentElement.style.setProperty('--card-shadow', '0 4px 12px rgba(0, 0, 0, 0.2)');
  
  // 添加深色模式的body类，确保全局应用
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
};

const applyLightTheme = () => {
  document.documentElement.style.setProperty('--primary-color', '#42B983');
  document.documentElement.style.setProperty('--accent-color', '#F5A623');
  document.documentElement.style.setProperty('--background-color', '#FFFFFF');
  document.documentElement.style.setProperty('--secondary-background', '#f9f9f9');
  document.documentElement.style.setProperty('--text-color', '#333333');
  document.documentElement.style.setProperty('--text-color-light', '#666666');
  document.documentElement.style.setProperty('--border-color', '#EEEEEE');
  
  // 修改header和tool-card的样式
  document.documentElement.style.setProperty('--header-bg', '#FFFFFF');
  document.documentElement.style.setProperty('--card-bg', '#FFFFFF');
  document.documentElement.style.setProperty('--card-shadow', '0 4px 12px rgba(0, 0, 0, 0.05)');
  
  // 添加浅色模式的body类，确保全局应用
  document.body.classList.add('light-mode');
  document.body.classList.remove('dark-mode');
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: var(--header-bg, #fff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .logo-container {
    display: flex;
    align-items: center;

    .logo {
      font-size: 1.5rem;
      color: var(--primary-color, #42B983);
      margin: 0;
    }
  }

  .nav-container {
    display: flex;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 10px;
    
    .logo {
      font-size: 1.2rem;
    }
  }
}
</style> 