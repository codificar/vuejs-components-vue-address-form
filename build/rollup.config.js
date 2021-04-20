import vue from "rollup-plugin-vue";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/vue-address-form.vue",
  output: {
    format: "esm",
    file: "dist/vue-address-form.js",
  },
  plugins: [
    vue(),
    resolve(),
    babel({
      exclude: "node_modules/**",
      extensions: [".js", ".jsx", ".ts", ".tsx", ".vue"],
      babelHelpers: "bundled",
    }),
    commonjs(),
    json(),
  ],
};
