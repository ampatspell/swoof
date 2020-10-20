import Property from './property';
import Models from '../models';

export default class ModelsProperty extends Property {

  constructor(path, factory) {
    super();
    this.path = path;
    this.factory = factory;
    this._dependencies = [];
  }

  dependencies(...dependencies) {
    this._dependencies = [ ...this._dependencies, ...dependencies ];
    return this;
  }

  //

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

  dependencyDidChange() {
    console.log('mdoels dependency did change');
  }

  propertyDidChange(property) {
    let { key } = property;
    if(this._dependencies.includes(key)) {
      this.dependencyDidChange();
    }
  }

  valueDidChange() {
    console.log('models did change');
  }

  //

  maybeStartObservingValue() {
    let { value } = this;

    if(!this.observing) {
      return;
    }

    if(this.subscription) {
      return;
    }

    this.subscription = value.subscribe(() => {
      this.valueDidChange();
    });
  }

  stopObservingValue() {
    let { subscription } = this;
    if(subscription) {
      this.subscription = null;
      subscription();
    }
  }

  startObserving() {
    this.observing = true;
    this.maybeStartObservingValue();
    return () => {
      this.stopObservingValue();
      this.observing = false;
    };
  }

}
