

let propper = require('./build/index');

const { Validator } = propper;
propper = propper.default;
class Foo {

}

const myPropper = propper(Foo);

myPropper.addProp('bar', { test: 'integer', errorMessage: 'must be an integer' });
myPropper.addProp('num', {
  test: value => value <= 2,
});
const instance = new Foo();

instance.bar = 2;

try {
  instance.num = 2;
} catch (err) {
  console.log('error: ', err);
}

myPropper.addString('name', { min: 3 });

const inst2 = new Foo();

try {
  inst2.name = 'a';
} catch (err) {
  console.log('error: ', err);
}

class IVclass {}
let myPropper2;
myPropper2 = propper(IVclass)
  .addIsValid()
  .addString('name', { required: true })
  .addProp('age', { test: Validator.compound('integer', new Validator(n => n < 18, 'must be at least 18')) })
  .addProp('male', { test: 'boolean', defaultValue: null });

const i = new IVclass();
const v = i.isValid;

console.log('i is valid: ', v);
console.log('i errors: ', i.propErrors);

Object.assign(i, { name: 'bob', age: 20, male: true });

console.log('i is valid: ', i.isValid);
console.log('i errors: ', i.propErrors);
