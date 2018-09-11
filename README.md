This is a utility for creating class properties with optional validation, type criteria, regex filters, etc. 
It is middleware for Object.createProperty. 

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

The amount of boilerplate this requires in long-form JS is many times this with no real added value (and room for errors.)
