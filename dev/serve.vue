<script>
import Vue from "vue";
import VueAddressForm from "@/vue-address-form.vue";

export default Vue.extend({
  name: "ServeDev",
  components: {
    VueAddressForm,
  },
});
</script>

<template>
  <div id="app">
    <vue-address-form />
  </div>
</template>
