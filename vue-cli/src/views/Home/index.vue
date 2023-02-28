<!--
* @description home
* @fileName index.vue
* @author echo9z
* @date 2023/02/28 14:29:52
!-->
<template>
  <div>这里的是home组件：{{ home }}</div>
  <el-button type="primary">element</el-button>
</template>

<script>
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'Home',

  components: {},

  props: {},

  setup () {
    const home = ref('home页面')
    return {
      home
    }
  }
})

</script>
<style lang='less' scoped>
</style>
