const Base = require('./Base');
/**
 * QueryBuilderProxy
 * This Class intercep get property access, determines if a method is related with some database operation and
 * construct the query around that.
 */

function QueryBuilderProxy(instances = null) {
  Base.call(this, instances);
  this.internalHandler = null;
}

QueryBuilderProxy.prototype = Object.create(Base.prototype);

/**
 * Return a handler object with a get trap to intersect the property accesor of an instance
 */
QueryBuilderProxy.prototype.setInternalHandler = function setupInternalHandler() {
  const { instancesAndMethods, generateQuery } = this;
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
        const {
          constructor: { name }
        } = target;
        const targetInstanceData = instancesAndMethods[name];
        const { attributes } = targetInstanceData;

        let getQuery;
        switch (propName) {
          case 'insert':
            getQuery = generateQuery.call(self, [propName, args, name, attributes]);
            return target[propName](getQuery);
          case 'update':
            getQuery = generateQuery.call(self, [propName, args, name, attributes]);
            return target[propName](getQuery);
          case 'delete':
            getQuery = generateQuery.call(self, [propName, args, name]);
            // console.log('getQuery:', getQuery);
            return target[propName](getQuery);
          case 'get':
            getQuery = generateQuery.call(self, [propName, args, name]);
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
QueryBuilderProxy.prototype.setProxy = function setProxyToInstance(instanceName) {
  const validateInstanceParam = this.validateInstance(instanceName);
  const { instance } = this.instancesAndMethods[validateInstanceParam];
  return new Proxy(instance, this.setInternalHandler());
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
  // console.log('attributes', attributesQuery, dataKeys);
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
 * Return a string with the part of the query related to the attributes describe to pass on a DDL sentence
 */
QueryBuilderProxy.prototype.buildAttributesQuery = function resolveAttributesString(
  attributes,
  keysOfDataPassed
) {
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
    acc += this.stringGeneratorBasedOnType(context, item, lastItem);
    return acc;
  }, '');
};

QueryBuilderProxy.prototype.stringGeneratorBasedOnType = function resolveStringGenerator(
  context,
  item,
  isLastItem
) {
  const itemType = typeof item;
  switch (itemType) {
    case 'string':
      if (item === isLastItem) {
        return context !== 'values' ? `${item}` : `'${item}`;
      }
      return context !== 'values' ? `${item}, ` : `'${item}', `;
    case 'number':
      if (item === isLastItem) {
        return context !== 'values' ? `${item}` : `${item}`;
      }
      return context !== 'values' ? `${item}, ` : `${item}, `;
    default:
      return null;
  }
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
  const [dataPassed] = dataToInsert;
  const dataKeys = Object.keys(dataPassed);
  const attributesQuery = this.buildAttributesQuery(attributes, dataKeys);
  const parentAttributes = `(${attributesQuery})`;
  let data;
  let id;

  let processedDataToInsert;
  if (typeOfQuery !== 'delete') {
    [data, id] = dataToInsert;
    processedDataToInsert = this.processDataByInspection(data);
  } else {
    [id] = dataToInsert;
  }

  let query;
  switch (typeOfQuery) {
    case 'insert':
      query = `INSERT INTO ${instanceName} ${parentAttributes} VALUES (${processedDataToInsert}) RETURNING *;`;
      return query;
    case 'update':
      const setColumnsSentences = this.generateColumnsSentences(data);
      query = `UPDATE ${instanceName} ${setColumnsSentences} WHERE id = '${id}';`;
      return query;
    case 'delete':
      query = `DELETE FROM ${instanceName} WHERE id = '${id}';`;
      // console.log('QUERY', query);
      return query;
    case 'get':
      const selectColumnsSentences = this.generateColumnsSentences(data);
      query = `${selectColumnsSentences} FROM ${instanceName} WHERE id = '${id}';`;
      return query;
    default:
      null;
  }
  return null;
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
      acc += this.stringGeneratorForSetColumns(item, lastItemStringify, itemStringified);
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

QueryBuilderProxy.prototype.stringGeneratorForSetColumns = function resolveStringForSetColumns(
  item,
  lastItem,
  currentItemStringified
) {
  const itemToUpdateType = typeof item[1];
  switch (itemToUpdateType) {
    case 'string':
      if (lastItem !== currentItemStringified) {
        return `${item[0]}='${item[1]}', `;
      }
      return `${item[0]}='${item[1]}'`;
    case 'number':
      if (lastItem !== currentItemStringified) {
        return `${item[0]}=${item[1]}, `;
      }
      return `${item[0]}=${item[1]}`;
    default:
      return null;
  }
};

module.exports = QueryBuilderProxy;
