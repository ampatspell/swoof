import { defineHiddenProperty } from './util';
import { initializeApp, enablePersistence } from './firebase';
import { getContext, setContext } from 'svelte';
import Store from './store';

const noop = () => {};

class Swoof {

  constructor() {
    this.definitions = Object.create(null);
    defineHiddenProperty(this, '_observing', new Set());
  }

  get observing() {
    return [ ...this._observing ];
  }

  _registerObserving(model) {
    this._observing.add(model);
    return () => this._observing.delete(model);
  }

  //

  _contextIdentifier(identifier) {
    return `swoof:store:${identifier}`;
  }

  configure(name, config, cb=noop) {
    let firebase = initializeApp(config.firebase, name);
    this.definitions[name] = { firebase };
    if(config.firestore && config.firestore.enablePersistence) {
      enablePersistence(firebase).then(() => cb());
    } else {
      Promise.resolve().then(() => cb());
    }
  }

  create(identifier, definition) {
    let opts = this.definitions[definition];
    let swoof = this;
    let store = new Store(Object.assign({ swoof, identifier }, opts));
    setContext(this._contextIdentifier(identifier), store);
    return store;
  }

  store(identifier) {
    return getContext(this._contextIdentifier(identifier));
  }

}

let swoof = new Swoof();

export default swoof;
