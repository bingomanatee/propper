/* eslint-disable babel/new-cap */
import propper from './../src/index';

describe('Propper', () => {
  let classDef;

  beforeEach(() => {
    class GenericClass {

    }

    classDef = GenericClass;
  });

  describe('onBadData', () => {
    it('should not choke on errors', () => {
      expect.assertions(2);
      const myPropper = propper(classDef);
      myPropper.addString('foo', { onBadData: console.log, defaultValue: '' });

      const instance = new classDef();

      instance.foo = 'bar';

      expect(instance.foo).toEqual('bar');

      instance.foo = 2;
      // silently -- well not so silently, console.logs and goes on.
      expect(instance.foo).toEqual('bar');
    });
  });
});
