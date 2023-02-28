<!--
* @description layout
* @fileName index.vue
* @author echo9z
* @date 2023/02/28 16:11:28
!-->
<template>
  <div>
    <ul>
      <li><RouterLink to="/home">home</RouterLink></li>
      <li><RouterLink to="/about">about</RouterLink></li>
    </ul>
    <!-- 二级出口 /home -->
    <router-view></router-view>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: '',

  components: {},

  props: {},

  setup () {
    return {
    }
  }
})

</script>
<style lang='less' scoped>
</style>
