const util = require('util');
const Injector = require('../index');

class Car {
  constructor() {
    this.attributes = new Set()
      .add('id')
      .add('name')
      .add('model')
      .add('manufacturer')
      .add('engine_type')
      .add('quantity')
      .add('fk_address_from')
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

const car = new Car();

describe('e2e', () => {
  let proxiedCar;
  it('should return a proxied instance', () => {
    Injector.setDependencies([car]);
    proxiedCar = Injector.proxyInstance('car');
    expect(util.types.isProxy(proxiedCar)).toBe(true);
  });
  it('should return a insertion query on the proxied instance', async () => {
    const insertionQuery = await proxiedCar.insert({
      name: 'V40',
      model: 'V40 Turbo',
      manufacturer: 'Volvo',
      engine_type: 'turbo twin',
      quantity: 23000
    });
    const exp = `insert into car (name, model, manufacturer, engine_type, quantity) values ('v40', 'v40 turbo', 'volvo', 'turbo twin', 23000) returning *;`;
    expect(insertionQuery.toLowerCase()).toEqual(exp);
  });
  it('should return a updation query on the proxied instance', async () => {
    const updationQuery = await proxiedCar.update(
      {
        model: 'S60',
        engine_type: 'electric',
        quantity: 450
      },
      'someRandomId13234'
    );
    const exp = `update car set model='s60', engine_type='electric', quantity=450 where id = 'somerandomid13234';`;
    expect(updationQuery.toLowerCase()).toEqual(exp);
  });
  it('should return a deletion query on the proxied instance', async () => {
    const deletionQuery = await proxiedCar.delete('someId');
    const exp = `delete from car where id = 'someid';`;
    expect(deletionQuery.toLowerCase()).toEqual(exp);
  });
  it('should return a selection query on the proxied instance', async () => {
    const selectionQuery = await proxiedCar.get(
      ['name', 'model', 'quantity', 'fk_address_from', 'createdat'],
      'someId'
    );
    const exp = `select name, model, quantity, fk_address_from, createdat from car where id = 'someid';`;
    expect(selectionQuery.toLowerCase()).toEqual(exp);
  });
});
