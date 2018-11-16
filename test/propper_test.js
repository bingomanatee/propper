/* eslint-disable babel/new-cap */
import propper, { Propper } from './../src/index';

describe('Propper', () => {
  let MyClass;

  beforeEach(() => {
    class GenericClass {
      change(...args) {
        if (!this._changes) this._changes = [];
        this._changes.push(args);
      }

      get changes() { return this._changes || []; }
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
          expect(err.message).toEqual('required');
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
