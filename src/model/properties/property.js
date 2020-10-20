import { toString } from '../../util'

export default class Property {

  constructor() {
    this.properties = null;
  }

  get model() {
    return this.properties.model;
  }

  bind(properties, key) {
    this.properties = properties;
    this.key = key;
  }

  toString() {
    return toString(this, this.key);
  }

}
