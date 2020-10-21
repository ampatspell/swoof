# Recreate

``` javascript
_recreateContent() {
  let source = get(this.parent, this._opts.source.path);
  let factory = this._opts.factory;

  let current = this._content || [];

  let find = doc => {
    let model = current.find(model => model[ownerKey] && model[ownerKey].doc === doc);
    if(model) {
      removeObject(current, model);
    }
    return model;
  };

  let create = doc => {
    let model = factory(doc);
    if(model) {
      let cancel = this._subscriptions.withSuppressNotifyDidChange(() => {
        if(isFunction(model.subscribe)) {
          return model.subscribe(() => this._contentModelDidChange(model));
        } else {
          return noop;
        }
      });
      defineProperty(model, ownerKey, { value: { cancel, doc } });
    }
    return model;
  };

  let content = [];
  if(source) {
    source.forEach(doc => {
      let model = find(doc);
      if(!model) {
        model = create(doc);
      }
      if(model) {
        content.push(model);
      }
    });
  }

  this._unsubscribeContentModels(current);

  this._content = content;
}
```
