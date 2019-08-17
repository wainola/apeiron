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
  const instancesSetup = instances.reduce((acc, item) => {
    const thePrototype = this.getPrototypesOfInstances(item);

    const theInternalProperties = this.getInternalPropertiesDescriptorOfPrototype(thePrototype);

    const descriptorEntries = this.getEntriesOfPrototype(theInternalProperties);

    const filteredByPropertiesNames = this.filterOnlyStrings(descriptorEntries);

    const filterByMethodNames = this.filterByMethodNames(filteredByPropertiesNames);

    const instanceName = item.constructor.name;
    return {
      ...acc,
      [instanceName]: {
        methods: [...filterByMethodNames]
      }
    };
  }, {});
  const resolveInstancesAndAttributes = this.getAttributes(instances, instancesSetup);
  return resolveInstancesAndAttributes;
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

Base.prototype.getAttributes = function resolveAttributesByInstances(
  originalInstance,
  instancesAndMethods
) {
  const hasAttributeProperty = originalInstance.every(item => 'attributes' in item);
  // console.log('hasattrs', originalInstance);
  try {
    if (hasAttributeProperty) {
      const attrs = this.getAtrributesFromInstanceCollection(originalInstance);
      const newInstancesAndMethods = this.setupAttributesOnInstancesAndMethodsTree(
        attrs,
        instancesAndMethods
      );
      return newInstancesAndMethods;
    }
    throw new Error('Instances class must have attributes Set');
  } catch (error) {
    return error;
  }
};

Base.prototype.getAtrributesFromInstanceCollection = function resolveAttributesFromInstanceCollection(
  instances
) {
  if (instances.length > 1) {
    return instances.map(item => ({
      instanceName: item.constructor.name,
      attributes: [...item.attributes]
    }));
  }
  const [inst] = instances;
  const { attributes } = inst;
  return [{ instanceName: inst.constructor.name, attributes: [...attributes] }];
};

Base.prototype.setupAttributesOnInstancesAndMethodsTree = function resolveAttributesOnInstancesAndMethodsTree(
  attributes,
  instancesAndMethods
) {
  const newInstancesAndMethods = attributes.reduce((acc, item) => {
    const singleInstanceData = instancesAndMethods[item.instanceName];
    acc = {
      ...acc,
      [item.instanceName]: {
        ...singleInstanceData,
        attributes: [...item.attributes]
      }
    };
    return acc;
  }, {});
  return newInstancesAndMethods;
};

module.exports = Base;
