import Property from './property';
import { toPrimitive, assign } from '../../util/util';

let _callback = ({ model, type, path }) => {
  let arr = [
    `${toPrimitive(model)}`,
  ];
  if(type === 'change') {
    arr.push(`→`);
    arr.push(path);
  } else {
    arr.push(`•`);
    arr.push(type);
  }
  console.log(arr.join(' '));
}

export default class LoggerProperty extends Property {

  constructor(binding, key, dependencies, { callback }) {
    super(binding, key, dependencies);
    this.callback = callback || _callback;
  }

  define() {
  }

  notify(type, opts={}) {
    let { callback } = this;
    let { owner: model } = this;
    callback.call(model, assign({ type, model }, opts));
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
