/**
 * QueryBuilderProxy
 * This Class intercep get property access, determines if a method is related with some database operation and
 * construct the query around that.
 */

function QueryBuilderProxy(instances = null) {
  console.log('instance', instances);
  if (!instances) {
    // console.log('NO PUEDE ENTRAR ACA');
    this.instance = null;
    this.internalHandler = null;
    this.instancesAndMethods = null;
    this.attributes = null;
    this.queryDictionary = null;
    return;
  }
  this.instances = instances;
  this.internalHandler = null;
  this.instancesAndMethods = this.setInstancesAndMethods(instances);
  this.attributes = this.getAttributes(this.instances);
  this.queryDictionary = this.setQueryActions(this.instancesAndMethods);
  this.setInternalHandler = this.setInternalHandler.bind(this);
}

/**
 * Expect an array of instances
 */
QueryBuilderProxy.prototype.setInstance = function resolveInstanceSetup(instances) {
  try {
    if (!instances.length) {
      throw new Error('No instances passed');
    }

    this.instances = instances;
    this.internalHandler = null;
    this.instancesAndMethods = this.setInstancesAndMethods(instances);
    this.attributes = this.getAttributes(this.instances);
    this.queryDictionary = this.setQueryActions(this.instancesAndMethods);
    this.setInternalHandler = this.setInternalHandler.bind(this);
  } catch (error) {
    return error;
  }
};

/**
 * Return a handler object with a get trap to intersect the property accesor of an instance
 */
QueryBuilderProxy.prototype.setInternalHandler = function setupInternalHandler() {
  const { queryDictionary, generateQuery, instancesAndMethods, attributes } = this;
  // console.log('queryDic', queryDictionary, instancesAndMethods, attributes);
  const self = this;

  const internalHandlerObject = {
    get(target, propName) {
      /**
       * This function receives the method arguments of the proxied instance.
       */
      return function internalCallForProxiedInstance(...args) {
        if (typeof propName !== 'string') {
          return;
        }
        console.log('calledMethod', propName);
        const [calledMethod] = queryDictionary.filter(item => item.methodOriginalName === propName);
        const { action } = calledMethod;

        const instancesName = instancesAndMethods
          .map(item => item.instanceName)
          .filter(item => item === target.constructor.name);

        // console.log('instance', attributes);
        const [attributesToPass] = attributes
          .filter(item => item.instanceName === instancesName[0])
          .map(item => item.attributes);

        let getQuery;
        switch (action) {
          case 'insert':
            getQuery = generateQuery.call(self, [
              calledMethod,
              args,
              instancesName,
              attributesToPass
            ]);
            return target[propName](getQuery);
          case 'update':
            getQuery = generateQuery.call(self, [
              calledMethod,
              args,
              instancesName,
              attributesToPass
            ]);
            return target[propName](getQuery);
          case 'delete':
            getQuery = generateQuery.call(self, [calledMethod, args, instancesName]);
            // console.log('getQuery:', getQuery);
            return target[propName](getQuery);
          case 'get':
            getQuery = generateQuery.call(self, [calledMethod, args, instancesName]);
            return target[propName](getQuery);
          default:
            return null;
        }
      };
    }
  };
  this.internalHandler = internalHandlerObject;
  return this.internalHandler;
};

/**
 * Returns a Proxy of the instance passed
 */
QueryBuilderProxy.prototype.setProxy = function setProxyToInstance(target) {
  const yy = new Proxy(target, this.setInternalHandler());
  return new Proxy(target, this.setInternalHandler());
};

QueryBuilderProxy.prototype.getQueryDictionary = function resolveQueryDictionary() {
  return this.queryDictionary;
};

/**
 * Return the prototype of an instance
 */
QueryBuilderProxy.prototype.getPrototypesOfInstances = function resolvePrototypeOfInstances(
  instance
) {
  return Reflect.getPrototypeOf(instance);
};

/**
 * Returns the property descriptor of the instances prototype.
 */
QueryBuilderProxy.prototype.getInternalPropertiesDescriptorOfPrototype = function resolveInternalProperties(
  instancePrototype
) {
  return Object.getOwnPropertyDescriptors(instancePrototype);
};

/**
 * Returns the entries (keys, values) on the prototype of the instance
 */
QueryBuilderProxy.prototype.getEntriesOfPrototype = function resolveEntriesOfPrototype(
  instancePrototype
) {
  return Object.entries(instancePrototype).reduce((acc, item) => {
    acc.push(...item);
    return acc;
  }, []);
};

/**
 * Returns only the names of the methods of the instance
 */
QueryBuilderProxy.prototype.filterOnlyStrings = function resolveStringsMethod(
  instancePrototypeEntries
) {
  return instancePrototypeEntries.filter(item => typeof item === 'string');
};

/**
 * Return the methods of the instance
 */
QueryBuilderProxy.prototype.filterByMethodNames = function resolveMethodNames(
  instancePrototypeEntries
) {
  return instancePrototypeEntries.filter((_, idx) => idx !== 0);
};

/**
 * Returns an object that setup the instance name and the methods names.
 */
QueryBuilderProxy.prototype.setInstancesAndMethods = function setupInstancesAndMethodsToAnObject(
  instances
) {
  const instancesNamesAndMethods = instances.map(item => {
    const thePrototype = this.getPrototypesOfInstances(item);
    const theInternalProperties = this.getInternalPropertiesDescriptorOfPrototype(thePrototype);
    const descriptorEntries = this.getEntriesOfPrototype(theInternalProperties);
    const filteredByPropertiesNames = this.filterOnlyStrings(descriptorEntries);
    const filterByMethodNames = this.filterByMethodNames(filteredByPropertiesNames);
    return { instanceName: item.constructor.name, methods: [...filterByMethodNames] };
  });

  return instancesNamesAndMethods;
};

/**
 * Return instances and methods of the target instance passed on the Proxy
 */
QueryBuilderProxy.prototype.getInstancesAndMethods = function resolveInstancesAndMethods() {
  return this.instancesAndMethods;
};

/**
 * Returns the query actions sorted.
 * The expected query action order is: [insert, update, delete, get]
 */
QueryBuilderProxy.prototype.setQueryActions = function setupQueryActions(instancesNameAndMethods) {
  // TODO => RESOLVE FOR VARIOUS INSTANCES (ARRAY OF INSTANCES)
  if (!instancesNameAndMethods.length > 1) {
    const methods = instancesNameAndMethods.map(item => item.methods)[0];
    const prefixedMethods = this.getPrefixedOnMethods(methods);
    // console.log('getPrefixedMethods', prefixedMethods);
    const sortedQueryActions = this.sortMethodsNames(prefixedMethods);
    return sortedQueryActions;
  }

  const methods = instancesNameAndMethods.map(item => item.methods);
  const prefixedMethods = this.getPrefixedOnMethods(methods);
  return prefixedMethods;
};

/**
 * Return the methods names sorted by the expeted order of the query actions
 */
QueryBuilderProxy.prototype.sortMethodsNames = function resolveSortedMethods(methods) {
  const expectedOrder = ['insert', 'update', 'delete', 'get'];
  const sortedMethods = methods.sort((a, b) => {
    const idxA = expectedOrder.indexOf(a.action);
    const idxB = expectedOrder.indexOf(b.action);
    if (idxA < idxB) return -1;
    if (idxA > idxB) return 1;
    return 0;
  });
  return sortedMethods;
};

/**
 * Return the methods striped by postfix name.
 */
QueryBuilderProxy.prototype.getPrefixedOnMethods = function resolvePrefixOnMethodNames(methods) {
  const queryMapping = ['insert', 'update', 'delete', 'get'];
  // console.log('methods:::::::', methods);
  if (!methods.length > 1) {
    return methods.reduce((acc, item) => {
      let r;
      if (item.includes('insert')) {
        r = queryMapping.indexOf('insert');
        acc.push({ action: queryMapping[r], whereClause: false, methodOriginalName: item });
      }
      if (item.includes('update')) {
        r = queryMapping.indexOf('update');
        acc.push({ action: queryMapping[r], whereClause: true, methodOriginalName: item });
      }
      if (item.includes('delete')) {
        r = queryMapping.indexOf('delete');
        acc.push({ action: queryMapping[r], whereClause: true, methodOriginalName: item });
      }
      if (item.includes('get')) {
        r = queryMapping.indexOf('get');
        acc.push({ action: queryMapping[r], whereClause: true, methodOriginalName: item });
      }

      return acc;
    }, []);
  }

  const matrix = [];
  for (let i = 0; i < methods.length; i++) {
    for (let j = 0; j < methods[i].length; j++) {
      let r;
      if (methods[i][j].includes('insert')) {
        r = queryMapping.indexOf('insert');
        matrix.push({
          action: queryMapping[r],
          whereClause: false,
          methodOriginalName: methods[i][j]
        });
      } else if (methods[i][j].includes('update')) {
        r = queryMapping.indexOf('update');
        matrix.push({
          action: queryMapping[r],
          whereClause: true,
          methodOriginalName: methods[i][j]
        });
      } else if (methods[i][j].includes('delete')) {
        r = queryMapping.indexOf('delete');
        matrix.push({
          action: queryMapping[r],
          whereClause: true,
          methodOriginalName: methods[i][j]
        });
      } else if (methods[i][j].includes('get')) {
        r = queryMapping.indexOf('get');
        matrix.push({
          action: queryMapping[r],
          whereClause: true,
          methodOriginalName: methods[i][j]
        });
      }
    }
  }

  return matrix;
};

/**
 * Returns the query to use on the database instance
 * @param string typeOfQuery => insert, update, delete, get
 * @param dataToInsert => Array or Object
 * @param [instanceName]
 * @param [attributes]
 */
QueryBuilderProxy.prototype.generateQuery = function resolveQuery([
  typeOfQuery,
  dataToInsert,
  instanceName,
  attributes = []
]) {
  // console.log('typeOfQuery', attributes);
  const [dataPassed] = dataToInsert;
  const dataKeys = Object.keys(dataPassed);
  const attributesQuery = this.buildAttributesQuery(attributes, dataKeys);
  console.log('attributes', attributesQuery, dataKeys);
  const parentAttributes = `(${attributesQuery})`;
  const { action } = typeOfQuery;
  const [tableName] = instanceName;
  let data;
  let id;

  let processedDataToInsert;
  if (action !== 'delete') {
    [data, id] = dataToInsert;
    processedDataToInsert = this.processDataByInspection(data);
  } else {
    [id] = dataToInsert;
  }

  let query;
  switch (action) {
    case 'insert':
      query = `INSERT INTO ${tableName} ${parentAttributes} VALUES (${processedDataToInsert}) RETURNING *;`;
      return query;
    case 'update':
      const setColumnsSentences = this.generateColumnsSentences(data);
      query = `UPDATE ${tableName} ${setColumnsSentences} WHERE id = '${id}';`;
      return query;
    case 'delete':
      query = `DELETE FROM ${tableName} WHERE id = '${id}';`;
      // console.log('QUERY', query);
      return query;
    case 'get':
      const selectColumnsSentences = this.generateColumnsSentences(data);
      query = `${selectColumnsSentences} FROM ${tableName} WHERE id = '${id}';`;
      return query;
    default:
      null;
  }
  return null;
};

/**
 * Return the attributes of the instances passed on the proxy
 * @param {Object} originalInstance
 * @returns [attributesName] array of the names of the attributes inside the instance
 */
QueryBuilderProxy.prototype.getAttributes = function resolveAttributesByInstances(
  originalInstance
) {
  const hasAttributeProperty = originalInstance.every(item => 'attributes' in item);
  // console.log('hasattrs', originalInstance);
  if (hasAttributeProperty) {
    const attrs = this.getAtrributesFromInstanceCollection(originalInstance);
    return attrs;
  }
  return null;
};

/**
 * Return a string with the part of the query related to the attributes describe to pass on a DDL sentence
 */
QueryBuilderProxy.prototype.buildAttributesQuery = function resolveAttributesString(
  attributes,
  keysOfDataPassed
) {
  // console.log('attrs and keys::', attributes, keysOfDataPassed);
  const attributesFiltered = attributes.reduce((acc, item) => {
    const index = keysOfDataPassed.indexOf(item);
    const elem = keysOfDataPassed[index];
    if (elem === item) {
      acc.push(elem);
    }
    return acc;
  }, []);

  // console.log('ATRS:', attributesFiltered);
  return this.generateListForQuery(attributesFiltered, 'columns');
};

/**
 * Returns the List of values for a query corresponding to the values that one should pass on a DDL sentence.
 * It checks the data type of the data.
 * It can receive a Object, Array or a String.
 * TODO: should return a error if passed the wrong type of argument
 * @param [data]
 * @param {data}
 * return string string in the form of 'something', 'somewhere', ...
 */
QueryBuilderProxy.prototype.processDataByInspection = function resolveData(data) {
  // console.log('DATA BY INSPECTION', data);
  const dataType = this.checkDataType(data);
  if (dataType !== 'object') {
    return this.generateListForQuery(data, 'values');
  }
  const objValues = Object.values(data);
  return this.generateListForQuery(objValues, 'values');
};

/**
 * Return the data type of the arguments passed to the instance method
 * @param [data] array of data
 * @param {object}
 * @param string
 * @returns string with the data type of the argument passed
 */
QueryBuilderProxy.prototype.checkDataType = function resolveDataType(data) {
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
QueryBuilderProxy.prototype.getLastItemOfArray = function resolveLastItem(arr) {
  console.log('arr:', arr);
  return arr.filter((_, idx, self) => idx === self.length - 1);
};

/**
 * Return the list of values to user in que DML sentence
 * @param [columns] Array of columns names
 * @param [values] Array of values names
 * @param string context Either VALUES or COLUMNS
 * @returns string String with columns names or the values names
 * EX:
 * If we have the following insertion statement
 * INSERT INTO TABLE (COLUMN1, COLUMN2, COLUMN3) VALUES (VALUE1, VALUE2, VALUE3)
 * This methods returns the (COLUMN1, COLUMN2, COLUMN3) part if the context value is COLUMNS
 * or returns the (VALUE1, VALUE2, VALUE3) part if the context value is VALUES
 *
 * TODO: check the string construction if passed a number or other datatype that is not a string
 */
QueryBuilderProxy.prototype.generateListForQuery = function resolveListQuery(data, context) {
  // console.log('data, context', data, context);
  const [lastItem] = this.getLastItemOfArray(data);
  return data.reduce((acc, item) => {
    if (item === lastItem) {
      acc += context !== 'values' ? `${item}` : `'${item}'`;
      return acc;
    }
    acc += context !== 'values' ? `${item}, ` : `'${item}', `;
    return acc;
  }, '');
};

QueryBuilderProxy.prototype.generateColumnsSentences = function resolveSetColumnsSentences(
  dataToInsert
) {
  const typeOfData = this.checkDataType(dataToInsert);
  if (typeOfData !== 'array') {
    const foldedEntries = Object.entries(dataToInsert);
    const lastItemStringify = JSON.stringify(this.getLastItemOfArray(foldedEntries)[0]);
    return foldedEntries.reduce((acc, item) => {
      const itemStringified = JSON.stringify(item);
      if (itemStringified !== lastItemStringify) {
        // console.log(item);
        acc += `${item[0]}='${item[1]}', `;
        return acc;
      }

      acc += `${item[0]}='${item[1]}'`;
      return acc;
    }, 'SET ');
  }

  const [lastItem] = this.getLastItemOfArray(dataToInsert);
  return dataToInsert.reduce((acc, item) => {
    if (item !== lastItem) {
      acc += `${item}, `;
      return acc;
    }

    acc += `${item}`;
    return acc;
  }, 'SELECT ');
};

QueryBuilderProxy.prototype.getAtrributesFromInstanceCollection = function resolveAttributesFromInstanceCollection(
  instances
) {
  // console.log('INST', instances[0]);
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

module.exports = QueryBuilderProxy;
