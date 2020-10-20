import ObservedProperty from './properties/observed';
import ReadOnlyProperty from './properties/read-only';
import AliasProperty from './properties/alias';
import ModelsProperty from './properties/models';

export const observed = content => new ObservedProperty(content);
export const readOnly = path => new ReadOnlyProperty(path);
export const alias = path => new AliasProperty(path);
export const models = (path, factory) => new ModelsProperty(path, factory);
