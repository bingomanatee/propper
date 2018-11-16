import is from 'is';

import Propper from './Propper';
import Validator from './Validator';

/**
 * This class lets you define properties using magic methods
 * that adds a property with a filter from the is class.
 *
 * note, as it does depend on Proxy which is not universally available,
 * use with care.
 * @param classDef
 * @returns {Propper}
 */
const ADD_RE = /add([\w]+)/;
export default (classDef) => {
  const myProxy = new Propper(classDef);
  return new Proxy(myProxy, {
    get(target, name) {
      if (!(Reflect.has(myProxy, name))) {
        if (ADD_RE.test(name)) {
          const match = ADD_RE.exec(name);
          const testName = match[1].toLowerCase();
          let failsWhen = new Validator(v => !is[testName](v));
          target[name] = function dynamicAddProp(propName, options) {
            if (!options) options = {};
            if (options.failsWhen) {
              const optionsFailsWhen = new Validator(options.failsWhen, options.errorMessage);
              delete options.errorMessage;
              failsWhen = Validator.compound(failsWhen, optionsFailsWhen);
            }
            options.failsWhen = failsWhen;
            return this.addProp(propName, options);
          };
        }
      }
      return target[name];
    },
  });
};
