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

    });

    it('should run in the context of the instance, and allow bad values if it returns true', () => {
    });

    it('should run in the context of the instance, not and allow bad values if it returns false', () => {

    });
  });
});
