const QueryBuilderProxy = require('./QueryBuilderProxy');

function Injector() {
  this.dependencies = {};
  this.QueryBuilderProxy = new QueryBuilderProxy();
}

Injector.prototype.getDependencies = function resolveDependecies() {
  return this.dependencies;
};

Injector.prototype.setDependency = function setupDepencencie(dependency) {
  if (!Array.isArray(dependency)) {
    const instanceName = this.getInstanceName(dependency);

    this.dependencies = {
      ...this.dependencies,
      [instanceName]: dependency
    };
    return instanceName;
  }

  const instancesNames = dependency.map(item => {
    const iName = this.getInstanceName(item);
    this.dependencies = {
      ...this.dependencies,
      [iName]: item
    };
    return { instanceName: iName };
  });

  return instancesNames;
};

Injector.prototype.proxyInstance = function resolveProxiedInstance(key) {
  try {
    if (key !== undefined) {
      const dependency = this.dependencies[key];
      this.QueryBuilderProxy.setInstance([dependency]);
      const proxiedInstance = this.QueryBuilderProxy.setProxy(dependency);
      return proxiedInstance;
    }
    throw new Error('No key passed.');
  } catch (error) {
    return error;
  }
};

Injector.prototype.getInstanceName = function resolveInstanceName(dependency) {
  const {
    constructor: { name: instanceName }
  } = Reflect.getPrototypeOf(dependency);
  return instanceName.toLowerCase();
};

module.exports = new Injector();
