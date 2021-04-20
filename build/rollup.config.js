import vue from "rollup-plugin-vue";

export default {
  input: "src/vue-address-form.vue",
  output: {
    format: "esm",
    file: "dist/vue-address-form.js",
  },
  plugins: [vue()],
};
