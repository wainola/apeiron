const util = require('util');
const QueryBuilderProxy = require('../QueryBuilderProxy');
const Base = require('../Base');
const Address = require('./mockClasses/Address');
const Client = require('./mockClasses/Client');
const Customer = require('./mockClasses/Customer');
const Invoice = require('./mockClasses/Invoice');

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
  it.only('should build a insertion query if the proxied class use the insert method', async () => {
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
    console.log('insertQuery', insertionQuery);
    const exps = `insert into client (name, lastname, email, fk_address_id) values ('john', 'doe', 'john@doe.com', '1') returning *;`
    expect(insertionQuery.toLowerCase()).toEqual(exps)
  });
  it('should build a updation query if the proxied class use the update method', () => {});
  it('should build a deletion query if the proxied class use the delete method', () => {});
  it('should build a selection query if the proxied class use the get method', () => {});
});
