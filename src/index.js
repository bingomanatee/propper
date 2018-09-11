import Propper from './Propper';
import easyPropper from './EasyPropper';
import Validator from './Validator';

export default (classDef, options = {}) => new Propper(classDef, options);

export { Propper, easyPropper, Validator };
