import AttributeProperty from './properties/attribute';
import ArrayProperty from './properties/array';

const {
  assign
} = Object;

const definition = hash => assign(hash, { _isPropertyDefinition: true });

export const attribute = value => {
  return definition({
    factory: AttributeProperty,
    opts: { value },
    value
  });
};

export const attr = attribute;

export const array = value => {
  return definition({
    factory: ArrayProperty,
    opts: { value },
    value
  });
};
