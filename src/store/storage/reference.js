import { toString, toJSON, defineHiddenProperty, assign, omit } from '../../util/util';

export default class StorageReference {

  constructor(storage, ref) {
    defineHiddenProperty(this, 'storage', storage);
    defineHiddenProperty(this, '_ref', ref);
  }

  get name() {
    return this._ref.name;
  }

  get path() {
    return this._ref.fullPath;
  }

  get bucket() {
    return this._ref.bucket;
  }

  get serialized() {
    let { name, path, bucket } = this;
    return {
      name,
      path,
      bucket
    };
  }

  async url() {
    return await this._ref.getDownloadURL();
  }

  async metadata() {
    let metadata = await this._ref.getMetadata();
    let date = key => {
      let value = metadata[key];
      return value && new Date(value);
    }
    let timeCreated = date('timeCreated');
    let updated = date('updated');
    return assign({}, metadata, {
      timeCreated,
      updated
    });
  }

  async update(metadata) {
    await this._ref.updateMetadata(metadata);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    return toString(this, `${this.path}`);
  }

}
