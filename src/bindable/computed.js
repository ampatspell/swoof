import AttributeProperty from './properties/attribute';
import ArrayProperty from './properties/array';

export const attribute = value => {
  return {
    factory: AttributeProperty,
    opts: { value },
    value
  };
};

export const attr = attribute;

export const array = value => {
  return {
    factory: ArrayProperty,
    opts: { value },
    value
  };
};
