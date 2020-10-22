import AttributeProperty from './attribute';
import ArrayProperty from './array';
import ModelsProperty from './models';
import TapProperty from './tap';

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

export const models = (path, factory) => {
  return definition({
    factory: ModelsProperty,
    opts: {
      path,
      factory,
      dependencies: []
    }
  });
}

export const tap = value => {
  return definition({
    factory: TapProperty,
    opts: {
      value,
      dependencies: []
    }
  });
}
