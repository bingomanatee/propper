/* eslint-disable babel/new-cap */
import util from 'util';

import propper, { Validator } from './../src/index';

describe('Propper', () => {
  describe('isValid/propErrors', () => {
    let classDef;

    beforeEach(() => {
      class GenericClass {

      }

      classDef = GenericClass;
    });

    describe('isValid', () => {
      let myPropper;

      beforeEach(() => myPropper = propper(classDef)
        .addIsValid()
        .addString('name', { required: true })
        .addProp('age', { type: 'integer', failsWhen: new Validator(n => n < 18, 'must be at least 18') })
        .addProp('male', { type: 'boolean', defaultValue: null }));

      it('should start invalid', () => {
        const bob = new classDef();
        expect(bob.isValid).toBeFalsy();
      });

      it('should be valid with good data', () => {
        const bob = new classDef();
        Object.assign(bob, { name: 'Bob', age: 20, male: true });

        expect(bob.isValid).toBeTruthy();
      });
    });

    describe('propErrors', () => {
      let myPropper;

      beforeEach(() => myPropper = propper(classDef)
        .addIsValid()
        .addString('name', { required: true })
        .addProp('age', { failsWhen: Validator.compound('integer', new Validator(n => n < 18, 'must be at least 18')) })
        .addProp('male', { type: 'boolean', defaultValue: null }));

      it('should start invalid', () => {
        const bob = new classDef();

        expect(bob.propErrors).toEqual([{ error: 'name is required', prop: 'name' },
          { error: 'bad value', prop: 'age' },
          { error: 'male must be a boolean', prop: 'male' }]);
      });

      it('should be valid with good data', () => {
        const bob = new classDef();
        Object.assign(bob, { name: 'Bob', age: 20, male: true });

        expect(bob.propErrors).toEqual(null);
      });
    });
  });
});
