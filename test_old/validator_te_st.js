import { Validator } from '../src/index';

describe('Propper', () => {
  describe('Validator', () => {
    const NON_INT_ERROR = 'value must be integer';
    let integerValidator;
    beforeEach(() => {
      integerValidator = new Validator(n => !Number.isInteger(n), NON_INT_ERROR);
    });
    describe('simple', () => {
      it('should return nothing when given an integer', () => {
        expect(integerValidator.try(1)).toBeFalsy();
      });

      it('should return an error string when not given an integer', () => {
        expect(integerValidator.try('one')).toEqual(NON_INT_ERROR);
      });
    });
    describe('complex', () => {
      let nonNegValidator;
      let compoundTest;
      const NOT_NEGATIVE_ERROR = 'value must be >= 0';
      beforeEach(() => {
        nonNegValidator = new Validator(value => (value < 0), NOT_NEGATIVE_ERROR);
        compoundTest = new Validator([integerValidator, nonNegValidator]);
      });

      it('should have a good not negative failsWhen', () => {
        expect(nonNegValidator.try(2)).toBeFalsy();
        expect(nonNegValidator.try(-2)).toBeTruthy();
      });

      it('should validate both conditions in compound failsWhen', () => {
        expect(compoundTest.try(2)).toBeFalsy();
        expect(compoundTest.try('two')).toEqual(NON_INT_ERROR);
        expect(compoundTest.try(-2)).toEqual(NOT_NEGATIVE_ERROR);
      });
    });

    describe('is/object test', () => {
      let objValidator;
      beforeEach(() => {
        objValidator = new Validator('object', 'value must be a object');
      });

      it('should pass an object', () => {
        expect(objValidator.try({ a: 1 })).toBeFalsy();
      });

      it('should fail a number', () => {
        expect(objValidator.try(1)).toEqual('value must be a object');
      });

      it('should fail a null', () => {
        expect(objValidator.try(null)).toEqual('value must be a object');
      });
    });

    describe('is/number test', () => {
      let numValidator;
      beforeEach(() => {
        numValidator = new Validator('number', 'value must be a number');
      });

      it('passes number', () => {
        expect(numValidator.try(4)).toBeFalsy();
      });

      it('fails array', () => {
        expect(numValidator.try([])).toEqual('value must be a number');
      });
    });

    describe('is/string tests', () => {
      let stringValidator;
      beforeEach(() => {
        stringValidator = new Validator('string', 'value must be a string');
      });

      it('passes string', () => {
        expect(stringValidator.try('a string')).toBeFalsy();
      });

      it('fails a number', () => {
        expect(stringValidator.try(2)).toEqual('value must be a string');
      });
    });
  });
});
