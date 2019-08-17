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
  it.only('should return a proxy provided string that represent the names of the class to proxy', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const queryBuilder = new QueryBuilderProxy([address, client, customer, invoice]);

    console.log(queryBuilder);
  });
});
