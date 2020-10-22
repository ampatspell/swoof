import Property from './property';

const {
  assign
} = Object;

export default class LoggerProperty extends Property {

  constructor(binding, key, dependencies, { callback }) {
    super(binding, key, dependencies);
    this.callback = callback;
  }

  define() {
  }

  notify(type, opts={}) {
    let { callback } = this;
    if(callback) {
      let { owner: model } = this;
      callback.call(model, assign({ type, model }, opts));
    }
  }

  onPropertyDidChange(path) {
    this.notify('change', { path });
  }

  onBind() {
    this.notify('bind');
  }

  onUnbind() {
    this.notify('unbind');
  }

}
