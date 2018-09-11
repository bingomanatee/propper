import is from 'is';
import compact from 'lodash.compact';

class Validator {
  constructor(test, defaultError = 'bad value', errors = {}) {
    this.errors = errors;
    this.test = test;
    this.defaultError = defaultError;
  }

  get defaultError() {
    return this._defaultError;
  }

  set defaultError(value) {
    if (!(value && is.string(value))) {
      throw new Error('validator error must be a non-empty string');
    }
    this._defaultError = value;
  }

  get test() {
    return this._test;
  }

  set test(value) {
    if (is.string(value)) {
      this._test = v => !is[value](v);
    } else {
      this._test = value;
    }
  }

  /**
   * try returns a message if there is an error.
   * If the value it good it returns nothing.
   * @param value
   * @returns {string|false}
   */
  try(value) {
    if (is.array(this._test)) {
      for (let i = 0; i < this._test.length; ++i) {
        const subTest = this._test[i];
        const response = subTest.try(value);
        if (response) {
          return response;
        }
      }
      return false;
    }
    const result = this._test(value);
    if (!result) {
      return false;
    }
    let error = this.defaultError;
    if (Reflect.has(this.errors, result)) {
      error = this.errors[result];
    }
    if (is.function(error)) {
      return error(value, result);
    }
    return error.replace(/#value#/gi, value);
  }

  /**
   * if the test returns true if the value is good (as the "is" ones do)
   * we reverse that here.
   * @returns {Validator}
   */
  reverseTest() {
    const baseTest = this._test;
    this._test = v => !baseTest(v);
    return this;
  }
}

const NonValidator = new Validator(() => false); // passes always

/**
 * takes several validators and returns a single validator.
 * more economical about missing or singular validators.
 * @param validators
 * @returns {Validator}
 */
Validator.compound = (...validators) => {
  const g = compact(validators);
  let validator = NonValidator;
  switch (g.length) {
    case 0:
      validator = NonValidator;
      break;
    case 1:
      validator = g.pop();
      break;
    default:
  }
  return validator;
};

export default Validator;
