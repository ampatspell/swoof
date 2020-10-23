import Property from './property';
import { get, set } from '../../util/util';
import { assert } from '../../util/error';

export default class AliasProperty extends Property {

  constructor(binding, key, dependencies, { path, readOnly }) {
    super(binding, key, dependencies);
    console.log(path, readOnly);
    this._path = path;
    this._readOnly = readOnly;
  }

  getTargetValue() {
    return get(this.owner, this._path);
  }

  setTargetValue(value) {
    set(this.owner, this._path, value);
  }

  targetValueDidChange() {
    this.notifyDidChange();
  }

  define() {
    let get = () => this.getTargetValue();

    let set;
    if(this._readOnly) {
      set = value => {
        assert(false, [
          `attempting to set '${value}'`,
          `to read-only alias '${this.key}' for ${this.owner}`
        ].join(' '));
      }
    } else {
      set = value => {
        let current = this.getTargetValue();
        if(value === current) {
          return;
        }
        this.setTargetValue(value);
      }
    }

    Object.defineProperty(this.owner, this.key, { get, set });
  }

  onPropertyDidChange(path) {
    if(!this._path.startsWith(path)) {
      return;
    }
    this.targetValueDidChange();
  }

}
