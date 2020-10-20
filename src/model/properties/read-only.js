import Property from './property';
import { get } from '../../util';

export default class ReadOnlyProperty extends Property {

  constructor(path) {
    super();
    this.path = path;
  }

  defineProperty() {
    Object.defineProperty(this.model, this.key, {
      get: () => this.getValue(),
    });
  }

  bind() {
    super.bind(...arguments);
    this.defineProperty();
  }

  getValue() {
    return get(this.model, this.path);
  }

  propertyDidChange() {
  }

  startObserving() {
    return () => {};
  }

}
