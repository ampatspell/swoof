import { initializeApp, enablePersistence } from './firebase';
import { getContext, setContext } from 'svelte';
import Store from './store';

const noop = () => {};

class Stores {

  constructor() {
    this.definitions = Object.create(null);
  }

  _contextIdentifier(identifier) {
    return `swoof:store:${identifier}`;
  }

  configure(name, config, cb=noop) {
    let firebase = initializeApp(config.firebase);
    this.definitions[name] = { firebase };
    if(config.firestore && config.firestore.enablePersistence) {
      enablePersistence(firebase).then(() => cb());
    } else {
      Promise.resolve().then(() => cb());
    }
  }

  create(identifier, definition) {
    let opts = this.definitions[definition];
    let store = new Store(Object.assign({ identifier }, opts));
    setContext(this._contextIdentifier(identifier), store);
    return store;
  }

  get(identifier) {
    return getContext(this._contextIdentifier(identifier));
  }

}

let stores = new Stores();

export default stores;
