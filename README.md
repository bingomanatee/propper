This is a utility for creating class properties with optional validation, 
type criteria, regex filters, etc. 
It is middleware for Object.createProperty on an es6 Class prototype. 

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

propper(UserRecord)
.addProp('address', {type: 'string'})
.addProp('phone', { type: 'string', required: true})
.addProp('email', {type: 'string', tests:[[n => /^(.*@.*\.[\w]+$/.test(n),false, 
         '#name# must be a proper email value']]})
.addProp('age', {type: 'integer'})
.addProp('birthday', {type: 'date'});

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

* __type__ - the name of a type; see the `is` module for possible tests.
* __onInvalid__ (function) triggered when invalid data is assigned to a field. if absent, throws 
* __required__ (boolean) determines whether the value is required or not. (see @wonderlandlabs/inspector
  for more details on the implication of required)
* __defaultValue__ (function|value) either a factory for the inital value or the value that
  the property has before one is set. Note, non-scalar initial values should come from a function.
* __localName__ (string) name of the local prop the data is stored in; defaults to '_' + name
* __tests__ constructor for an ifFn; string, array of arrays or functions. (see @wonderlandlabs/inspector)

These methods are chainable.

## A note on initial values

There is no validation done on initial values. Because validation happens when a property is
set, there is no activity to validate before the first time a value is set. 

## Handling validation errors

There may be reasons not to throw an error; if you want to handle bad data in a custom way,
add an `onInvalid` method; it will receive the name of the field, the value attempted, 
and the error message. The field value will not be changed, unless your custom onInvalid
returns true. In the absence of a custom `onInvalid` hook, 
any attempt to set a field to a bad value (validation/type failure) will throw an error. 

## Dependencies

propper uses @wonderlandlabs/inspector to produce the validator that tests whether values 
passed into a property are good or not. Downstream, any string test is converted to a 
function from the 'is' module (a dependency of @wonderlandlabs/inspector).

if you pass 'object' as a value for `type`, then the property will be invalid if the 
property is passed a non-object. 
