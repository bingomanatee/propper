import is from 'is';
import l_get from 'lodash.get';

const NAME_REGEX = /^[\w$]+$/;

const PROP_DEFAULTS = {
  configurable: false,
  enumerable: true,
};

const GENERIC_FAIL_MSG = '(#name#) bad value #value#';

const failMessage = (msg, name, value) => {
  if (!msg) return failMessage(GENERIC_FAIL_MSG, name, value);
  if (is.function(msg)) {
    return msg(name, value);
  }
  if (/#name#/.test(msg)) {
    return msg.replace(/#name#/gi, name)
      .replace(/#value#/gi, value);
  }

  let out;
  try {
    out = `(${name}) ${msg} ${value}`;
  } catch (err) {
    out = `(${name}) ${msg}`;
  }
  return out;
};

export default class Propper {
  constructor(ClassDef, options = {}) {
    this.classDef = ClassDef;
    this.options = options;
  }

  get IDENTITY() {
    return 'PROPPER';
  }

  addProp(name, overrides = {}) {
    let localName = null;
    let filter = null;
    let onFilterFail = Propper.ON_FAIL_THROW;
    let filterFailMessage = null;
    if (!(name && typeof name === 'string')) {
      throw new Error('property must be a string');
    }
    if (!NAME_REGEX.test(name)) {
      if (!overrides.wierdName) {
        throw new Error(`the property name ${name
        } is not allowed; only word characters and $ are allowed. 
        use the wierdName option to override.`);
      }
    }
    // eslint-disable-next-line no-undef
    delete overrides.wierdName;

    let defaultFactory = () => undefined;
    if (Reflect.has(overrides, 'value')) {
      // value is handled in get/set and local property.
      if (typeof overrides.value === 'function') {
        defaultFactory = overrides.value;
      } else {
        defaultFactory = (value => () => value)(overrides.value);
      }
      delete overrides.value;
    }

    if (Reflect.has(overrides, 'filter')) {
      filter = overrides.filter;
      filterFailMessage = overrides.filterFailMessage;

      if (is.string(filter)) {
        filter = l_get(is, filter);
      }
      if (!is.function(filter)) throw new Error('non function filter passed');
      if (Reflect.has(overrides, 'onFilterFail')) {
        onFilterFail = overrides.onFilterFail;
        delete overrides.onFiltrerFail;
      }
      delete overrides.filter;
      delete overrides.filterFailMessage;
    }

    // optionally the initial value is set with a function to ensure unique references
    localName = overrides.localName;
    delete overrides.localName;
    if (!localName) {
      localName = `_${name}`;
    }

    const definition = Object.assign(PROP_DEFAULTS, overrides);

    Object.defineProperty(this.classDef.prototype, name, Object.assign(
      definition,
      this.baseGetterSetter(name, localName, {
        defaultFactory,
        filter,
        onFilterFail,
        filterFailMessage,
      }),
    ));

    return this;
  }

  baseGetterSetter(name, localName, {
    defaultFactory,
    filter,
    onFilterFail = Propper.ON_FAIL_THROW,
    filterFailMessage,
  }) {
    return {
      get() {
        if (this[localName] === undefined) {
          this[localName] = defaultFactory();
        }
        return this[localName];
      },
      set(value) {
        if (filter) {
          if (!filter(value)) {
            switch (onFilterFail) {
              case Propper.ON_FAIL_THROW:
                throw new Error(failMessage(filterFailMessage, name, value));
                // eslint-disable-next-line no-unreachable
                break;

              case Propper.ON_FAIL_CONSOLE:
                console.log(failMessage(filterFailMessage, name, value), value);
                break;

              case Propper.ON_FAIL_SILENT:
                break;

              default:
                throw new Error(failMessage(filterFailMessage, name, value));
            }
          } else {
            this[localName] = value;
          }
        } else {
          this[localName] = value;
        }
      },
    };
  }
}

Propper.ON_FAIL_THROW = Symbol('ON_FAIL_THROW');
Propper.ON_FAIL_CONSOLE = Symbol('ON_FAIL_CONSOLE');
Propper.ON_FAIL_SILENT = Symbol('ON_FAIL_SILENT');
