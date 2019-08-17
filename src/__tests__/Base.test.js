const Address = require('./mockClasses/Address');
const Client = require('./mockClasses/Client');
const Customer = require('./mockClasses/Customer');
const Invoice = require('./mockClasses/Invoice');

const Base = require('../Base');

describe('Base class test', () => {
  it('should set the property instancesAndMethods after passed and array of instances', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const base = new Base([address, client, customer, invoice]);
    console.log(base);
  });
});
