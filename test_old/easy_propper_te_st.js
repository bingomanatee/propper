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
      const myEPropper = easyPropper(classDef)
        .addIsValid();

      myEPropper.addDate('started');

      const instance = new classDef();
      const now = new Date();

      instance.started = now;

      expect(instance.started.getTime()).toEqual(now.getTime());

      try {
        instance.started = 3;
        console.log('----------- propErrors: ', instance.propErrors);
      } catch (err) {
        expect(err.message).toEqual('bad value');
      }
    });

    it('should include failsWhen from options in the shorthand method', () => {
      expect.assertions(3);
      const myEPropper = easyPropper(classDef);

      myEPropper.addDate('started', {
        failsWhen: d => d.getTime() > Date.now(),
        errorMessage: 'started must be in the past',
      });

      const instance = new classDef();
      const now = new Date(Date.now() - 100);
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      instance.started = now;

      expect(instance.started.getTime()).toEqual(now.getTime());

      try {
        instance.started = 3;
      } catch (err) {
        expect(err.message).toEqual('bad value');
      }

      try {
        instance.started = futureDate;
      } catch (err) {
        expect(err.message).toEqual('started must be in the past');
      }
    });
  });
});
