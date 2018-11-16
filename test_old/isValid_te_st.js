/* eslint-disable babel/new-cap */
import util from 'util';

import propper, { Validator } from './../src/index';

describe('Propper', () => {
  describe('isValid/propErrors', () => {
    let classDef;

    beforeEach(() => {
      class GenericClass {
        constructor(values) {
          try {
            if (values) Object.assign(this, values);
          } catch (err) {

          }
        }
      }

      classDef = GenericClass;
    });

    describe('isValid', () => {
      let myPropper;

Prop('male', { type: 'boolean', defaultValue: null }));

      it('should start invalid', () => {

      });

      it('should be valid with good data', () => {

      });
    });

    describe('required/object', () => {


      it('should reject a missing name', () => {
        const bob = new classDef();

      });

      it('should accept a name object', () => {

      });
    });

    describe('not required/object', () => {


      it('should accept a missing name', () => {

      });

      it('should accept a name object', () => {

      });
    });

    describe('propErrors', () => {

      it('should start invalid', () => {

      });

      it('should be valid with good data', () => {

      });
    });
  });
});
