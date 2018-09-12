import util from 'util';
import is from 'is';
import compact from 'lodash.compact';
import lGet from 'lodash.get';

class Validator {
  /**
   * the 'failsWhen' is a function that returns false(y) for GOOD values
   * and a string for BAD values.
   *
   * On a bad value if the string is found in errors, errors[result]
   * is returned; so your failsWhen can key one of many errors if it wants to.
   * otherwise (if errors doesn't contain result) it returns defaultError.
   *
   * @param test {function | string}
   * @param defaultError {string}
   * @param errors {Object}
   */
  constructor(test, defaultError = 'bad value', errors = {}) {
    this.errors = errors;
    this.failsWhen = test;
    this.defaultError = defaultError;
  }

  setName(s) {
    this.name = s;
    return this;
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

  get failsWhen() {
    return this._failsWhen;
  }

  set failsWhen(value) {
    if (is.string(value)) {
      const test = lGet(is, value);

      // eslint-disable-next-line jest/no-disabled-tests
      this._failsWhen = v => !test(v);
    } else if (Array.isArray(value)) {
      this._failsWhen = value.map((v, i) => {
        if (is.string(v)) {
          return new Validator(v);
        } else if (v instanceof Validator) {
          return v;
        }
        throw new Error(`bad sub of test: ${i}`);
      });
    } else if (typeof value === 'function') {
      this._failsWhen = value;
    } else {
      throw new Error(`bad Validator set/test: ${value}`);
    }
  }

  /**
   * try returns a message if there is an error.
   * If the value it good it returns nothing.
   * @param value
   * @returns {string|false}
   */
  try(value) {
    if (is.array(this.failsWhen)) {
      for (let i = 0; i < this.failsWhen.length; ++i) {
        const subTest = this.failsWhen[i];
        if (!(subTest && (subTest instanceof Validator))) {
          console.log(`bad validator ${i}: `, this);
          throw new Error(`bad validator ${i} ${util.inspect(this)}`);
        }
        const response = subTest.try(value);
        if (response) {
          return response;
        }
      }
      return false;
    } else if (is.function(this.failsWhen)) {
      const result = this.failsWhen(value);
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
    throw new Error(`bad validator: ${util.inspect(this)}`);
  }

  /**
   * if the failsWhen returns true if the value is good (as the "is" ones do)
   * we reverse that here.
   * @returns {Validator}
   */
  reverseTest() {
    if (!(this.failsWhen === 'function')) throw new Error('only works on simple validators');
    const baseTest = this.failsWhen;
    this.failsWhen = v => !baseTest(v);
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
  for (let i = 0; i < g.length; ++i) {
    if (is.string(g[i])) {
      g[i] = new Validator(g[i]);
    }
  }
  switch (g.length) {
    case 0:
      validator = NonValidator;
      break;
    case 1:
      validator = g.pop();
      break;
    default:
      validator = new Validator(g);
  }
  return validator;
};

export default Validator;
