const QueryBuilderProxy = require('./QueryBuilderProxy');

function Injector() {
  this.dependencies = {};
  this.QueryBuilderProxy = null;
}

Injector.prototype.setDependencies = function setupDepencencies(dependencies) {
  this.QueryBuilderProxy = new QueryBuilderProxy(dependencies);
};

Injector.prototype.proxyInstance = function resolveProxiedInstance(dependecyName) {
  try {
    if (dependecyName !== undefined) {
      const proxiedInstance = this.QueryBuilderProxy.setProxy(dependecyName);
      return proxiedInstance;
    }
    throw new Error('No key passed.');
  } catch (error) {
    return error;
  }
};

module.exports = new Injector();
