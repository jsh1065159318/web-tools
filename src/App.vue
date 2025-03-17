<template>
  <div class="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  } else if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.add('light-mode');
  }
});
</script>

<style lang="scss">
:root {
  --primary-color: #42B983;
  --accent-color: #F5A623;
  --background-color: #FFFFFF;
  --secondary-background: #f9f9f9;
  --text-color: #333333;
  --text-color-light: #666666;
  --border-color: #EEEEEE;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.5;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  .main-content {
    flex: 1;
  }
}

a {
  text-decoration: none;
  color: var(--primary-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
}
</style> 