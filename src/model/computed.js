import { get, set, cached } from '../util';
import Models from './models';

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

export const models = arrayKey => (model, key) => Object.defineProperty(model, key, {
  get: () => {
    return cached(model, key, () => new Models({ parent: model, opts: { source: arrayKey } }));
  }
});
