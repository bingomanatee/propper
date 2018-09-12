import is from 'is';

import Validator from './Validator';

// const NAME_REGEX = /^[\w$]+$/;

const PROP_DEFAULTS = {
  configurable: false,
  enumerable: true,
};

const GENERIC_FAIL_MSG = '(#name#) passed bad value #value#';

const defaultOnBadData = (name, value, error) => {
  if (error) {
    throw new Error(error);
  }
  throw new Error(GENERIC_FAIL_MSG.replace('#name#', name).replace('#value#', value));
};

const getOff = (obj, field, def) => {
  if (Reflect.has(obj, field)) {
    const out = obj[field];
    delete obj[field];
    return out;
  }
  return def;
};

const stringValidator = name => new Validator('string', `${name} must be a string`).setName('stringValidator');
const requiredValidator = name => new Validator(a => !a, `${name} is required`).setName('requiredValidator');

export default class Propper {
  constructor(ClassDef, options = {}) {
    this.classDef = ClassDef;
    this.options = options;
  }

  get IDENTITY() {
    return 'PROPPER';
  }

  /**
   * this adds an 'isValid()' method and an 'propErrors()' method.
   * isValid() returns true or false; propErrors() returns an array
   * of prop/error objects, or null if there are no errors.
   *
   * NOTE: the only properties that will be tested are those defined AFTER
   * addIsValid() is called. So you can't call it at the last minute
   * and expect it to work!
   *
   * @param validMethodName
   * @param propErrors
   * @returns {*}
   */
  addIsValid(validMethodName = 'isValid', propErrors = 'propErrors', validatorRegistry = '__validators') {
    Object.assign(this, {
      validMethodName, propErrors, validatorRegistry,
    });

    if (!Reflect.has(this.classDef.prototype)) {
      Object.defineProperty(this.classDef.prototype, validatorRegistry, {
        configurable: false,
        enumerable: false,
        get() {
          if (!this[`${validatorRegistry}_`]) {
            this[`${validatorRegistry}_`] = new Map();
          }
          return this[`${validatorRegistry}_`];
        },
      });

      Object.defineProperty(this.classDef.prototype, validMethodName, {
        configurable: false,
        enumerable: false,
        get() {
          if (this[propErrors]) {
            return false;
          } return true;
        },
      });

      Object.defineProperty(this.classDef.prototype, propErrors, {
        configurable: false,
        enumerable: false,
        get() {
          const errors = [];
          Array.from(this[validatorRegistry].keys()).forEach((prop) => {
            const value = this[prop];
            const validator = this[validatorRegistry].get(prop);
            const error = validator.try(value);
            if (error) {
              errors.push({ prop, error });
            }
          });
          if (errors.length) return errors;
          return null;
        },
      });
    }
    return this;
  }

  withValidator(...args) {
    if (args[0] instanceof Validator) {
      this._validator = args[0];
    }
    this._validator = new Validator(...args);
  }

  addString(name, overrides = {}) {
    let regexValidator;
    const regex = getOff(overrides, 'regex');
    const min = getOff(overrides, 'min', null);
    const max = getOff(overrides, 'max', null);
    let minValidator;
    let maxValidator;
    const regexErrorMessage = getOff(overrides, 'regexErrorMessage', 'Bad string pattern');
    if (regex) regexValidator = new Validator(value => !regex.test(value), regexErrorMessage);
    const failsWhen = getOff(overrides, 'failsWhen');
    if (!is.null(min)) {
      minValidator = new Validator(
        str => str.length < min,
        `"#value#" too short; ${name} must be at least ${min} characters`,
      );
    }
    if (!is.null(max)) {
      maxValidator = new Validator(
        str => str.length > max,
        `#value# too long; ${name} cannot be longer than ${max} characters`,
      );
    }

    if (!Reflect.has(overrides, 'defaultValue')) overrides.defaultValue = '';

    overrides.failsWhen = Validator.compound(
      stringValidator(name),
      regexValidator,
      minValidator,
      maxValidator,
      failsWhen,
    );

    return this.addProp(name, overrides);
  }

  addProp(name, options = {}) {
    let localName = null;

    const definition = Object.assign({}, options);
    // optionally the initial value is set with a function to ensure unique references
    localName = getOff(definition, 'localName', `_${name}`);

    let validator;
    if (this._validator) {
      validator = this._validator;
      // @TODO: scrub local?
    }
    const failsWhen = getOff(definition, 'failsWhen');
    const errorMessage = getOff(definition, 'errorMessage', GENERIC_FAIL_MSG).replace('#name#', name);
    const onBadData = getOff(definition, 'onBadData', defaultOnBadData);
    const defaultValue = getOff(definition, 'defaultValue', null);
    const required = getOff(definition, 'required');

    let getDefault = () => defaultValue;
    if (is.function(defaultValue)) {
      getDefault = defaultValue;
    }

    if (failsWhen) {
      if (failsWhen instanceof Validator) validator = failsWhen;
      else if (Array.isArray(failsWhen)) {
        validator = Validator.compound(failsWhen);
      } else {
        const oValidator = new Validator(failsWhen, errorMessage);
        validator = Validator.compound(validator, oValidator);
      }
    }

    Object.assign(definition, {
      get() {
        if (!Reflect.has(this, localName)) {
          this[localName] = getDefault();
        }
        return this[localName];
      },
    });

    if (required) {
      const rv = requiredValidator(name);
      try {
        validator = Validator.compound(validator, rv);
      } catch (err) {
        console.log('bad validator attempt:', rv, validator, this, overrides);
      }
    }

    if (validator) {
      // console.log('with validator');
      Object.assign(definition, {
        set(value) {
          //  console.log(name, 'trying', value, 'with', validator);
          const error = validator.try(value);
          if (error) {
            onBadData(name, value, error);
          } else {
            this[localName] = value;
          }
        },
      });

      if (this.validatorRegistry) {
        this.classDef.prototype[this.validatorRegistry].set(name, validator);
      }
    } else {
      //    console.log('no validator');
      Object.assign(definition, {
        set(value) {
          this[localName] = value;
        },
      });
    }

    /*
    console.log('overrides:', overrides);
    console.log('definition:', definition);
    console.log('validator: ', validator);
    */

    Object.defineProperty(this.classDef.prototype, name, definition);
    return this;
  }
}
