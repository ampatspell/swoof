import { get, set } from '../util';

export const observed = value => (model, key) => {
  Object.defineProperty(model, key, {
    get() {
      return model._getValueForObservedKey(key);
    },
    set(value) {
      model._setValueForObservedKey(key, value);
    }
  });
  model[key] = value;
}

export const readOnly = path => (model, key) => Object.defineProperty(model, key, {
  get: () => get(model, path)
});

export const alias = path => (model, key) => Object.defineProperty(model, key, {
  get: () => get(model, path),
  set: value => set(model, path, value)
});
