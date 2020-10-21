import AttributeProperty from './attribute';
import ArrayProperty from './array';
import ModelsProperty from './models';

const {
  assign
} = Object;

const definition = hash => {
  return assign(hash, {
    _isPropertyDefinition: true,
    dependencies: (...keys) => {
      hash.opts.dependencies = [ ...hash.opts.dependencies, ...keys ];
      return hash;
    }
  });
};

export const attribute = value => {
  return definition({
    factory: AttributeProperty,
    opts: {
      value,
      dependencies: []
    },
  });
};

export const attr = attribute;

export const array = value => {
  return definition({
    factory: ArrayProperty,
    opts: {
      value,
      dependencies: []
    }
  });
};

export const models = () => {
  return definition({
    factory: ModelsProperty,
    opts: {
      dependencies: []
    }
  });
}
