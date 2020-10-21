import Property from './property';

const normalizeOpts = ({ path, factory }) => {
  let components = path.split('.');
  let key = components.shift();
  let value = components.join('.');
  return {
    source: {
      path,
      key,
      value
    },
    factory
  };
}

export default class ModelsProperty extends Property {

  constructor(binding, key, dependencies, opts) {
    let { source, factory } = normalizeOpts(opts);
    super(binding, key, [ ...dependencies, source.path ]);
    this.source = source;
    this.factory = factory;
  }

  define() {
    let { owner, key } = this;
    Object.defineProperty(owner, key, {
      get: () => {
      }
    });
  }

  onDependencyDidChange(key) {
    console.log('onDependencyDidChange', key);
  }

}
