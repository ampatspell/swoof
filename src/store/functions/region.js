import { toString, toJSON, defineHiddenProperty } from '../../util/util';

export default class FunctionsRegion {

  constructor(functions, region) {
    defineHiddenProperty(this, 'functions', functions);
    defineHiddenProperty(this, '_region', region);
  }

  get region() {
    return this._region.region;
  }

  get serialized() {
    let { region } = this;
    return {
      region
    };
  }

  async call(name, props) {
    let callable = this._region.httpsCallable(name);
    let result = await callable(props);
    return result;
  }

  toString() {
    return toString(this, `${this.region}`);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}