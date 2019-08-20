[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# Meta Apeiron.

This module allows to builds basic CRUD query functionality inside clases that are models, and are used inside handler on APIs. By following some conventions inside your model class, Apeiron can map over your methods and return the basic CRUD querys based on the attributes or your class, that are related to your tables attributes.

## Rationale.

This module is vaguely based on the Active Record pattern that you can see on RoR. I said vaguely, because it only takes the idea that we could use metaprogramming to abstract away the logic of building simple CRUD operations inside our classes that models our tables. The advantage of this approach is simple: there is a instance that builds for you some queries in order to avoid to writte that by yourself

Although this justification doesn't make sense in the context of the motivations that I had to build this little module. The true is I like metaprogramming as a technique and concept. It's makes the task of software creation more closer to the real ideal behind the invention of computer: automate things. In this case, automation of code generation.

## How to use it.

This module assumes that you follow some conventions in the creation of your model classes. This conventions as at follows:

- every model file should be a class.
- the attributes that describes the columns of your table should be initialized inside the constructor as a `attribute` property of the instance.
- the `attribute` property should initialize as a new set.
- all the models should have the following methods: **insert**, **update**, **delete**, **get**.
- you should always pass a array of instances.
- if you want to retreive the proxied intance, you should pass the exact name of it. If your class is named **MyClass** you should pass to the **setProxy** method the same name.
- that's it.

## Example

```js
// ./src/models/customer.js

class Customer {
  constructor() {
    this.attributes = new Set()
      .add('id')
      .add('name')
      .add('lastname')
      .add('email')
      .add('age')
      .add('createdat')
      .add('updatedat')
      .add('deletedat');
  }

  async insert(params) {
    return params;
  }

  async update(params, id) {
    return params;
  }

  async delete(id) {
    return id;
  }

  async get(params, id) {
    return params;
  }
}

// ./src/handlers/customerHandler.js
const MetaAperion = require('meta-aperion');
const Customer = require('../models/customer.js');
MetaAperion.setDependencies([Customer]);
const proxiedCustomer = MetaAperion.setProxy('Customer');

class CustomerHandler {
  /**
   * body = { customer: { name: 'john', lastname: 'doe', email: 'john@email.com', age: 23 }}
   * */
  async postCustomer({ body }, response) {
    const { customer } = body;
    const customerInserted = await proxiedCustomer.insert(customer); // insert into customer (name, ...) values ('john', ...) returning *;
    return response.status(201).send({ data: customerInserted });
  }
}
```

## TODO

- single method that returns inmediatly the proxied dependency.
- we can pass either a array of instances or a single instance
- add error logs when something goes wrong.
