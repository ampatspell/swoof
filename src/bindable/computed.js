import ObservedProperty from './properties/observed';
import ArrayProperty from './properties/array';

export const observed = value => {
  return {
    factory: ObservedProperty,
    opts: { value },
    value
  };
};

export const array = value => {
  return {
    factory: ArrayProperty,
    opts: { value },
    value
  };
};
