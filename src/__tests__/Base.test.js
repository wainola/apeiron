const Address = require('../__mocks__/Address');
const Client = require('../__mocks__/Client');
const Customer = require('../__mocks__/Customer');
const Invoice = require('../__mocks__/Invoice');

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
  it('should setup the attributes for all the instances', () => {
    const address = new Address();
    const client = new Client();
    const customer = new Customer();
    const invoice = new Invoice();

    const { instancesAndMethods } = new Base([address, client, customer, invoice]);

    const instancesKeys = Object.keys(instancesAndMethods);
    instancesKeys.forEach(item =>
      expect(Array.isArray(instancesAndMethods[item].attributes)).toBe(true)
    );
  });
  it('should setup one single instance', () => {
    const client = new Client();
    const { instancesAndMethods } = new Base(client);
    const instanceKeys = Object.keys(instancesAndMethods.Client);
    expect(instanceKeys).toEqual(['methods', 'instance', 'attributes']);
  });
});
