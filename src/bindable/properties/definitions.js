import AttributeProperty from './attribute';
import ArrayProperty from './array';
import ModelsProperty from './models';
import TapProperty from './tap';
import LoggerProperty from './logger';

const {
  assign
} = Object;

const definition = hash => {
  hash.opts = assign({ dependencies: [] }, hash.opts);
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
      value
    },
  });
};

export const attr = attribute;

export const array = value => {
  return definition({
    factory: ArrayProperty,
    opts: {
      value
    }
  });
};

export const models = (path, factory) => {
  return definition({
    factory: ModelsProperty,
    opts: {
      path,
      factory
    }
  });
}

export const tap = value => {
  return definition({
    factory: TapProperty,
    opts: {
      value
    }
  });
}

export const logger = callback => {
  return definition({
    factory: LoggerProperty,
    opts: {
      callback
    }
  });
}
