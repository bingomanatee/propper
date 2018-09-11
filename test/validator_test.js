import is from 'is';
import { Validator } from '../src/index';

describe('Propper', () => {
  describe('Validator', () => {
    const NON_INT_ERROR = 'value must be integer';
    let integerValidator;
    beforeEach(() => {
      integerValidator = new Validator(is.integer, NON_INT_ERROR).reverseTest();
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

      it('should have a good not negative test', () => {
        expect(nonNegValidator.try(2)).toBeFalsy();
        expect(nonNegValidator.try(-2)).toBeTruthy();
      });

      it('should validate both conditions in compound test', () => {
        expect(compoundTest.try(2)).toBeFalsy();
        expect(compoundTest.try('two')).toEqual(NON_INT_ERROR);
        expect(compoundTest.try(-2)).toEqual(NOT_NEGATIVE_ERROR);
      });
    });
  });
});
