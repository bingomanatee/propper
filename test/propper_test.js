/* eslint-disable babel/new-cap */
import propper, { Propper } from './../src/index';

describe('Propper', () => {
  let MyClass;

  beforeEach(() => {
    class GenericClass {
    }

    MyClass = GenericClass;
  });

  describe('constructor', () => {
    it('should create a Propper', () => {
      const p = new Propper(MyClass);
      expect(p.BaseClass).toEqual(MyClass);
    });
  });

  describe('addProp', () => {
    it('should add a writable property to a class', () => {
      propper(MyClass)
        .addProp('title');

      const i = new MyClass();
      i.title = 'foo';
      expect(i.title).toEqual('foo');
    });

    describe('required', () => {
      it('should allow a value that is truthy', () => {
        propper(MyClass)
          .addProp('title', { required: true, onInvalid: 'throw' });

        const i = new MyClass();
        i.title = 'Fred';
        expect(i.title).toEqual('Fred');
      });

      it('should fail a bad value', () => {
        propper(MyClass)
          .addProp('title', { required: true, onInvalid: 'throw' });

        expect.assertions(1);
        try {
          const i = new MyClass();
          i.title = '';
        } catch (err) {
          expect(err.message).toEqual('title required');
        }
      });
    });

    describe('initialValue', () => {
      beforeEach(() => {
        propper(MyClass).addProp('count', { defaultValue: 0 });
      });

      it('should reflect an initial value', () => {
        const i = new MyClass();

        expect(i.count).toEqual(0);
      });

      it('should update normally', () => {
        const i = new MyClass();
        i.count = 2;
        expect(i.count).toEqual(2);
      });
    });

    describe('type', () => {
      it('should accept a type', () => {
        expect.assertions(2);

        propper(MyClass).addProp('count', { type: 'number' });
        const i = new MyClass();

        i.count = 3;
        expect(i.count).toEqual(3);

        try {
          i.count = 'three';
          console.log('i:', i);
        } catch (err) {
          expect(err.message).toEqual('count not an number');
        }
      });

      it('should accept a type and other tests', () => {
        expect.assertions(3);

        propper(MyClass).addProp('count', {
          type: 'number',
          tests: [
            [a => a >= 0, false, 'less than 0'],
          ],
        });
        const i = new MyClass();

        i.count = 3;
        expect(i.count).toEqual(3);

        try {
          i.count = 'three';
        } catch (err) {
          expect(err.message).toEqual('count not an number');
        }

        try {
          i.count = -2;
          console.log('i = ', i);
        } catch (err) {
          expect(err.message).toEqual('count less than 0');
        }
      });

      describe('should not execute tests if type fails', () => {
        let regexTestHit;
        let errors = [];

        beforeEach(() => {
          regexTestHit = 0;
          errors = [];
          propper(MyClass).addProp('phoneNumber', {
            type: 'string',
            onInvalid: (...args) => errors.push(args),
            tests: [
              [(value) => {
                regexTestHit += 1;
                return /[\d]{3}-[\d]{3}-[\d]{4}/.test(value);
              },
              false,
              'bad phone number',
              ],
            ],
          });
        });

        it('hits regex with a string', () => {
          const goodNumber = new MyClass();

          goodNumber.phoneNumber = '111-204-34534';

          expect(regexTestHit).toEqual(1);
          expect(errors).toEqual([]);
        });

        it('doesnt hit regex with a number', () => {
          const goodNumber = new MyClass();
          goodNumber.phoneNumber = 4;

          expect(regexTestHit).toEqual(0);
        });
      });
    });

    describe('onInvalid', () => {
      it('should handle bad data according to the invalid handler', () => {
        const errors = [];
        propper(MyClass).addProp('count', {
          tests: [
            [a => a >= 0, false, 'less than 0'],
          ],
          onInvalid(...args) {
            errors.push(args);
          },
        });

        const i = new MyClass();

        i.count = 2;

        expect(errors).toEqual([]);

        i.count = -2;
        expect(errors).toEqual([[-2, ['count less than 0']]]);
      });
    });

    describe('onChange', () => {
      let values = [];

      beforeEach(() => {
        values = [];
        propper(MyClass).addProp('feet', {
          // eslint-disable-next-line object-shorthand
          onChange: function (value) {
            values.push(value);
            this.inches = 12 * value;
          },
        });
      });
      it('should accept an onChange hook', () => {
        const i = new MyClass();
        i.feet = 2;
        expect(values).toEqual([2]);
        expect(i.inches).toEqual(24);
      });
    });

    it('should accept an onChange hook with a default', () => {
      const changes = [];
      propper(MyClass).addProp('foo', {
        // eslint-disable-next-line object-shorthand
        onChange: function (...args) {
          changes.push(args);
        },
        defaultValue: 0,
      });

      const instance = new MyClass();

      expect(changes).toEqual([]);
      expect(instance.foo).toEqual(0);
      instance.foo = 2;
      expect(instance.foo).toEqual(2);
      expect(changes).toEqual([[2, 0]]);
    });
  });
});
