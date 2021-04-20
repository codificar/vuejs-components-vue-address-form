import { debounce } from 'lodash';
import axios from 'axios';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import VueElementLoading from 'vue-element-loading';

//

var script = {
  components: {
    ValidationObserver,
    ValidationProvider,
    VueElementLoading,
  },
  name: "VueAddressForm",
  props: {
    currentAddress: {
      type: Object,
      default: () => ({}),
    },
    addressesList: {
      type: Array,
      default: () => [],
    },
    showAddressName: {
      type: Boolean,
      default: () => true,
    },
    showFormButton: {
      type: Boolean,
      default: () => true,
    },

    autocompleteParams: {
      type: Object,
      required: true,
    },
    autocompleteUrl: {
      type: String,
      required: true,
    },
    geocodeUrl: {
      type: String,
      required: true,
    },
    zipCodeUrl: {
      type: String,
      required: true,
    },
  },

  watch: {
    addressForm: {
      handler: function(newVal) {
        this.$emit("input", newVal);
      },
      deep: true,
    },
  },

  data() {
    return {
      addressForm: {
        zip_code: "",
        street: "",
        city: "",
        country: "",
        district: "",
        state: "",

        latitude: "",
        longitude: "",

        location_name: "",
        number: "",

        complement: "",

        full_address: "",
      },
      loadZipCode: false,
    };
  },

  methods: {
    trans(key) {
      return _.get(window.lang, key, key);
    },
    async callAutocompleteApi(searchString) {
      const { data: response } = await axios.get(this.autocompleteUrl, {
        params: { ...this.autocompleteParams, place: searchString },
      });

      if (response.success && response.data.length > 0) {
        let addressData = response.data[0];
        if (addressData.place_id != null)
          addressData = await this.callGeocodeApi(addressData.address);

        this.addressForm.latitude = addressData.latitude;
        this.addressForm.longitude = addressData.longitude;
      } else {
        this.$toasted.show(this.trans("common_address.zip_code_not_found"), {
          theme: "bubble",
          type: "warning",
          position: "bottom-center",
          duration: 5000,
        });
      }
    },
    async callGeocodeApi(address) {
      const { data: response } = await axios.get(this.geocodeUrl, {
        params: { ...this.autocompleteParams, address },
      });
      if (response.success) return response.data;
      return false;
    },
    handleZipCodeInput: debounce(async function() {
      await this.getZipCodeInfo();
    }, 400),
    async getZipCodeInfo() {
      if (this.addressForm.zip_code.length > 6) {
        this.loadZipCode = true;
        try {
          const response = await axios.post(this.zipCodeUrl, {
            zipcode: this.addressForm.zip_code,
          });
          this.loadZipCode = false;
          if (response.status === 200 && response.data.success) {
            const data = response.data;
            this.addressForm.street = data.street;
            this.addressForm.city = data.city;
            this.addressForm.district = data.district;
            this.addressForm.state = data.state;
            this.addressForm.latitude = data.latitude;
            this.addressForm.longitude = data.longitude;
          }
        } catch (error) {
          this.loadZipCode = false;
          this.addressForm.latitude = "";
          this.addressForm.longitude = "";
          this.$toasted.show(this.trans("common_address.zip_code_not_found"), {
            theme: "bubble",
            type: "warning",
            position: "bottom-center",
            duration: 5000,
          });
        }
      }
    },
    resetForm() {
      this.addressForm = {
        zip_code: "",
        street: "",
        city: "",
        country: "",
        district: "",
        state: "",

        latitude: "",
        longitude: "",

        location_name: "",
        number: "",

        complement: "",

        full_address: "",
      };
    },
    async validateForm() {
      const validator = await this.$refs.zipCodeAddressForm.validate();
      if (validator && this.addressForm.latitude && this.addressForm.longitude)
        return true;
      return false;
    },
    async sendForm() {
      const validator = await this.validateForm();
      if (!validator) {
        return;
      }

      this.addressForm.full_address = `${this.addressForm.street} ${this.addressForm.number}, ${this.addressForm.district} - ${this.addressForm.state}, ${this.addressForm.country}`;

      if (
        this.addressForm.latitude === "" ||
        this.addressForm.longitude === ""
      ) {
        this.loadZipCode = true;
        await this.callAutocompleteApi(this.addressForm.full_address);
      }

      this.loadZipCode = false;

      if (this.addressForm.latitude && this.addressForm.longitude) {
        this.$emit("on-send-form", this.addressForm);
        this.resetForm();
      } else {
        this.$toasted.show(this.trans("common_address.zip_code_not_found"), {
          theme: "bubble",
          type: "warning",
          position: "bottom-center",
          duration: 5000,
        });
      }
    },
  },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ValidationObserver',{ref:"zipCodeAddressForm",attrs:{"tag":"form"},on:{"submit":function($event){$event.stopPropagation();$event.preventDefault();return _vm.sendForm()}}},[_c('vue-element-loading',{attrs:{"active":_vm.loadZipCode,"spinner":"spinner","color":"#6666FF"}}),_vm._v(" "),(_vm.showAddressName)?_c('div',{staticClass:"m-2 row"},[_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.location_name"))+"*")]),_vm._v(" "),_c('ValidationProvider',{attrs:{"rules":"required","name":_vm.trans('common_address.location_name')},scopedSlots:_vm._u([{key:"default",fn:function(ref){
var errors = ref.errors;
return [_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.location_name),expression:"addressForm.location_name"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.location_name')},domProps:{"value":(_vm.addressForm.location_name)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "location_name", $event.target.value);}}}),_vm._v(" "),(!!errors[0])?_c('div',{staticStyle:{"color":"red"}},[_vm._v("\n          "+_vm._s(errors[0])+"\n        ")]):_vm._e()]}}],null,false,775295906)})],1)]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"m-2 row"},[_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.zip_code"))+"*")]),_vm._v(" "),_c('ValidationProvider',{directives:[{name:"mask",rawName:"v-mask",value:(['#####-###']),expression:"['#####-###']"}],attrs:{"rules":{ required: true, regex: /[0-9]{5}-[\d]{3}/ },"name":_vm.trans('common_address.zip_code')},scopedSlots:_vm._u([{key:"default",fn:function(ref){
var errors = ref.errors;
return [_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.zip_code),expression:"addressForm.zip_code"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.zip_code')},domProps:{"value":(_vm.addressForm.zip_code)},on:{"blur":_vm.getZipCodeInfo,"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "zip_code", $event.target.value);}}}),_vm._v(" "),(!!errors[0])?_c('div',{staticStyle:{"color":"red"}},[_vm._v("\n          "+_vm._s(errors[0])+"\n        ")]):_vm._e()]}}])})],1),_vm._v(" "),_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.street"))+"*")]),_vm._v(" "),_c('ValidationProvider',{attrs:{"rules":"required","name":_vm.trans('common_address.street')},scopedSlots:_vm._u([{key:"default",fn:function(ref){
var errors = ref.errors;
return [_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.street),expression:"addressForm.street"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.street')},domProps:{"value":(_vm.addressForm.street)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "street", $event.target.value);}}}),_vm._v(" "),(!!errors[0])?_c('div',{staticStyle:{"color":"red"}},[_vm._v("\n          "+_vm._s(errors[0])+"\n        ")]):_vm._e()]}}])})],1)]),_vm._v(" "),_c('div',{staticClass:"m-2 row"},[_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.city"))+"*")]),_vm._v(" "),_c('ValidationProvider',{attrs:{"rules":"required","name":_vm.trans('common_address.city')},scopedSlots:_vm._u([{key:"default",fn:function(ref){
var errors = ref.errors;
return [_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.city),expression:"addressForm.city"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.city')},domProps:{"value":(_vm.addressForm.city)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "city", $event.target.value);}}}),_vm._v(" "),(!!errors[0])?_c('div',{staticStyle:{"color":"red"}},[_vm._v("\n          "+_vm._s(errors[0])+"\n        ")]):_vm._e()]}}])})],1),_vm._v(" "),_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.district"))+"*")]),_vm._v(" "),_c('ValidationProvider',{attrs:{"rules":"required","name":_vm.trans('common_address.district')},scopedSlots:_vm._u([{key:"default",fn:function(ref){
var errors = ref.errors;
return [_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.district),expression:"addressForm.district"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.district')},domProps:{"value":(_vm.addressForm.district)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "district", $event.target.value);}}}),_vm._v(" "),(!!errors[0])?_c('div',{staticStyle:{"color":"red"}},[_vm._v("\n          "+_vm._s(errors[0])+"\n        ")]):_vm._e()]}}])})],1)]),_vm._v(" "),_c('div',{staticClass:"m-2 row"},[_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.state"))+"*")]),_vm._v(" "),_c('ValidationProvider',{attrs:{"rules":"required","name":_vm.trans('common_address.state')},scopedSlots:_vm._u([{key:"default",fn:function(ref){
var errors = ref.errors;
return [_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.state),expression:"addressForm.state"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.state')},domProps:{"value":(_vm.addressForm.state)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "state", $event.target.value);}}}),_vm._v(" "),(!!errors[0])?_c('div',{staticStyle:{"color":"red"}},[_vm._v("\n          "+_vm._s(errors[0])+"\n        ")]):_vm._e()]}}])})],1),_vm._v(" "),_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.country"))+"*")]),_vm._v(" "),_c('ValidationProvider',{attrs:{"rules":"required","name":_vm.trans('common_address.country')},scopedSlots:_vm._u([{key:"default",fn:function(ref){
var errors = ref.errors;
return [_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.country),expression:"addressForm.country"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.country')},domProps:{"value":(_vm.addressForm.country)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "country", $event.target.value);}}}),_vm._v(" "),(!!errors[0])?_c('div',{staticStyle:{"color":"red"}},[_vm._v("\n          "+_vm._s(errors[0])+"\n        ")]):_vm._e()]}}])})],1)]),_vm._v(" "),_c('div',{staticClass:"m-2 row"},[_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.number"))+"*")]),_vm._v(" "),_c('ValidationProvider',{attrs:{"rules":"required","name":_vm.trans('common_address.number')},scopedSlots:_vm._u([{key:"default",fn:function(ref){
var errors = ref.errors;
return [_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.number),expression:"addressForm.number"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.number')},domProps:{"value":(_vm.addressForm.number)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "number", $event.target.value);}}}),_vm._v(" "),(!!errors[0])?_c('div',{staticStyle:{"color":"red"}},[_vm._v("\n          "+_vm._s(errors[0])+"\n        ")]):_vm._e()]}}])})],1),_vm._v(" "),_c('div',{staticClass:"col"},[_c('label',[_vm._v(" "+_vm._s(_vm.trans("common_address.complement")))]),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.addressForm.complement),expression:"addressForm.complement"}],staticClass:"form-control",attrs:{"type":"text","placeholder":_vm.trans('common_address.complement')},domProps:{"value":(_vm.addressForm.complement)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.addressForm, "complement", $event.target.value);}}})])]),_vm._v(" "),(_vm.showFormButton)?_c('div',{staticClass:"float-right"},[_c('button',{staticClass:"btn btn-success",attrs:{"type":"submit"}},[_c('i',{staticClass:"mdi mdi-plus"}),_vm._v(" "+_vm._s(_vm.trans("common_address.add_new"))+"\n    ")])]):_vm._e()],1)};
var __vue_staticRenderFns__ = [];

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );

export default __vue_component__;
