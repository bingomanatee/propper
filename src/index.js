import Propper from './Propper';

const propInjector = (classDef, options = {}) => new Propper(classDef, options);

export default propInjector;

export { Propper, propInjector };

