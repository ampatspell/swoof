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
  let key = '__guid';
  let guid = instance[key];
  if(!guid) {
    guid = nextGuid();
    defineHiddenProperty(instance, key, guid);
  }
  return guid;
}

export const toString = (instance, extension) => {
  return `<${instance.constructor.name}:${guidFor(instance)}${extension ? `:${extension}` : ''}>`;
}

export const toJSON = (instance, props) => {
  return {
    instance: `${instance.constructor.name}:${guidFor(instance)}`,
    ...props
  };
}

const __cache = '__cache';

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
