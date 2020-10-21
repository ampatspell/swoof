import { toString } from '../util';

export default class Properties {

  constructor(model) {
    this.model = model;
    this.propertiesByKey = Object.create(null);
    this.properties = [];
    this._notifyDidChangeSuspended = 0;
  }

  define(key, property) {
    property.bind(this, key);
    this.propertiesByKey[key] = property;
    this.properties.push(property);
    return this.model;
  }

  subscribe() {
    let properties = this.properties.map(property => property.subscribe(() => {}));
    return () => {
      properties.forEach(unsubscribe => unsubscribe());
    };
  }

  withNotifyDidChangeSuspended(cb) {
    this._notifyDidChangeSuspended++;
    try {
      cb();
    } finally {
      this._notifyDidChangeSuspended--;
    }
  }

  propertyValueDidChange(_property) {
    this.withNotifyDidChangeSuspended(() => {
      this.properties.forEach(property => {
        if(_property !== property) {
          property.propertyDidChange(_property);
        }
      });
    });
    this.model._notifyDidChange();
  }

  toString() {
    return toString(this, this.model+'');
  }

}
