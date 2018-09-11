const propper = require('./build/index');

class Foo {

}

const myPropper = propper.default(Foo);

myPropper.addProp('bar', { test: 'integer', errorMessage: 'must be an integer' });
myPropper.addProp('num', {
  test: value => value <= 2,
});
const instance = new Foo();

instance.bar = 2;

try {
  instance.num = 2;
} catch (err) {
  expect(err.message).toEqual('(foo) bad value 2');
}
