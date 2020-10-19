import { objectToJSON, toJSON } from './util';

const {
  assign
} = Object;

export class StoreError extends Error {

  get serialized() {
    return objectToJSON(this);
  }

  toJSON() {
    let { serialized } = this;
    return toJSON(this, { serialized });
  }

}

export const error = opts => {
  let { message, code } = opts;
  delete opts.message;
  delete opts.code;

  let err = new StoreError(message);
  err.code = `store/${code}`;
  assign(err, opts);

  return err;
}

export const documentForRefNotFoundError = ref => error({
  message: `Document '${ref.path}' missing`,
  code: 'document/missing',
  path: ref.path
});

export const documentNotFoundError = () => error({
  message: `Document missing`,
  code: 'document/missing'
});

export const assert = (condition, message) => {
  if(!condition) {
    throw error({
      message,
      code: 'assert'
    });
  }
}