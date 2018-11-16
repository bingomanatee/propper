import util from 'util';
import Validator from './Validator';

/**
 * standard validators fail if any of their compound conditions fail.
 * And validators only fail if ALL of their compound conditions fail.
 */
export default class AndValidator extends Validator {
  constructor(...args) {
    super(...args);
    if (!Array.isArray(this.failsWhen)) throw new Error('OrValidator expects an array');
  }

  try(value) {
    const results = [];
    for (let i = 0; i < this.failsWhen.length; ++i) {
      const subTest = this.failsWhen[i];
      if (!(subTest && (subTest instanceof Validator))) {
        console.log(`bad validator ${i}: `, this);
        throw new Error(`bad validator ${i} ${util.inspect(this)}`);
      }
      const response = subTest.try(value);
      if (response) {
        results.push(response);
      } else {
        return false; // any passing test works.
      }
    }
    return results.filter(a => a);
  }
}
