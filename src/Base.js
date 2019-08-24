function Base(instances) {
  try {
    const typeofInstances = this.checkTypeOfParam(instances);
    if (typeofInstances !== 'array' && this.checkIfObjectIsEmpty(instances)) {
      throw new Error('No instances passed');
    }
    this.internalHandler = null;
    this.instancesAndMethods =
      typeofInstances !== 'array'
        ? this.setInstanceAndMethodsForOneInstance(instances)
        : this.setInstancesAndMethods(instances);
  } catch (error) {
    return error;
  }
}

Base.prototype.checkTypeOfParam = function resolveTypeOfParam(instances) {
  if (Array.isArray(instances)) {
    return 'array';
  }
  return 'object';
};

Base.prototype.checkIfObjectIsEmpty = function resolveIfObjectIsEmpty(instance) {
  return Object.keys(instance).length === 0 && instance.constructor === Object;
};

Base.prototype.setInstanceAndMethodsForOneInstance = function resolveInstanceAndMethods(instance) {
  const instancePrototype = this.getPrototypesOfInstances(instance);
  const instanceInternalProperties = this.getInternalPropertiesDescriptorOfPrototype(
    instancePrototype
  );
  const descriptorEntries = this.getEntriesOfPrototype(instanceInternalProperties);
  const arrayOfPropertiesNames = this.filterOnlyStrings(descriptorEntries);
  const arrayOfMethodNames = this.filterByMethodNames(arrayOfPropertiesNames);
  const intanceName = instance.constructor.name;
  const setupInstance = {
    [intanceName]: {
      methods: [...arrayOfMethodNames],
      instance
    }
  };

  const setupInstanceAndAttributes = this.getAttributes(instance, setupInstance);
  return setupInstanceAndAttributes;
};

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
        methods: [...filterByMethodNames],
        instance: item
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
  if (!Array.isArray(originalInstance)) {
    const attributesInSingleInstance = 'attributes' in originalInstance;
    try {
      if (attributesInSingleInstance) {
        const { attributes } = originalInstance;
        const instanceName = originalInstance.constructor.name;
        const newSingleInstanceAndMethods = {
          [instanceName]: {
            ...instancesAndMethods[instanceName],
            attributes: [...attributes]
          }
        };
        return newSingleInstanceAndMethods;
      }
      throw new Error('Instances passed has no attributes');
    } catch (error) {
      return error;
    }
  }
  const hasAttributeProperty = originalInstance.every(item => 'attributes' in item);
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

Base.prototype.validateInstance = function resolveInstanceBasedOnString(instanceName) {
  const instancesKeys = Object.keys(this.instancesAndMethods);
  const [namedInstance] = instancesKeys.filter(
    item => item.toLowerCase() === instanceName.toLowerCase()
  );
  return namedInstance;
};

/**
 * Return the data type of the arguments passed to the instance method
 * @param [data] array of data
 * @param {object}
 * @param string
 * @returns string with the data type of the argument passed
 */
Base.prototype.checkDataType = function resolveDataType(data) {
  if (Array.isArray(data)) {
    return 'array';
  }
  return typeof data;
};

/**
 * Return the last item of an array.
 * @param [columns] array of columns values
 * @param [values] array of values
 * @returns [item] the last item of the passed array
 */
Base.prototype.getLastItemOfArray = function resolveLastItem(arr) {
  return arr.filter((_, idx, self) => idx === self.length - 1);
};

module.exports = Base;
