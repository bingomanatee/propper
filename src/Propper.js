import Is from 'is';
import { validator } from '@wonderlandlabs/inspector';
import { compact, popObject } from './utils';

const DEFAULT_DEFAULTS = name => ({
  onInvalid(value, error) {
    console.log(
      `error: setting ${name}`,
      error, value,
    );
  },
});

const throwOnInvalid = (value, error) => {
  const err = new Error(error);
  err.value = value;
  throw err;
};

class Propper {
  constructor(BaseClass, options = {}, defaults = DEFAULT_DEFAULTS) {
    Object.assign(this, options);
    this.defaults = defaults;
    this.BaseClass = BaseClass;
  }

  addProp(name, options = {}) {
    const defaults = Is.function(this.defaults) ? this.defaults(name, options) : this.defaults;
    const def = Object.assign({}, defaults || {}, options);
    const tests = compact([popObject(def, 'type', null), ...(popObject(def, 'tests', []))]);
    const required = popObject(def, 'required', null);
    const onChange = popObject(def, 'onChange');
    const enumerable = popObject(def, 'enumerable', false);
    let onInvalid = popObject(def, 'onInvalid', throwOnInvalid);

    if (onInvalid === 'throw') {
      onInvalid = throwOnInvalid;
    }

    const defaultValue = popObject(def, 'defaultValue', null);
    let defaultFn = defaultValue;
    if (!Is.function(defaultValue)) {
      defaultFn = () => defaultValue;
    }
    const localName = popObject(def, 'localName', `_${name}`);
    let validation = false;
    if (tests.length || required) {
      switch (required) {
        case true:
          validation = validator(tests, { required });
          break;

        case false:
          validation = validator(tests, { required });
          break;

        default:
          validation = validator(tests, {});
      }
    }

    const propDef = {
      configurable: false,
      enumerable,
      get() {
        if (!(localName in this)) {
          this[localName] = defaultFn();
        }
        return this[localName];
      },
      set(value) {
        if (localName in this) {
          if (this[localName] === value) {
            return;
          }
        }
        if (localName in this) {
          const lastVal = this[localName];
          this[localName] = value;
          if (onChange) {
            onChange.bind(this)(value, lastVal);
          }
        } else {
          this[localName] = value;
          if (onChange) {
            onChange.bind(this)(value);
          }
        }
      },
    };

    if (validation) {
      Object.assign(propDef, {
        set(value) {
          if (localName in this) {
            if (this[localName] === value) {
              return;
            }
          }
          const error = validation(value);
          if (error) {
            onInvalid(value, error);
            return;
          }
          const lastVal = this[localName];
          this[localName] = value;
          if (onChange) {
            onChange.bind(this)(value, lastVal);
          }
        },
      });
    }


    Object.defineProperty(this.BaseClass.prototype, name, propDef);

    return this;
  }

  set defaults(value = {}) {
    this._defaults = Object.assign({}, value);
  }

  get defaults() {
    return this._defaults;
  }
}

export default Propper;
