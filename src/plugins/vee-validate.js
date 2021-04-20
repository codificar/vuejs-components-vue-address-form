import { extend } from "vee-validate";
import { required, email, regex } from "vee-validate/dist/rules";

export default {
  configValidate() {
    extend("required", {
      ...required,
      message: "required",
    });

    extend("email", {
      ...email,
      message: "invalid_email",
    });

    extend("regex", {
      ...regex,
      message: "invalid_regex",
    });
  },
};
