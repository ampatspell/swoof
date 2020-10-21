import Property from './property';

export default class AttributeProperty extends Property {

  constructor(binding, key, dependencies, { value }) {
    super(binding, key, dependencies);
    this.__value = value;
  }

  get _value() {
    let value = this.__value;
    if(typeof value === 'function') {
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

}
