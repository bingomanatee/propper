import is from 'is';
import _ from 'lodash';
import { ifFn, validator, collector } from '@wonderlandlabs/inspector';

const GENERIC_FAIL_MSG = '(#name#) passed bad value #value#';

const defaultOnBadData = (name, value, error) => {
  if (error) {
    throw new Error(error);
  }
  throw new Error(GENERIC_FAIL_MSG.replace('#name#', name).replace('#value#', value));
};

const popObject = (obj, field, def) => {
  if (field in obj) {
    const out = obj[field];
    delete obj[field];
    return out;
  }
  return def;
};

const propifyValidator = fn => (value, name) => {
  const error = fn(value);
  if (!error) return error;
  if (Array.isArray(error)) {
    return _.flattenDeep(error).map((s) => {
      if (s && is.string(s)) {
        try {
          return s.replace(/#name#/g, name).replace(/#value#/g, value);
        } catch (err) {
          return s;
        }
      } else {
        return s;
      }
    });
  }
};

const stringValidator = name => validator([['string', false, `${name} must be a string`]]);
// the error message for exists is false because we don't want it listed

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
   * @param validatorRegistry
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
          }
          return true;
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
            const error = validator(value);
            if (error) {
              errors.push({ prop, error });
            }
          });
          if (errors.length) {
            return errors;
          }
          return null;
        },
      });
    }
    return this;
  }

  addString(name, overrides = {}) {
    let regexValidator;
    const regex = popObject(overrides, 'regex');
    const min = popObject(overrides, 'min', null);
    const max = popObject(overrides, 'max', null);
    let minValidator;
    let maxValidator;
    const regexErrorMessage = popObject(overrides, 'regexErrorMessage', 'Bad string pattern');
    if (regex) {
      regexValidator = validator(value => !regex.test(value), regexErrorMessage);
    }
    const failsWhen = popObject(overrides, 'failsWhen');
    if (!is.null(min)) {
      minValidator = validator(
        str => str.length < min,
        `"#value#" too short; #name# must be at least ${min} characters`,
      );
    }
    if (!is.null(max)) {
      maxValidator = validator(
        str => str.length > max,
        `#value# too long; #name# cannot be longer than ${max} characters`,
      );
    }

    if (!Reflect.has(overrides, 'defaultValue')) {
      overrides.defaultValue = '';
    }

    overrides.failsWhen = collector(_.compact([
      stringValidator(name),
      regexValidator,
      minValidator,
      maxValidator,
      failsWhen,
    ]), { reducer: 'filter' });

    return this.addProp(name, overrides);
  }

  addProp(name, options = {}) {
    let localName = null;

    const definition = Object.assign({}, options);
    // optionally the initial value is set with a function to ensure unique references
    localName = popObject(definition, 'localName', `_${name}`);

    const failsWhen = popObject(definition, 'failsWhen');
    const type = popObject(definition, 'type');
    const errorMessage = popObject(definition, 'errorMessage', GENERIC_FAIL_MSG).replace('#name#', name);
    const onBadData = popObject(definition, 'onBadData', defaultOnBadData);
    const defaultValue = popObject(definition, 'defaultValue', null);
    const required = popObject(definition, 'required');
    const onChange = popObject(definition, 'onChange');

    let propTests = _.compact([type]);

    let getDefault = () => defaultValue;
    if (is.function(defaultValue)) {
      getDefault = defaultValue;
    }

    if (failsWhen) {
      propTests.push(_.compact([failsWhen, false, errorMessage]));
    }
    if (type) {
      propTests.push([type, false, `${name} must be a ${type}`]);
    }

    Object.assign(definition, {
      get() {
        if (!Reflect.has(this, localName)) {
          this[localName] = getDefault();
        }
        return this[localName];
      },
    });

    if (propTests) {
      propTests = propifyValidator(validator(propTests));
    }

    let propValidator = null;
    if (propTests.length) {
      if (required === true || required === false) {
        propValidator = collector(propTests, { required });
      } else propValidator = collector(propTests, {});
    }

    if (propValidator) {
      Object.assign(definition, {
        set(value) {
          // TODO: or validator
          if (!(!value && !required)) {
            const error = propValidator(value);
            if (error) {
              if (!(onBadData.bind(this))(name, value, error)) {
                return;
              }
            }
          }

          if (this[localName] === value) {
            return;
          }
          if (onChange) {
            if (typeof onChange === 'string') {
              this[onChange](value, this[localName], name);
            } else {
              onChange.call(this, value, this[localName], name);
            }
          }
          this[localName] = value;
        },
      });

      if (this.validatorRegistry) {
        this.classDef.prototype[this.validatorRegistry].set(name, validator);
      }
    } else {
      //    console.log('no validator');
      Object.assign(definition, {
        set(value) {
          if (this[localName] === value) {
            return;
          }
          if (onChange) {
            if (typeof onChange === 'string') {
              this[onChange](value, this[localName], name);
            } else {
              onChange.call(this, value, this[localName], name);
            }
          }
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
