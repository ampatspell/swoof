import { toString, toJSON, defineHiddenProperty, assign, keys } from '../../util/util';
import { assert } from '../../util/error';
import firebase from "firebase/app";
import Task from './task';

const {
  StringFormat
} = firebase.storage;

const stringFormats = {
  'raw':        StringFormat.RAW,
  'base64':     StringFormat.BASE64,
  'base64-url': StringFormat.BASE64URL,
  'data-url':   StringFormat.DATA_URL
};

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
    return this;
  }

  async delete() {
    await this._ref.delete();
    return this;
  }

  _put(opts={}) {
    let { type, data, format, metadata } = opts;
    assert(typeof metadata === 'object', `opts.metadata must be object`);
    let task;
    if(type === 'string') {
      let format_ = stringFormats[format];
      assert(format_, `opts.format can be one of the following [ ${keys(stringFormats).join(', ')} ]`);
      task = this._ref.putString(data, format_, metadata);
    } else if(type === 'data') {
      task = this._ref.put(data, metadata);
    } else {
      assert(false, `opts.type must be string or data`);
    }
    return { type, data, task, metadata };
  }

  put(opts) {
    return new Task(this, this._put(opts));
  }

  get serialized() {
    let { name, path, bucket } = this;
    return {
      name,
      path,
      bucket
    };
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

  toString() {
    return toString(this, `${this.path}`);
  }

}
