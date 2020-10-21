import { writable } from 'svelte/store';
import swoof from './swoof';

export default class Subscriptions {

  constructor(owner, { onStart, onStop }) {
    this.owner = owner;
    this.writable = writable(this);
    this.onStart = onStart;
    this.onStop = onStop;
    this.subscriptions = 0;
    this.suppressNotifyDidChange = 0;
  }

  withSuppressNotifyDidChange(cb, ignore) {
    if(ignore) {
      return cb();
    }
    this.suppressNotifyDidChange++;
    try {
      return cb();
    } finally {
      this.suppressNotifyDidChange--;
    }
  }

  notifyDidChange() {
    if(this.suppressNotifyDidChange > 0) {
      return;
    }
    this.writable.set(this.owner);
  }

  get hasSubscriptions() {
    return this.subscriptions > 0;
  }

  subscribe(...args) {
    let start = this.subscriptions === 0;
    this.subscriptions++;

    console.log("+", this.subscriptions, this.owner+'');

    let observing = swoof._registerObserving(this.owner);
    let unsubscribe = this.writable.subscribe(...args);

    if(start) {
      let cancel = this.onStart();
      if(cancel) {
        this.cancel = cancel;
      }
    }

    return () => {
      this.subscriptions--;
      console.log("-", this.subscriptions, this.owner+'');
      unsubscribe();
      observing();
      if(this.subscriptions === 0) {
        if(!this.onStop) {
          this.cancel();
          this.cancel = null;
        } else {
          this.onStop();
        }
      }
    }
  }

}
