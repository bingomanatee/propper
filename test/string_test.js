/* eslint-disable babel/new-cap */
import propper from './../src/index';

describe('Propper', () => {
  let classDef;

  beforeEach(() => {
    class GenericClass {

    }

    classDef = GenericClass;
  });

  describe('addString', () => {
    describe('simple', () => {
      it('should create a Propper', () => {
        const myPropper = propper(classDef);
        myPropper.addString('foo');

        const instance = new classDef();

        expect(instance.foo).toEqual('');

        instance.foo = 'bar';

        expect(instance.foo).toEqual('bar');
      });
    });


    describe('with min', () => {
      let instance;
      beforeEach(() => {
        const myPropper = propper(classDef);
        myPropper.addString('foo', { min: 3 });

        instance = new classDef();
      });
      it('should allow proper sized strings', () => {
        instance.foo = 'bar';

        expect(instance.foo).toEqual('bar');
      });
      it('should fail short strings', () => {
        expect.assertions(1);
        try {
          instance.foo = 'ba';
        } catch (err) {
          expect(err.message).toEqual('"ba" too short; foo must be at least 3 characters');
        }
      });
    });

    describe('with max', () => {
      let instance;
      beforeEach(() => {
        const myPropper = propper(classDef);
        myPropper.addString('foo', { max: 10 });

        instance = new classDef();
      });
      it('should allow proper sized strings', () => {
        instance.foo = 'bar';

        expect(instance.foo).toEqual('bar');
      });

      it('should fail long strings', () => {
        expect.assertions(1);
        try {
          instance.foo = 'itgoestoeleven';
        } catch (err) {
          expect(err.message)
            .toEqual('itgoestoeleven too long; foo cannot be longer than 10 characters');
        }
      });
    });
  });
});
