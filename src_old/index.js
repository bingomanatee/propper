import Propper from './Propper';
import easyPropper from './EasyPropper';
import Validator from './Validator';

const propper = (classDef, options = {}) => new Propper(classDef, options);

export default propper;

export { Propper, propper, easyPropper, Validator };

