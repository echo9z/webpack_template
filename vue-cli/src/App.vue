<!--
* @description app
* @fileName App.vue
* @author echo9z
* @date 2023/02/28 12:03:24
!-->
<template>
  <div>
    这里是App组件哦
    {{ title }}
    <router-view></router-view>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'App',

  components: {},

  props: {},

  setup () {
    const title = ref('Vue3 App组件哦')
    return {
      title
    }
  }
})

</script>
<style lang='less' scoped>
</style>
