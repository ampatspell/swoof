import Property from './property';
import { get, set } from '../../util/util';
import { assert } from '../../util/error';

const LAZY = { __lazy: true };

const normalizeDependencies = (dependencies, path) => {
  return [ ...dependencies, path ];
}

export default class AliasProperty extends Property {

  constructor(binding, key, dependencies, { path, readOnly }) {
    super(binding, key, normalizeDependencies(dependencies, path));
    this.path = path;
    this.readOnly = readOnly;
    this._value = LAZY;
  }

  valueDidChange(key) {
    this._value = LAZY;
    this.notifyDidChange(key);
  }

  get value() {
    let value = this._value;
    if(value === LAZY) {
      value = get(this.owner, this.path);
      this._value = value;
    }
    return value;
  }

  set value(value) {
    this._value = LAZY;
    set(this.owner, this.path, value);
  }

  define() {
    let get = () => this.value;

    let set;
    if(this.readOnly) {
      set = value => {
        assert(false, [
          `attempting to set '${value}'`,
          `to read-only alias '${this.key}' for ${this.owner}`
        ].join(' '));
      }
    } else {
      set = value => {
        this.value = value;
      }
    }

    Object.defineProperty(this.owner, this.key, { get, set });
  }

  onPropertyDidChange(path) {
    let dependency = this.dependencies.find(dependency => path.startsWith(dependency));
    if(!dependency) {
      return;
    }
    let key = path.substr(this.path.length + 1);
    this.valueDidChange(key);
  }

}
