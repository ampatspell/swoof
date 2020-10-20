import Property from './property';
import { get, set } from '../../util';

export default class AliasProperty extends Property {

  constructor(path) {
    super();
    this.path = path;
  }

  defineProperty() {
    Object.defineProperty(this.model, this.key, {
      get: () => this.getValue(),
      set: value => this.setValue(value)
    });
  }

  bind() {
    super.bind(...arguments);
    this.defineProperty();
  }

  getValue() {
    return get(this.model, this.path);
  }

  setValue(value) {
    set(this.model, this.path, value);
  }

  propertyDidChange() {
  }

  startObserving() {
    return () => {};
  }

}
