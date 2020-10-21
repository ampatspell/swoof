import { defineHiddenProperty, removeObject } from './util';
import { initializeApp, enablePersistence } from './store/firebase';
import { getContext, setContext } from 'svelte';
import Store from './store/store';

const noop = () => {};

class Swoof {

  constructor() {
    this.definitions = Object.create(null);
    defineHiddenProperty(this, '_observing', []);
  }

  get observing() {
    return this._observing.map(hash => hash.model);
  }

  _registerObserving(model) {
    let existing = this._observing.find(hash => hash.model === model);
    if(!existing) {
      existing = {
        model,
        count: 0
      };
      this._observing.push(existing);
    };
    existing.count++;
    return () => {
      let existing = this._observing.find(hash => hash.model === model);
      existing.count--;
      if(existing.count === 0) {
        removeObject(this._observing, existing);
      }
    };
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
