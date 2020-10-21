import QueryableReference from './queryable';
import { toString, toJSON } from '../../util/util';

export default class ConditionReference extends QueryableReference {

  constructor(store, ref, string) {
    super(store, ref);
    this.string = string;
  }

  //

  get serialized() {
    let { string } = this;
    return { string };
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    return toString(this, `${this.string}`);
  }

}
