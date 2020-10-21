import { defineHiddenProperty } from '../../util/util';

export default class Reference {

  constructor(store, ref) {
    defineHiddenProperty(this, 'store', store);
    defineHiddenProperty(this, 'ref', ref);
  }

}
