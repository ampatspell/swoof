import Property from './property';
import { isFunction } from '../../util';

export default class ObservedProperty extends Property {

  constructor(content) {
    super();
    this.content = content;
    this.value = null;
    this._dependencies = [];
    this.observing = false;
    this.subscription = null;
  }

  dependencies(...dependencies) {
    this._dependencies = [ ...this._dependencies, ...dependencies ];
    return this;
  }

  //

  defineProperty() {
    Object.defineProperty(this.model, this.key, {
      get: () => this.getValue(),
      set: value => this.setValue(value)
    });
  }

  get _value() {
    let { content } = this;
    if(isFunction(content)) {
      return content(this.model, this.key);
    }
    return content;
  }

  bind() {
    super.bind(...arguments);
    this.value = this._value;
    this.defineProperty();
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    if(this.value === value) {
      return;
    }
    this.stopObservingValue();
    this.value = value;
    this.maybeStartObservingValue();
  }

  //

  dependencyDidChange() {
    this.stopObservingValue();
    this.value = this._value;
    this.maybeStartObservingValue();
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

  maybeStartObservingValue() {
    let { value } = this;

    if(!this.observing) {
      return;
    }

    if(this.subscription) {
      return;
    }

    if(value && isFunction(value.subscribe)) {
      this.subscription = value.subscribe(() => {
        this.valueDidChange();
      });
    } else {
      this.subscription = () => {};
      this.valueDidChange();
    }
  }

  stopObservingValue() {
    let { subscription } = this;
    if(subscription) {
      this.subscription = null;
      subscription();
    }
  }

  //

  startObserving() {
    this.observing = true;
    this.maybeStartObservingValue();
    return () => {
      this.stopObservingValue();
      this.observing = false;
    };
  }

}
