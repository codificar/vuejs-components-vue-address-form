import { extend } from "vee-validate";
import { required, email, regex } from "vee-validate/dist/rules";

let trans = (key) => {
  return _.get(window.lang, key, key);
};
export default {
  configValidate() {
    extend("required", {
      ...required,
      message: trans("api.required"),
    });

    extend("email", {
      ...email,
      message: trans("api.invalid_email"),
    });

    extend("regex", {
      ...regex,
      message: trans("api.invalid_regex"),
    });
  },
};
