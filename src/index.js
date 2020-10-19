import JSON from './components/JSON.svelte';
import stores from './stores';
import { setGlobal, isServerTimestamp, isTimestamp, objectToJSON } from './util';

export {
  JSON,
  setGlobal,
  isServerTimestamp,
  isTimestamp,
  objectToJSON,
  stores
}
