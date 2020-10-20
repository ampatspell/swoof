import Property from './property';
import Models from '../models';

export default class ModelsProperty extends Property {

  constructor(path, factory) {
    super();
    this.path = path;
    this.factory = factory;
  }

  defineProperty() {
    Object.defineProperty(this.model, this.key, {
      get: () => this.getValue(),
    });
  }

  get _value() {
    let { model: parent, path, factory } = this;
    return new Models({ parent, opts: { path, factory } });
  }

  bind() {
    super.bind(...arguments);
    this.value = this._value;
    this.defineProperty();
  }

  getValue() {
    return this.value;
  }

  propertyDidChange() {
  }

  startObserving() {
    return () => {};
  }

}
