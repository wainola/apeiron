const util = require('util');
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
    if (Object.keys(this.QueryBuilderProxy).length !== 0) {
      const proxiedSingleInstance = this.QueryBuilderProxy.setProxyForSingleInstance();
      return proxiedSingleInstance;
    }
  } catch (error) {
    return error;
  }
};

Injector.prototype.setDependency = function resolveDependency(dependency) {
  this.QueryBuilderProxy = new QueryBuilderProxy(dependency);
  return this;
};

module.exports = new Injector();
