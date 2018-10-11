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

    it('should run in the context of the instance, and allow bad values if it returns true', () => {
      const myPropper = propper(classDef);
      myPropper.addProp('errors', {
        type: 'array',
        defaultValue: () => ([]),
      }).addProp('foo', {
        required: true,
        onBadData(name, value, error) {
          this.errors.push({ name, value, error });
          return true;
        },
      });

      const instance = new classDef();

      instance.foo = 'bar';

      expect(instance.foo).toEqual('bar');

      instance.foo = '';
      expect(instance.foo).toEqual('');
      expect(instance.errors[0].error).toEqual('foo is required');
    });

    it('should run in the context of the instance, not and allow bad values if it returns false', () => {
      const myPropper = propper(classDef);
      myPropper.addProp('errors', {
        type: 'array',
        defaultValue: () => ([]),
      }).addProp('foo', {
        required: true,
        onBadData(name, value, error) {
          this.errors.push({ name, value, error });
          return false;
        },
      });

      const instance = new classDef();

      instance.foo = 'bar';

      expect(instance.foo).toEqual('bar');

      instance.foo = '';
      expect(instance.foo).toEqual('bar');
      expect(instance.errors[0].error).toEqual('foo is required');
    });
  });
});
