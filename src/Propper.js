import is from 'is';
// import l_get from 'lodash.get';

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
  const out = obj[field];
  delete obj[field];
  return out || def;
};

export default class Propper {
  constructor(ClassDef, options = {}) {
    this.classDef = ClassDef;
    this.options = options;
  }

  get IDENTITY() {
    return 'PROPPER';
  }

  withValidator(...args) {
    if (args[0] instanceof Validator) {
      this._validator = args[0];
    }
    this._validator = new Validator(...args);
  }

  addProp(name, overrides = {}) {
    let localName = null;

    const definition = Object.assign({}, PROP_DEFAULTS, overrides);
    // optionally the initial value is set with a function to ensure unique references
    localName = getOff(definition, 'localName', `_${name}`);

    let validator;
    if (this._validator) {
      validator = this._validator;
      // @TODO: scrub local?
    }
    const test = getOff(definition, 'test');
    const errorMessage = getOff(definition, 'errorMessage', GENERIC_FAIL_MSG).replace('#name#', name);
    const onBadData = getOff(definition, 'onBadData', defaultOnBadData);
    const defaultValue = getOff(definition, 'defaultValue', null);
    let getDefault = () => defaultValue;
    if (is.function(defaultValue)) {
      getDefault = defaultValue;
    }

    if (test) {
      const oValidator = new Validator(test, errorMessage);
      validator = Validator.compound(validator, oValidator);
    }

    Object.assign(definition, {
      get() {
        if (!Reflect.has(this, localName)) {
          this[localName] = getDefault();
        }
        return this[localName];
      },
    });

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
