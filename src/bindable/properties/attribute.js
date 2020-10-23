import Property from './property';
import { isFunction } from '../../util/util';
import { assert } from '../../util/error';

const LAZY = { __lazy: true };

export default class AttributeProperty extends Property {

  constructor(binding, key, dependencies, { readOnly, value }) {
    super(binding, key, dependencies);
    this.readOnly = readOnly;
    this.__value = value;
    this.isFunction = isFunction(value);
    if(this.isFunction) {
      this.value = LAZY;
    }
  }

  get _value() {
    let value = this.__value;
    if(this.isFunction) {
      let { owner, key } = this;
      value = value.call(owner, owner, key);
    }
    return value;
  }

  _instantiateValue() {
    let value = this._value;
    this.value = value;
    this.registerNested(value);
  }

  define() {
    let { owner, key } = this;

    if(!this.isFunction) {
      this._instantiateValue();
    }

    let get = () => {
      if(this.value === LAZY) {
        this._instantiateValue();
      }
      return this.value;
    };

    let set;
    if(this.readOnly) {
      set = value => {
        assert(false, [
          `attempting to set '${value}'`,
          `to read-only attribute '${this.key}' for ${this.owner}`
        ].join(' '));
      }
    } else {
      set = value => {
        let current = this.value;
        if(value === current) {
          return;
        }

        this.unregisterNested(current);
        this.value = value;
        this.registerNested(value);

        this.notifyDidChange();
      }
    }

    Object.defineProperty(owner, key, { get, set });
  }

  onDependencyDidChange() {
    if(!this.isFunction) {
      return;
    }
    this.owner[this.key] = this._value;
  }

}
