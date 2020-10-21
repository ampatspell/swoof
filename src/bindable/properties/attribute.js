import Property from './property';
import { isFunction } from '../../util/util';

export default class AttributeProperty extends Property {

  constructor(binding, key, dependencies, { value }) {
    super(binding, key, dependencies);
    this.__value = value;
    this._isFunction = isFunction(value);
  }

  get _value() {
    let value = this.__value;
    if(this._isFunction) {
      let { owner, key } = this;
      value = value.call(owner, owner, key);
    }
    return value;
  }

  define() {
    let { owner, key } = this;

    let value = this._value;
    this.value = value;
    this.registerNested(value);

    Object.defineProperty(owner, key, {
      get: () => {
        return this.value;
      },
      set: value => {
        let current = this.value;
        if(value === current) {
          return;
        }

        this.unregisterNested(current);
        this.value = value;
        this.registerNested(value);

        this.notifyDidChange();
      }
    });
  }

  onDependencyDidChange() {
    if(!this._isFunction) {
      return;
    }
    this.owner[this.key] = this._value;
  }

}
