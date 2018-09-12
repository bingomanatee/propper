This is a utility for creating class properties with optional validation, type criteria, regex filters, etc. 
It is middleware for Object.createProperty. 

field validation in OOP is a bit tedious; you have to define rules 
for a field, define an overall validator for the instance and 
collect errors from fields. The code to do this varies very little and 
there's no reason to keep pounding it out so I collected it here in a series of 
meta-methods. 

## Defining Properties onto classes

The basic workflow is this:

1. `Define a class`

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

let user = new UserRecord({name: 'Bob', phone: '111-222-3333', 
email: 'bob@gmail.com', birthday: new Date(1966, 11,2)});

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

## `addProp(propName, options = {})` and `addString(propName, options={})`

addProp adds a property to the prototype of the class you are wrapping. 
The value of options will be used in the `Object.defineProperty(name, options)` 
call except for the Propper-specific values: 

These properties define the validation requirement of the field, and how invalid data is handled:
They are all optional. 

* __failsWhen__ see validation, below
* __errorMessage__ 
* __onBadData__ (function) triggered when invalid data is assigned to a field. if absent, throws 
* __required__ (boolean)

These do other things:

* __defaultValue__
* __localName__ (string) name of the local prop the data is stored in; defaults to '_' + name

`addString(name, options)` is the same as addProp but adds a string validator as well
as a few more optional validations specific to strings. 
These are used in addString a variant of addProp

* __regex__ (regex)
* __regexErrorMessage__ (string)
* __min__ (number) a length criteria for the value
* __max__ (number) " "

These methods are chainable.

## A note on default values

There is no validation done on default values. The assumption here is that it is
the class designer's responsibility to either (a) set a default that is valid or
(b) not actually care about the validity of the initial value until it is set. 

## Validation

Validation is at the core of this library. Each property that has tests is assigned a validator 
instance. Validators have three properties:

* `failsWhen`: a function, validator, string (name of `is` method) OR an array of same.
* `defaultError`: a string that is emitted when the failsWhen succeeds
* `errors` (optional): an optional hash of responses to specific emissions from `failsWhen`

Eventually you'll want to execute multiple tests on the same property. There are two ways to do this:

1. Create a `failsWhen` that has multiple tests inside it and emits keys 
   that have analogs in the `errors` property
2. create a validator whose `failsWhen` is an array of single validators. 

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
a property: `failsWhen` and `errorMessage`.

* if `failsWhen` is a validator, `errorMessage` is ignored. 
* if it is a _function_ or an _array_ (of functions or validators) a validator is created
  using `failsWhen` and `errorMessage` as the arguments to the new Validator. 

## "Magic" props with implicit validation

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

or ...

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
... but its quicker and more semantic. You can add any options you want 
to "magic" methods, even further validators, 
which will execute after the magic validator implicit in the method. 

## Reflection: isValid and propErrors

You can also poll the condition of the class as a whole and get errors just as you can with Ruby 
activeRecord instances. 

when you prepare your propper with `propper(BaseClass).addIsValid()`, it adds two methods, 
`propErrors` and `isValid`. They are properties, not methods/functions. 

### isValid

isValid returns true if every field that has validation criteria's current values are good. 
if one or more of them aren't, it returns false. 

### propErrors

PropErrors is an array of `{prop: [name of field: string], error: [error message: string]}`
objects that tell you which specific fields are bad (and why). If none are, it returns null. 

Note - `addIsValid()` must be called BEFORE addProps or you will lose track of 
some of the validators. 

## Preloading Validator and onBadData

If you have a series of properties with identical validators you can set them at the Propper 
level (ha!); note, you have to clear them at the end or they carry through. 

```javascript

class UserRecord {}
const userPropper = propper(UserRecord);

userPropper
.withValidator(new Validator((n) => (Number.isNumber(n) && n >= 0).reverseTest()))
.addInteger('age')
.addInteger('children')
.addInteger('income')
.clearValidator()
addString('address')
.addString('phone', {required: true})
.addString('email', {regex: /^(.*@.*\.[\w]+$/,
 regexMessage: '#name# must be a proper email value'})
.addProp('age', {filter: 'integer'})
.addProp('birthday', {filter: 'date'});

```

## Handling validation errors

There may be reasons not to throw an error; if you want to handle bad data in a custom way,
add an `onBadData` method; it will receive the name of the field, the value attempted, 
and the error message. The field value will not be changed. Failing this adjustment,
any attempt to set a field to a bad value (validation failure) will throw an error. 

If you don't throw on validation errors you will probably want to use `addIsValid()` to get
the status of an instance. 

## Dependencies

This class depends on the `is` module for tests. You don't need to use the is methods for 
your validators - you can always write your own failsWhen functions longhand. 
