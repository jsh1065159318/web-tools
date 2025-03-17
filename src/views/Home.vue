<template>
  <div class="home">
    <div class="tools-container">
      <div class="tools-grid">
        <ToolCard
          v-for="tool in toolCategories"
          :key="tool.title"
          :title="tool.title"
          :description="tool.description"
          :icon="tool.icon"
          :count="tool.count"
          :to="tool.route"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ToolCard from '../components/ToolCard.vue';

const toolCategories = [
  {
    title: '文本工具',
    description: '文本格式转换、编码/解码、对比、计数等工具',
    icon: 'Document',
    count: 7,
    route: '/text-tools'
  },
  {
    title: '数字工具',
    description: '计算器、随机数生成、数学函数计算等工具',
    icon: 'Calculator',
    count: 6,
    route: '/number-tools'
  },
  {
    title: '图片工具',
    description: '图片格式转换、压缩、调整大小、滤镜效果等工具',
    icon: 'Picture',
    count: 8,
    route: '/image-tools'
  },
  {
    title: '单位转换',
    description: '长度、重量、面积、体积、温度等单位转换工具',
    icon: 'ScaleToOriginal',
    count: 8,
    route: '/unit-converter'
  }
];
</script>

<style lang="scss" scoped>
.home {
  .tools-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
  }
}

@media (max-width: 1024px) {
  .home {
    .tools-container {
      .tools-grid {
        gap: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .home {
    .tools-container {
      padding: 15px;
      
      .tools-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style> 