import Property from './property';

export default class ModelsProperty extends Property {

  constructor(binding, key, dependencies, {}) {
    super(binding, key, dependencies);
  }

  define() {
    let { owner, key } = this;
    Object.defineProperty(owner, key, {
      get: () => {
      },
      set: value => {
      }
    });
  }

  onDependencyDidChange() {
  }

}
