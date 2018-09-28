/* eslint-disable babel/new-cap */
import propper from './../src/index';

describe('Propper', () => {
  let classDef;

  beforeEach(() => {
    class GenericClass {
      change(...args) {
        if (!this._changes) this._changes = [];
        this._changes.push(args);
      }

      get changes() { return this._changes || []; }
    }

    classDef = GenericClass;
  });

  describe('constructor', () => {
    it('should create a Propper', () => {
      const myPropper = propper(classDef);

      expect(myPropper.IDENTITY).toEqual('PROPPER');
    });
  });

  describe('addProp', () => {
    it('should add a writable property to a class', () => {
      // not much of a failsWhen - just making sure no explosions

      const myPropper = propper(classDef);

      myPropper.addProp('foo');
      const instance = new classDef();
      instance.foo = 2;

      expect(instance.foo).toEqual(2);
    });

    it('should accept a required flag', () => {
      expect.assertions(2);
      const myPropper = propper(classDef);

      myPropper.addProp('foo', { required: true });
      myPropper.addProp('bar', { required: true });

      const instance = new classDef();
      instance.foo = 2;

      expect(instance.foo).toEqual(2);

      try {
        instance.bar = null;
      } catch (err) {
        expect(err.message).toEqual('bar is required');
      }
    });

    it('should reflect an initial value', () => {
      const myPropper = propper(classDef);

      myPropper.addProp('foo', { defaultValue: 1 });
      const instance = new classDef();

      expect(instance.foo).toEqual(1);

      instance.foo = 2;

      expect(instance.foo).toEqual(2);
    });

    it('should accept an initial value factory', () => {
      const myPropper = propper(classDef);

      myPropper.addProp('foo', { defaultValue: () => [1, 2] });
      const instance = new classDef();

      expect(instance.foo).toEqual([1, 2]);

      instance.foo[0] = 2;

      expect(instance.foo).toEqual([2, 2]);
      // make sure the reference to the array is unique to the instance

      const instance2 = new classDef();

      expect(instance2.foo).toEqual([1, 2]); // change to instance2 not propogatyed to instance...
      instance2[0] = 3;
      expect(instance.foo).toEqual([2, 2]); // and vice versa
    });

    it('should accept an onChange hook', () => {
      const myPropper = propper(classDef);
      myPropper.addProp('foo', { onChange: 'change' });

      const instance = new classDef();

      expect(instance.changes).toEqual([]);

      instance.foo = 2;
      expect(instance.foo).toEqual(2);
      expect(instance.changes).toEqual([[2, undefined, 'foo']]);
    });

    it('should accept an onChange hook with a default', () => {
      const myPropper = propper(classDef);
      myPropper.addProp('foo', { onChange: 'change', defaultValue: 0 });

      const instance = new classDef();

      expect(instance.changes).toEqual([]);
      expect(instance.foo).toEqual(0);

      instance.foo = 2;
      expect(instance.foo).toEqual(2);
      expect(instance.changes).toEqual([[2, 0, 'foo']]);
    });
  });
});
