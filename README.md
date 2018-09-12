This is a utility for creating class properties with optional validation, type criteria, regex filters, etc. 
It is middleware for Object.createProperty. 

field validation in OOP is a bit tedious; you have to define rules 
for a field, define an overall validator for the instance and 
collect errors from fields. The code to do this varies very little and 
there's no reason to keep pounding it out so I collected it here in a series of 
meta-methods. 

## Defining Properties onto classes

The basic workflow is this:

1. __Define a class__

Your class (es6) can have any sort of constructor, properties, methods, etc. 

````javascript

class UserRecord {
  constructor(props) {
    for (let prop in props) {
      this[prop] = props[prop];
    }
  }
  
  get name() {
   return this._name;
  }
  
  set name(value) {
    this._name = value;
  }
}

````

You could go on and stamp all sorts of fields on this class... address, phone, fax, email....
but the boilerplate gets huge without a whole lot of useful value. 

instead we do this:

```javascript

const userPropper = propper(UserRecord);

userPropper.addString('address')
.addString('phone', {required: true})
.addString('email', {regex: /^(.*@.*\.[\w]+$/, regexMessage: '#name# must be a proper email value'})
.addProp('age', {filter: 'integer'})
.addProp('birthday', {filter: 'date'});

```

Now, instances of UserRecord will have formal field definitions and criteria:

```javascript

let user = new UserRecord({name: 'Bob', phone: '111-222-3333', email: 'bob@gmail.com', birthday: new Date(1966, 11,2)});

```

And if you try to set bad data to the user record it will choke:

```javascript

try {
  user.birthday = 11;
} catch (err) {
  console.log('error: ', err);
}

```

The amount of boilerplate this requires in long-form JS is many times this with no real 
added value (and room for errors.)

## A note on default values

There is no validation done on default values. The assumption here is that it is
the class designer's responsibility to either (a) set a default that is valid or
(b) not actually care about the validity of the initial value until it is set. 

## Validation

Validation is at the core of this library. Each property that has tests is assigned a validator 
instance. Validators have three properties:

* __failsWhen__: a function OR an array of validators
* __defaultError__: a string that is emitted when the failsWhen succeeds
* __errors__: an optional hash of responses to specific emissions from __failsWhen__

Eventually you'll want to execute multiple tests on the same property. There are two ways to do this:

1. Create a __failsWhen__ that has multiple tests inside it and emits keys 
   that have analogs in the __errors__ property
2. create a validator whose __failsWhen__ is an array of single validators. 

### Example:

Say you want a property to be a date but one that is not in the future. 

You could do this in two ways as mentoned above First, the compound validator

```javascript

let v = new Validator((d) => {
  if (!(d instanceof Date)) { return 'nondate'}
  if (d.getTime() > Date.now())  { return 'future'}
},
'bad #name#',
{nodate: 'value must be a javascript date', future: 'value must be in the past'})

```

Or through compounding:


```javascript

let v = new Validator([
    new Validator('date', 'value must be a javascript date'),
    new Validator((d) => d.getTime() > Date.now(), 'value must be in the past')
])

// exactly equal to 

let v = Validator.compound(
    new Validator('date', 'value must be a javascript date'),
    new Validator((d) => d.getTime() > Date.now(), 'value must be in the past'));

```

the effect will be the same from a "black box" point ov view. 

A few things to note:

* instead of a function you can put a key that evaluates to a method of the `is` node module. 
* the tests are run sequentially, so in a second compound test you can assume that the first 
  one has not been triggered
* There are a few tokens you can use to emboss your error messages: 
  * `#name#` represents the name of the field. Since this is only known externally to the 
    validator itself, it won't be replaced inside the Validator itself. 
  * `#value#` represents the failing value. 

## Validators in practice

addProp's `options` parameter has two properties for setting the validation criteria of 
a property: __failsWhen__ and __errorMessage__.

* if __failsWhen__ is a validator, __errorMessage__ is ignored. 
* if it is a _function_ or an _array_ (of functions or validators) a validator is created
  using __failsWhen__ and __errorMessage__ as the arguments to the new Validator. 

## And the hits keep on coming

An experimental variant of propper is `EasyPropper`. It uses Proxy which is not avialable
on every platform so use with caution. What it does do is let you define tests "Magically".

```javascript

const {easyPropper} = require('propper');

class BaseClass {
  
}

const bcPropper = easyPropper(BaseClass)
.addDate('created')
.addString('name', {required: true})
.addInteger('age');

let instance = new BaseClass();

instance.created = new Date();
instance.age = 'one'; // fails because not an integer.

```

these methods are "Magic" -- for those that hate magic, you can skip this. For those that do, 
the add[name] has an analog to the properties of the `is` module. 

for instance, the above is exactly equal to 

```javascript

const {propper} = require('propper');

class BaseClass {
  
}

const bcPropper = propper(BaseClass)
.addProp('created', {failsWhen: 'date'})
.addProp('name', {failsWhen: 'string', required: true})
.addProp('age', {failsWhen: 'integer'});

let instance = new BaseClass();

instance.created = new Date();
instance.age = 'one'; // fails because not an integer.

```
... but its quicker and more semantic.

Just to reiterate that this is equivalent to 

```javascript

const {propper} = require('propper');

class BaseClass {
  
}

const bcPropper = propper(BaseClass)
.addProp('created', {failsWhen: (value) => !is.date(value)})
.addProp('name', {failsWhen: (value) => !is.string(value), required: true})
.addProp('age', {failsWhen: (value) => !is.integer(value)});

let instance = new BaseClass();

instance.created = new Date();
instance.age = 'one'; // fails because not an integer.

```

## Reflection: isValid and propErrors

You can also poll the condition of the class as a whole and get errors just as you can with Ruby 
activeRecord instances. 

when you prepare your propper with `propper(BaseClass).addIsValid()`, it adds two methods, 
__propErrors__ and __isValid__. They are properties, not methods/functions. 

### isValid

isValid returns true if every field that has validation criteria's current values are good. 
if one or more of them aren't, it returns false. 

### propErrors

PropErrors is an array of `{prop: [name of field: string], error: [error message: string]}`
objects that tell you which specific fields are bad (and why). If none are, it returns null. 

Note - `addIsValid()` must be called BEFORE addProps or you will lose track of 
some of the validators. 

## Dependencies

This class 
