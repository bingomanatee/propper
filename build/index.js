module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// EXTERNAL MODULE: external "is"
var external__is_ = __webpack_require__(2);
var external__is__default = /*#__PURE__*/__webpack_require__.n(external__is_);

// EXTERNAL MODULE: external "@wonderlandlabs/inspector"
var inspector_ = __webpack_require__(3);
var inspector__default = /*#__PURE__*/__webpack_require__.n(inspector_);

// EXTERNAL MODULE: external "lodash.get"
var external__lodash_get_ = __webpack_require__(4);
var external__lodash_get__default = /*#__PURE__*/__webpack_require__.n(external__lodash_get_);

// CONCATENATED MODULE: ./src/utils.js


const compact = a => a.filter(v => v);

const popObject = (obj, field, def) => {
  if (field in obj) {
    const out = obj[field];
    delete obj[field];
    return out;
  }
  return def;
};


// CONCATENATED MODULE: ./src/Propper.js




const DEFAULT_DEFAULTS = name => ({
  onInvalid(value, error) {
    console.log(`error: setting ${name}`, error, value);
  }
});

const throwOnInvalid = (value, error) => {
  const err = new Error(error);
  err.value = value;
  throw err;
};

class Propper_Propper {
  constructor(BaseClass, options = {}, defaults = DEFAULT_DEFAULTS) {
    Object.assign(this, options);
    this.defaults = defaults;
    this.BaseClass = BaseClass;
  }

  addProp(name, options = {}) {
    const defaults = external__is__default.a.function(this.defaults) ? this.defaults(name, options) : this.defaults;
    const def = Object.assign({}, defaults || {}, options);
    const tests = compact([popObject(def, 'type', null), ...popObject(def, 'tests', [])]);
    const required = popObject(def, 'required', null);
    const onChange = popObject(def, 'onChange');
    const enumerable = popObject(def, 'enumerable', false);
    let onInvalid = popObject(def, 'onInvalid', throwOnInvalid);

    if (onInvalid === 'throw') {
      onInvalid = throwOnInvalid;
    }

    const defaultValue = popObject(def, 'defaultValue', null);
    let defaultFn = defaultValue;
    if (!external__is__default.a.function(defaultValue)) {
      defaultFn = () => defaultValue;
    }
    const localName = popObject(def, 'localName', `_${name}`);
    let validation = false;
    if (tests.length || required) {
      switch (required) {
        case true:
          validation = Object(inspector_["validator"])(tests, { required });
          break;

        case false:
          validation = Object(inspector_["validator"])(tests, { required });
          break;

        default:
          validation = Object(inspector_["validator"])(tests, {});
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
      }
    };

    if (validation) {
      Object.assign(propDef, {
        set(value) {
          if (localName in this) {
            if (this[localName] === value) {
              return;
            }
          }
          let error = validation(value);
          if (error) {
            if (external__is__default.a.string(error)) {
              error = `${name} error`;
            } else if (external__is__default.a.array(error)) {
              error = error.map(a => {
                if (external__is__default.a.string(a)) return `${name} ${a}`;
                return a;
              });
            }
            onInvalid(value, error);
            return;
          }
          const lastVal = this[localName];
          this[localName] = value;
          if (onChange) {
            onChange.bind(this)(value, lastVal);
          }
        }
      });
    }

    Object.defineProperty(this.BaseClass.prototype, name, propDef);

    return this;
  }

  set defaults(value) {
    this._defaults = Object.assign({}, value || {});
  }

  get defaults() {
    return this._defaults;
  }
}

/* harmony default export */ var src_Propper = (Propper_Propper);
// CONCATENATED MODULE: ./src/index.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "propInjector", function() { return propInjector; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Propper", function() { return src_Propper; });


const propInjector = (classDef, options = {}) => new src_Propper(classDef, options);

/* harmony default export */ var src = __webpack_exports__["default"] = (propInjector);



/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("is");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("@wonderlandlabs/inspector");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("lodash.get");

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map