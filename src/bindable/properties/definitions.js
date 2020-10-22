import { assign } from '../../util/util';
import AttributeProperty from './attribute';
import ArrayProperty from './array';
import ModelsProperty from './models';
import TapProperty from './tap';
import LoggerProperty from './logger';

const definition = (factory, opts) => {
  let hash = {
    factory,
    opts: assign({ dependencies: [] }, opts)
  }
  return assign(hash, {
    _isPropertyDefinition: true,
    dependencies: (...keys) => {
      hash.opts.dependencies = [ ...hash.opts.dependencies, ...keys ];
      return hash;
    }
  });
};

export const attribute = value => definition(AttributeProperty, { value });
export const attr = attribute;
export const array = value => definition(ArrayProperty, { value });
export const models = (path, factory) => definition(ModelsProperty, { path, factory });
export const tap = value => definition(TapProperty, { value });
export const logger = callback => definition(LoggerProperty, { callback });
