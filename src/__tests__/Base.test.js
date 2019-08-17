const Address = require('./mockClasses/Address');
const Client = require('./mockClasses/Client');
const Customer = require('./mockClasses/Customer');
const Invoice = require('./mockClasses/Invoice');

const Base = require('../Base');

describe('Base class test', () => {
  it('should set the property instancesAndMethods after passed and array of instances. Should return and array of object with instances names and methods properties', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const { instancesAndMethods } = new Base([address, client, customer, invoice]);

    const instancesKeys = Object.keys(instancesAndMethods);
    expect(instancesKeys).toHaveLength(4);
    instancesKeys.forEach(item => {
      expect(Array.isArray(instancesAndMethods[item].methods)).toBe(true);
    });
  });
  it.only('should setup the attributes for all the instances', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const base = new Base([address, client, customer, invoice]);

    console.log('base:', base.instancesAndMethods);
  });
});
