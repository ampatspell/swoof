import { initializeApp, destroyApp, enablePersistence } from './store/firebase';
import { getContext, setContext } from 'svelte';
import Store from './store/store';

const noop = () => {};

class Swoof {

  constructor() {
    this.definitions = Object.create(null);
  }

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

  destroy() {
    let { definitions } = this;
    for(let key in definitions) {
      let { firebase } = definitions[key];
      destroyApp(firebase);
    }
  }

}

let swoof = new Swoof();

export default swoof;
