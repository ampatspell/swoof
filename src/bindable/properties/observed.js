import Property from './property';

export default class ObservedProperty extends Property {

  constructor(binding, key, { value }) {
    super(binding, key);
    this.value = value;
  }

  define(value) {
    let { owner, key } = this;

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

    return value;
  }

}
