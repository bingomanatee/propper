import propper from './../src/index';

describe('Propper', () => {
  let classDef;

  beforeEach(() => {
    class GenericClass {

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
      // not much of a test - just making sure no explosions

      const myPropper = propper(classDef);

      myPropper.addProp('foo');
      const instance = new classDef();
      instance.foo = 2;

      expect(instance.foo).toEqual(2);
    });

    it('should reflect an initial value', () => {
      const myPropper = propper(classDef);

      myPropper.addProp('foo', { value: 1 });
      const instance = new classDef();

      expect(instance.foo).toEqual(1);

      instance.foo = 2;

      expect(instance.foo).toEqual(2);
    });

    it('should accept an initial value factory', () => {
      const myPropper = propper(classDef);

      myPropper.addProp('foo', { value: () => [1, 2] });
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
  });
});
