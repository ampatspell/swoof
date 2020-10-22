import firebase from "firebase/app";

const {
  assign,
  keys
} = Object;

export const setGlobal = hash => {
  for(let key in hash) {
    window[key] = hash[key];
    console.log(`window.${key} = ${hash[key]}`);
  }
}

export const defineHiddenProperty = (instance, key, value, ...opts) => {
  return Object.defineProperty(instance, key, { value, ...opts });
}

let guid = 0;
const nextGuid = () => `${++guid}`;

export const guidFor = instance => {
  let key = '__swoof_guid';
  let guid = instance[key];
  if(!guid) {
    guid = nextGuid();
    defineHiddenProperty(instance, key, guid);
  }
  return guid;
}

export const __toPrimitive = (prefix, instance) => {
  let name = instance.constructor.name;
  if(prefix) {
    name = `${prefix}:${name}`;
  }
  return `${name}:${guidFor(instance)}`;
}

export const __toString = (prefix, instance, extension) => {
  return `<${__toPrimitive(prefix, instance)}${extension ? `:${extension}` : ''}>`;
}

export const __toJSON = (prefix, instance, props) => {
  return {
    instance: __toPrimitive(prefix, instance),
    ...props
  };
}

export const publicToPrimitive = (...args) => __toPrimitive(null, ...args);
export const publicToString = (...args) => __toString(null, ...args);
export const publicToJSON = (...args) => __toJSON(null, ...args);

export const toPrimitive = (...args) => __toPrimitive('Swoof', ...args);
export const toString = (...args) => __toString('Swoof', ...args);
export const toJSON = (...args) => __toJSON('Swoof', ...args);

const __cache = '__swoof_cache';

export const cached = (instance, name, cb) => {
  let cache = instance[__cache];
  if(!cache) {
    cache = Object.create(null);
    defineHiddenProperty(instance, __cache, cache);
  }
  let value = cache[name];
  if(!value) {
    value = cb();
    cache[name] = value;
  }
  return value;
}

export const deleteCached = (instance, name) => {
  instance[__cache] && delete instance[__cache][name];
}

let dateTimeFormatter = new Intl.DateTimeFormat('default', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  seconds: 'numeric',
  timeZoneName: 'short'
});

let _serverTimestamp;
export const isServerTimestamp = arg => {
  if(!_serverTimestamp) {
    _serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();
  }
  return typeof arg === 'object' && _serverTimestamp.isEqual(arg);
}

export const isTimestamp = arg => arg instanceof firebase.firestore.Timestamp;

export const isFunction = arg => typeof arg === 'function';

export const objectToJSON = value => {
  if(typeof value === 'object') {
    if(value === null) {
      return value;
    } else if(Array.isArray(value)) {
      return value.map(item => objectToJSON(item));
    } else if(value instanceof Date) {
      return {
        type: 'date',
        value: dateTimeFormatter.format(value)
      };
    } else if(isTimestamp(value)) {
      return {
        type: 'timestamp',
        value: dateTimeFormatter.format(value.toDate())
      };
    } else if(isServerTimestamp(value)) {
      return {
        type: 'server-timestamp',
      };
    } else if(isFunction(value.toJSON)) {
      return value.toJSON();
    } else {
      let hash = {};
      Object.getOwnPropertyNames(value).forEach(key => {
        hash[key] = objectToJSON(value[key]);
      });
      return hash;
    }
  }
  return value;
}

export const stringify = (arg, ...remaining) => JSON.stringify(arg, objectToJSON(arg), ...remaining);

export const defer = () => {
  let resolve;
  let reject;
  let promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve,
    reject
  };
}

export const merge = (target, source) => {
  for(let key of keys(source)) {
    if(source[key] instanceof Object) {
      assign(source[key], merge(target[key], source[key]));
    }
  }
  assign(target || {}, source);
  return target;
}

export const get = (object, path) => {
  let components = path.split('.');
  let current = object;
  for(let i = 0; i < components.length; i++) {
    if(current[components[i]] === undefined) {
      return;
    }
    current = current[components[i]];
  }
  return current;
}

export const set = (object, path, value) => {
  let components = path.split('.');
  let key = components.pop();
  let current = object;
  for(let i = 0; i < components.length; i++) {
    if(current[components[i]] === undefined) {
      return;
    }
    current = current[components[i]];
  }
  current[key] = value;
}

export const insertAt = (array, idx, object) => array.splice(idx, 0, object);
export const removeAt = (array, idx) => array.splice(idx, 1);
export const removeObject = (array, object) => {
  let idx = array.indexOf(object);
  if(idx !== -1) {
    removeAt(array, idx);
  }
}

export const join = (strings, ...remaining) => {
  return strings.filter(string => !!string).join(...remaining);
}
