/* eslint-disable babel/new-cap */
import { easyPropper } from './../src/index';

describe('Propper', () => {
  let classDef;

  beforeEach(() => {
    class GenericClass {

    }

    classDef = GenericClass;
  });

  describe('easyPropper', () => {
    it('should provide a JIT shim for date props', () => {
      expect.assertions(2);
      const myEPropper = easyPropper(classDef);

      myEPropper.addDate('started');

      const instance = new classDef();
      const now = new Date();

      instance.started = now;

      expect(instance.started.getTime()).toEqual(now.getTime());

      try {
        instance.started = 3;
      } catch (err) {
        expect(err.message).toEqual('(started) passed bad value 3');
      }
    });
  });
});
