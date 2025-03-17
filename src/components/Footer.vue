<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="copyright">© {{ currentYear }} Web工具合集 | 版权所有</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style lang="scss" scoped>
.footer {
  margin-top: 40px;
  padding: 20px;
  background-color: var(--secondary-background, #f9f9f9);
  text-align: center;
  
  .footer-content {
    .copyright {
      color: var(--text-color-light, #666);
      font-size: 0.9rem;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 15px 10px;
    
    .footer-content {
      .copyright {
        font-size: 0.8rem;
      }
    }
  }
}
</style> 