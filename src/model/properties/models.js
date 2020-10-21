import Property from './property';
import Models from '../models';
import Subscriptions from '../../subscriptions';

export default class ModelsProperty extends Property {

  constructor(path, factory) {
    super();
    this.path = path;
    this.factory = factory;
    this._dependencies = [];
    this._subscriptions = new Subscriptions(this, {
      onStart: () => this.onStart(),
      onStop: () => this.onStop()
    });
  }

  dependencies(...dependencies) {
    this._dependencies = [ ...this._dependencies, ...dependencies ];
    return this;
  }

  //

  defineProperty() {
    Object.defineProperty(this.model, this.key, {
      get: () => this.getValue()
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
    console.log('models dependency did change');
  }

  propertyDidChange(property) {
    let { key } = property;
    if(this._dependencies.includes(key)) {
      this.dependencyDidChange();
    }
  }

  valueDidChange() {
    this.properties.propertyValueDidChange(this);
  }

  //

  maybeStartObservingValue() {
    let { value } = this;

    if(this.subscription) {
      return;
    }

    this.subscription = value.subscribe(() => {
      this.valueDidChange();
    });
  }

  onStart() {
    this.maybeStartObservingValue();
  }

  onStop() {
    console.log('models stop');
    let { subscription } = this;
    if(subscription) {
      this.subscription = null;
      subscription();
    }
  }

  subscribe(...args) {
    return this._subscriptions.subscribe(...args);
  }

}
