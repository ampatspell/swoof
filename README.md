# Swoof

Swoof Google Firebase Firestore library for Svelte.

> Docs are coming.

See `/dummy` for some examples.

<!-- TOC depthFrom:2 -->

- [Setting up](#setting-up)
- [API](#api)
  - [swoof](#swoof)
    - [configure(name, config) → undefined](#configurename-config-→-undefined)
    - [create(identifier, name) → store](#createidentifier-name-→-store)
    - [store(identifier) → store or undefined](#storeidentifier-→-store-or-undefined)
    - [destroy() → undefined](#destroy-→-undefined)
  - [store](#store)
    - [doc(path) → DocumentReference](#docpath-→-documentreference)
    - [collection(path) → CollectionReference](#collectionpath-→-collectionreference)
    - [serverTimestamp() → firestore.FieldValue.ServerTimestamp](#servertimestamp-→-firestorefieldvalueservertimestamp)
  - [DocumentReference](#documentreference)
    - [id](#id)
    - [path](#path)
    - [collection(path)](#collectionpath)
    - [new(props)](#newprops)
    - [existing()](#existing)
    - [async load({ optional: false })](#async-load-optional-false-)
  - [CollectionReference](#collectionreference)
    - [id](#id-1)
    - [path](#path-1)
    - [doc(path)](#docpath)
    - [conditions](#conditions)
    - [query({ type: 'array' })](#query-type-array-)
    - [async load() -> Array<Document>](#async-load---arraydocument)
    - [first({ optional: false })](#first-optional-false-)
  - [Document](#document)
    - [store](#store-1)
    - [ref](#ref)
    - [id](#id-2)
    - [path](#path-2)
    - [promise](#promise)
    - [data Proxy](#data-proxy)
    - [merge(props)](#mergeprops)
    - [async load({ force: false })](#async-load-force-false-)
    - [async reload()](#async-reload)
    - [async save({ force: false, merge: false })](#async-save-force-false-merge-false-)
    - [async delete()](#async-delete)
    - [serialized](#serialized)
    - [toJSON()](#tojson)
  - [Query Single](#query-single)
  - [Query Array](#query-array)
  - [Model](#model)
  - [Model properties](#model-properties)
- [Issues](#issues)
  - [process is not defined](#process-is-not-defined)
  - ['registerComponent' of undefined](#registercomponent-of-undefined)
- [TODO](#todo)

<!-- /TOC -->

## Setting up

```
$ npm install swoof --save-dev
```

``` svelte
// App.svete
<script>
  import swoof, { state, setGlobal } from 'swoof';
  import SomethingNice from './SomethingNice.svelte';

  let { firebase } = process.env.CONFIG;

  let config = {
    firebase: {
      apiKey: "...",
      authDomain: "...",
      databaseURL: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "..."
    },
    firestore: {
      enablePersistence: true
    }
  };

  // internally creates FirebaseApp named main
  swoof.configure('main', config);

  // creates store named `main` using firebase app named `main`
  // swoof supports multiple firebase apps
  let store = swoof.create('main', 'main');

  // Optional tools for playing around in console
  setGlobal({ store });
  setGlobal({ state });
</script>

<SomethingNice/>

<style>
</style>
```

``` javascript
// console
await store.doc('message/hello').new({ text: 'hey there' }).save();
```

If you're getting weird build or runtime errors, see below.

## API

### swoof

``` javascript
import { swoof } from 'swoof';
```

#### configure(name, config) → undefined

Creates FirebaseApp and links it to the name.

#### create(identifier, name) → store

Creates and returns swoof store with given identifier and configuration name.

#### store(identifier) → store or undefined

Returns existing store for identifier.

``` javascript
swoof.create('main', 'production'); // once

// somewhere else
let store = swoof.store('main');
```

#### destroy() → undefined

Destroys internal FirebaseApp instances

### store

``` javascript
import { swoof } from 'swoof';
let store = swoof.store('main');
```

#### doc(path) → DocumentReference

Creates swoof firestore document reference.

``` javascript
let ref = store.doc('messages/first');
```

#### collection(path) → CollectionReference

Creates swoof firestore collection reference.

``` javascript
let ref = store.doc('messages/first/comments');
```

#### serverTimestamp() → firestore.FieldValue.ServerTimestamp

``` javascript
let doc = store.doc('messages/first').new({
  text: 'hey there',
  createdAt: store.serverTimestamp()
});
await doc.save();
```

### DocumentReference

``` javascript
let ref = store.doc('messages/first');
let ref = store.collection('messages').doc('first');
let ref = store.collection('messages').doc(); // generated id
```

#### id

Document id

#### path

Document path

#### collection(path)

Creates nested Collection Reference

``` javascript
let coll = store.doc('messages/first').collection('comments');
```

#### new(props)

Creates Document instance which is not automatically subscribed to onSnapshot listener.

Subscription to onSnapshot happens right after `save` or `load`.

``` javascript
let doc = store.doc('messages/first').new({
  ok: true
});

// doc.isNew === true
// doc.isSaved === false

await doc.save();

// doc.isNew === false
// now doc is subscribed to onSnashot listener
```

#### existing()

Creates Document instance which is automatically subscribed to onSnapshot listener.

``` javascript
let doc = store.doc('messages/first').existing();
// doc.isNew === false
```

#### async load({ optional: false })

Loads document and creates Document instance for it.

``` javascript
let doc = await store.doc('messages/first').load({ optional: true });
```

If document doesn't exist and optional is:
* `true`: `undefined` is returned
* `false`: `SwoofError` with `{ code: 'document/missing' }` is thrown

### CollectionReference

#### id

Dollection id

#### path

Collection full path

#### doc(path)

Creates nested document reference

``` javascript
let ref = store.collection('messages').doc(); // generated id
let ref = store.collection('messages').doc('first');
```

#### conditions

There are also all firestore condition operators which all also return QueryableReference for further conditions and `query()`, `load()` methods.

* where()
* orderBy()
* limit()
* limitToLast()
* startAt()
* startAfter()
* endAt()
* endBefore()

#### query({ type: 'array' })

Creates `onSnapshot` supporting Query instance. There are two types: `array`, `single`.

* array query has `content` property which is array of Document instances
* single query has `content` property which is Document instance or null

``` javascript
let array = store.collection('messages').query();
let single = store.collection('messages').orderBy('createdAt', 'asc').limit(1).query({ type: 'single' });
```

#### async load() -> Array<Document>

Loads documents from firestore and creates Document instances for each of them.

``` javascript
let ref = store.collection('messages').load();
let array = await ref.lod(); // [ <Document>, ... ]
```

#### first({ optional: false })

Loads first document from firestore and creates Document instance

``` javascript
let zeeba = await store.collection('messages').where('name', '==', 'zeeba').limit(1).first();
```

If document doesn't exist and optional is:
* `true`: `undefined` is returned
* `false`: `SwoofError` with `{ code: 'document/missing' }` is thrown

### Document

Document instance represents one firestore document.

``` javascript
let doc = store.doc('messages/first').new({
  ok: true
});
```

#### store

Store for which this document is created.

#### ref

DocumentReference for this document

#### id

Document id

#### path

Document full path

#### promise

Promise which is resolved after 1st load or 1st onSnapshot call

#### data Proxy

Document's data.

``` javascript
let doc = await store.doc('messages/first').load();
doc.data.name = 'new name';
// or
doc.data = { name: 'new name' };
```

Both editing properties directly or replacing data will trigger Svelte component renders.

#### merge(props)

Deep merge document data

``` javascript
let doc = store.doc('messages/first').new({
  name: 'zeeba',
  thumbnail: {
    size: {
      width: 100,
      height: 100
    },
    url: null
  }
});

doc.merge({
  thumbnail: {
    url: 'https:/....'
  }
});
```

#### async load({ force: false })

Loads document if it's not already loaded.

``` javascript
let doc = await store.doc('messages/first').existing();
await doc.load(); // loads
await doc.load(); // ignores. already loade
await doc.load({ force: true }); // loads or reloads
```

#### async reload()

Reloads document. The same as `doc.load({ force: true })`

#### async save({ force: false, merge: false })

Saves document if `isDirty` is `true`.

``` javascript
let doc = await store.doc('messages/first').new({
  ok: true
});

await doc.save(); // saves
await doc.save(); // ignores. not dirty
doc.data.name = 'zeeba';
await doc.save(); // saves
await doc.save({ force: true }); // saves even if not dirty
await doc.save({ merge: true }) // does `ref.set(data, { merge: true });
```

#### async delete()

Deletes a document

``` javascript
let doc = await store.doc('messages/first');
await doc.delete();
```

#### serialized

Returns JSON debugish representation of document.

``` javascript
let doc = await store.doc('messages/first').load();
```

``` javascript
{
  id: "first",
  path: "messages/first",
  exists: true,
  isNew: false,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  isLoaded: true,
  isError: false,
  error: null,
  data: {
    name: "Zeeba"
  }
}
```

#### toJSON()

Basically same as serialized with additional data

### Query Single

...

### Query Array

...

### Model

...

### Model properties

...

## Issues

### process is not defined

```
Uncaught ReferenceError: process is not defined
```

add `plugin-replace` to rollup config:

``` javascript
// rollup.config.js
import replace from '@rollup/plugin-replace';

plugins([
  //...
  svelte({
    // ...
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  // ...
])
```

### 'registerComponent' of undefined

```
Uncaught TypeError: Cannot read property 'registerComponent' of undefined
```

update `plugin-commonjs`:

``` javascript
// package.json
"devDependencies": {
    // ...
    "@rollup/plugin-commonjs": "^15.0.0"
}
```

## TODO

- [ ] add basic auth support (sign up, sign in (email, anon), forgot password, link account, sign out)
- [ ] add basic storage support
- [ ] diff doc onSnapshot changes + state and do writable.set(this) only if there are changes present
- [ ] readOnly() property
- [x] models() property
- [x] tap: needs some kind of tool to forward change notifications to nested models
