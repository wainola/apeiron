const util = require('util');
const QueryBuilderProxy = require('../QueryBuilderProxy');
const Base = require('../Base');
const Address = require('../__mocks__/Address');
const Client = require('../__mocks__/Client');
const Customer = require('../__mocks__/Customer');
const Invoice = require('../__mocks__/Invoice');

describe('QueryBuilder test', () => {
  it('should be instance of base', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);
    expect(queryBuilder).toBeInstanceOf(Base);
  });
  it('should be instance of QueryBuildeProxy', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);
    expect(queryBuilder).toBeInstanceOf(QueryBuilderProxy);
  });
  it('should set the internalHandler property as null on initialization', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);
    expect(queryBuilder.internalHandler).toBe(null);
  });
  it('should return a proxy provided string that represent the name of the class to proxy', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);

    const clientProxied = queryBuilder.setProxy('client');
    const invoiceProxied = queryBuilder.setProxy('invoice');
    expect(util.types.isProxy(clientProxied)).toBe(true);
    expect(util.types.isProxy(invoiceProxied)).toBe(true);
  });
  it('should build a insertion query if the proxied class use the insert method', async () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);
    const clientProxied = queryBuilder.setProxy('client');
    const insertionQuery = await clientProxied.insert({
      name: 'john',
      lastname: 'doe',
      email: 'john@doe.com',
      fk_address_id: 1
    });
    const exps = `insert into client (name, lastname, email, fk_address_id) values ('john', 'doe', 'john@doe.com', 1) returning *;`;
    expect(insertionQuery.toLowerCase()).toEqual(exps);
  });
  it('should build a updation query if the proxied class use the update method', async () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);
    const customerProxied = queryBuilder.setProxy('customer');
    const updationQuery = await customerProxied.update({ name: 'Don', PDI: '12345-7' }, 23);
    const exps = `update customer set name='don', pdi='12345-7' where id = '23';`;
    expect(updationQuery.toLowerCase()).toEqual(exps);
  });
  it('should build a deletion query if the proxied class use the delete method', async () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);
    const invoiceProxied = queryBuilder.setProxy('invoice');
    const deletionQuery = await invoiceProxied.delete('24');
    const exps = `delete from invoice where id = '24';`;
    expect(deletionQuery.toLowerCase()).toEqual(exps);
  });
  it('should build a selection query if the proxied class use the get method', async () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);
    const addressProxied = queryBuilder.setProxy('address');
    const selectionQuery = await addressProxied.get(['lat', 'long'], 1001);
    const exps = `select lat, long from address where id = '1001';`;
    expect(selectionQuery.toLowerCase()).toEqual(exps);
  });
  it("should generate an insertion or updation query, given a number type on the parametesr. The uptation or insertion query should reflect on it' semantics that we are using a number type on the sentence", async () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);
    const addressProxied = queryBuilder.setProxy('address');
    const invoiceProxied = queryBuilder.setProxy('invoice');
    const insertionQuery = await addressProxied.insert({
      address: 'some address',
      lat: 1234567,
      long: 987654
    });
    const updationQuery = await invoiceProxied.update(
      {
        num_order: 12345,
        client_id: 'someId123',
        amount: 120000
      },
      1234
    );
    const exps = `update invoice set num_order=12345, client_id='someid123', amount=120000 where id = '1234';`;
    const expsInsert = `insert into address (address, lat, long) values ('some address', 1234567, 987654) returning *;`;
    expect(updationQuery.toLowerCase()).toEqual(exps);
    expect(insertionQuery.toLowerCase()).toEqual(expsInsert);
  });
});
