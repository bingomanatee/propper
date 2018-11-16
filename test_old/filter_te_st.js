/* eslint-disable babel/new-cap */
import propper from './../src/index';

describe('Propper', () => {
  let classDef;

  beforeEach(() => {
    class GenericClass {

    }

    classDef = GenericClass;
  });

  describe('filter', () => {
    describe('simple', () => {
      let instance;
      beforeEach(() => {
        const myPropper = propper(classDef);
        myPropper.addProp('foo', {
          failsWhen: value => value <= 2,
          errorMessage: '#name# passed value <= 2 (#value#)',
        });
        instance = new classDef();
      });

      it('should fail when set to a bad value', () => {
        expect.assertions(1);
        try {
          instance.foo = 2;
        } catch (err) {
          expect(err.message).toEqual('foo passed value <= 2 (2)');
        }
      });

      it('should succeed when set to a good value', () => {
        expect.assertions(0);
        try {
          instance.foo = 3;
        } catch (err) {
          expect(err.message).toEqual('foo passed value <= 2 (3)');
        }
      });
    });
  });

  describe('simple/string', () => {
    let instance;

    beforeEach(() => {
      const myPropper = propper(classDef);
      myPropper.addProp('foo', {
        type: 'date', errorMessage: 'foo must be a date',
      });
      instance = new classDef();
    });

    it('should succeed on a date', () => {
      expect.assertions(0);

      try {
        instance.foo = new Date();
      } catch (err) {
        expect(err.message).toEqual('foo must be a date');
      }
    });

    it('should fail on a non date', () => {
      expect.assertions(1);

      try {
        instance.foo = 2;
      } catch (err) {
        expect(err.message).toEqual('foo must be a date');
      }
    });
  });
});
