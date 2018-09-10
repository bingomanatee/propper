const NAME_REGEX = /^[\w$]+$/;

const LOCAL_PROP_DEFAULTS = {
  configurable: false,
  enumerable: false,
};

const PROP_DEFAULTS = {
  configurable: false,
  enumerable: true,
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
    if (!(name && typeof name === 'string')) throw new Error('property must be a string');
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

    // optionally the initial value is set with a function to ensure unique references
    let localName = overrides.localName;
    delete overrides.localName;
    if (!localName) {
      localName = `_${name}`;
    }

    const definition = Object.assign(PROP_DEFAULTS, overrides);

    Object.defineProperty(this.classDef.prototype, name, Object.assign(
      definition,
      this.baseGetterSetter(localName, defaultFactory)
    ));

    return this;
  }

  baseGetterSetter(localName, defaultFactory) {
    return {
      get() {
        if (this[localName] === undefined) {
          this[localName] = defaultFactory();
        }
        return this[localName];
      },
      set(value) {
        this[localName] = value;
      },
    };
  }
}
