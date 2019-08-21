const util = require('util');
const Injector = require('../Injector');
const QueryBuilderProxy = require('../QueryBuilderProxy');
const Address = require('../__mocks__/Address');
const Client = require('../__mocks__/Client');
const Customer = require('../__mocks__/Customer');
const Invoice = require('../__mocks__/Invoice');

describe('Injector test', () => {
  it('should have a attribute QueryBuilderProxy that is null by default', () => {
    const { QueryBuilderProxy } = Injector;
    expect(QueryBuilderProxy).toBe(null);
  });
  it('should have a QueryBuilderProxy attribute that is instance of QueryBuilderProxy after the usage of the setDependencies methods', () => {
    const client = new Client();
    const address = new Address();
    const customer = new Customer();
    const invoice = new Invoice();
    Injector.setDependencies([client, address, customer, invoice]);
    const { QueryBuilderProxy: qb } = Injector;
    expect(qb).toBeInstanceOf(QueryBuilderProxy);
  });
  it('should return a proxy instances that is type of proxy after the usage of proxyInstance method', () => {
    const proxiedInvoice = Injector.proxyInstance('invoice');
    expect(util.types.isProxy(proxiedInvoice)).toBe(true);
  });
  it('should setup a proxy after using the chaining method on setDependecy', () => {
    const invoice = new Invoice();
    const proxiedInvoice = Injector.setDependency(invoice).proxyInstance();
    expect(util.types.isProxy(proxiedInvoice)).toBe(true);
  });
  it('should setup a proxy after using chaining method on setDependecy and the perform an updation query', async () => {
    const invoice = new Invoice();
    const proxiedInvoice = Injector.setDependency(invoice).proxyInstance();
    const updationQuery = await proxiedInvoice.update(
      { num_order: 1234567, client_id: 'someid123', amount: 125000 },
      'otherid123'
    );
    const exps = `update invoice set num_order=1234567, client_id='someid123', amount=125000 where id = 'otherid123';`;
    expect(updationQuery.toLowerCase()).toEqual(exps);
  });
});
