import Property from './property';
import { getBinding } from '../binding';

export default class TapProperty extends Property {

  constructor(binding, key, dependencies, { value }) {
    super(binding, key, dependencies);
    this.value = value;
    this.cancel = null;
  }

  tappedDidChange(key) {
    this.notifyDidChange(key, true);
  }

  tap(value) {
    let binding = getBinding(value);
    if(!binding) {
      return;
    }
    this.cancel = binding.addNotifyDidChangeListener(key => this.tappedDidChange(key));
  }

  untap() {
    let { cancel } = this;
    if(cancel) {
      cancel();
      this.cancel = null;
    }
  }

  define() {
    let { owner, key } = this;

    Object.defineProperty(owner, key, {
      get: () => {
        return this.value;
      },
      set: value => {
        let current = this.value;
        if(value === current) {
          return;
        }

        this.untap(this.value);
        this.value = value;
        this.tap(this.value);

        this.notifyDidChange();
      }
    });
  }

  onBind() {
    this.tap(this.value);
  }

  onUnbind() {
    this.untap(this.value);
  }

}
