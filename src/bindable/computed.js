import ObservedProperty from './properties/observed';

export const observed = value => {
  return {
    factory: ObservedProperty,
    opts: { value },
    value
  };
};
