import Property from './property';
import { createArrayProxy, ImmutableArrayProxy } from '../../util/proxy';
import { get, removeObject } from '../../util/util';

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

class ModelsProxy extends ImmutableArrayProxy {
}

const ownerKey = '__swoof_models';

export default class ModelsProperty extends Property {

  constructor(binding, key, dependencies, opts) {
    let { source, factory } = normalizeOpts(opts);
    super(binding, key, [ ...dependencies, source.path ]);
    this.source = source;
    this.factory = factory;
    this.models = [];
    this.content = new ModelsProxy(this.models);
    this.proxy = createArrayProxy(this.content);
  }

  define() {
    let { owner, key } = this;
    Object.defineProperty(owner, key, {
      get: () => {
        return this.proxy;
      }
    });
  }

  registerNested(object) {
    super.registerNested(object, '[]');
  }

  unregisterNestedItems(items) {
    items.forEach(item => this.unregisterNested(item));
  }

  rebuild() {
    let owner = this.owner;
    let source = get(owner, this.source.path) || [];
    let factory = this.factory;

    let current = this.models || [];

    let find = doc => {
      let model = current.find(model => model[ownerKey] && model[ownerKey].doc === doc);
      if(model) {
        removeObject(current, model);
      }
      return model;
    };

    let create = doc => {
      let model = factory.call(owner, doc);
      if(model) {
        Object.defineProperty(model, ownerKey, { value: { doc } });
        this.registerNested(model);
      }
      return model;
    };

    let added = 0;

    let models = [];
    source.forEach(doc => {
      let model = find(doc);
      if(!model) {
        model = create(doc);
        added++;
      }
      if(model) {
        models.push(model);
      }
    });

    let removed = current.length;

    this.unregisterNestedItems(current);

    this.models = models;
    this.content._content = models;

    if(added + removed > 0) {
      this.notifyDidChange();
    }
  }

  onBind() {
    this.rebuild();
  }

  onDependencyDidChange() {
    this.rebuild();
  }

}
