import Reference from './reference';
import { documentNotFoundError } from '../../error';

const {
  assign
} = Object;

export default class QueryableReference extends Reference {

  _conditionParameters(name, args) {
    let ref = this.ref[name].call(this.ref, ...args);
    let normalized = args.map(arg => {
      if(Array.isArray(arg)) {
        return `[ ${arg.join(', ')} ]`;
      }
      return arg;
    })
    let string = `${this.string}.${name}(${normalized.join(', ')})`;
    return {
      ref,
      string
    };
  }

  _condition(name, args) {
    let { ref, string } = this._conditionParameters(name, args);
    return this.store._createConditionReference(ref, string);
  }

  where(...args) {
    return this._condition('where', args);
  }

  orderBy(...args) {
    return this._condition('orderBy', args);
  }

  limit(...args) {
    return this._condition('limit', args);
  }

  limitToLast(...args) {
    return this._condition('limitToLast', args);
  }

  startAt(...args) {
    return this._condition('startAt', args);
  }

  startAfter(...args) {
    return this._condition('startAfter', args);
  }

  endAt(...args) {
    return this._condition('endAt', args);
  }

  endBefore(...args) {
    return this._condition('endBefore', args);
  }

  //

  query(opts) {
    return this.store._createQuery(this, opts);
  }

  async load() {
    let snapshot = await this.ref.get();
    return snapshot.docs.map(doc => this.store._createDocumentForSnapshot(doc));
  }

  async first(opts) {
    let { optional } = assign({ optional: false }, opts);
    let snapshot = await this.ref.get();
    let doc = snapshot.docs[0];
    if(doc) {
      return this.store._createDocumentForSnapshot(doc);
    }
    if(!optional) {
      throw documentNotFoundError();
    }
  }

}
