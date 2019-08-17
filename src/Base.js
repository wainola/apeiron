function Base(instances) {
  try {
    if (!Array.isArray(instances)) {
      throw new Error('No array of instances passed. You must pass an array');
    }
    this.internalHandler = null;
    this.instancesAndMethods = this.setInstancesAndMethods(instances);
  } catch (error) {
    return error;
  }
}

Base.prototype.setInstancesAndMethods = function resolveInstancesAndMethods(instances) {
  return instances.map(item => {
    const thePrototype = this.getPrototypesOfInstances(item);

    const theInternalProperties = this.getInternalPropertiesDescriptorOfPrototype(thePrototype);

    const descriptorEntries = this.getEntriesOfPrototype(theInternalProperties);

    const filteredByPropertiesNames = this.filterOnlyStrings(descriptorEntries);

    const filterByMethodNames = this.filterByMethodNames(filteredByPropertiesNames);

    return { instanceName: item.constructor.name, methods: [...filterByMethodNames] };
  });
};

Base.prototype.getPrototypesOfInstances = function resolvePrototypeOfInstances(instance) {
  return Reflect.getPrototypeOf(instance);
};

Base.prototype.getInternalPropertiesDescriptorOfPrototype = function resolveInternalProperties(
  instancePrototype
) {
  return Object.getOwnPropertyDescriptors(instancePrototype);
};

Base.prototype.getEntriesOfPrototype = function resolveEntriesOfPrototype(instancePrototype) {
  return Object.entries(instancePrototype).reduce((acc, item) => {
    acc.push(...item);
    return acc;
  }, []);
};

Base.prototype.filterOnlyStrings = function resolveStringsMethod(instancePrototypeEntries) {
  return instancePrototypeEntries.filter(item => typeof item === 'string');
};

Base.prototype.filterByMethodNames = function resolveMethodNames(instancePrototypeEntries) {
  return instancePrototypeEntries.filter((_, idx) => idx !== 0);
};

module.exports = Base;
