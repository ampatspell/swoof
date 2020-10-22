# Swoof

Swoof Google Firebase Firestore library for Svelte.

> Docs are coming.

See `/dummy` for some examples.

<!-- TOC depthFrom:2 -->

- [Setting up](#setting-up)
- [API](#api)
  - [swoof](#swoof)
    - [configure(name, config): undefined](#configurename-config-undefined)
    - [create(identifier, name): store](#createidentifier-name-store)
    - [store(identifier): store or undefined](#storeidentifier-store-or-undefined)
    - [destroy(): undefined](#destroy-undefined)
  - [Model](#model)
    - [writable(model): svelte/writable](#writablemodel-sveltewritable)
    - [Properties](#properties)
  - [Store](#store)
    - [doc(path): DocumentReference](#docpath-documentreference)
    - [collection(path): CollectionReference](#collectionpath-collectionreference)
    - [serverTimestamp(): firestore.FieldValue.ServerTimestamp](#servertimestamp-firestorefieldvalueservertimestamp)
  - [DocumentReference](#documentreference)
    - [id: string](#id-string)
    - [path: string](#path-string)
    - [collection(path): CollectionReference](#collectionpath-collectionreference-1)
    - [new(props): Document](#newprops-document)
    - [existing(): Document](#existing-document)
    - [async load({ optional: false }): Document or undefined](#async-load-optional-false--document-or-undefined)
  - [CollectionReference](#collectionreference)
    - [id: string](#id-string-1)
    - [path: string](#path-string-1)
    - [doc(path): DocumentReference](#docpath-documentreference-1)
    - [conditions](#conditions)
    - [query({ type: 'array' }): ArrayQuery or SingleQuery](#query-type-array--arrayquery-or-singlequery)
    - [async load(): Array<Document>](#async-load-arraydocument)
    - [first({ optional: false }): Document or undefined](#first-optional-false--document-or-undefined)
  - [Document extends Model](#document-extends-model)
    - [store: Store](#store-store)
    - [ref: DocumentReference](#ref-documentreference)
    - [id: string](#id-string-2)
    - [path: string](#path-string-2)
    - [promise: Promise<Document>](#promise-promisedocument)
    - [data: ObjectProxy](#data-objectproxy)
    - [merge(props): undefined](#mergeprops-undefined)
    - [async load({ force: false }): Document](#async-load-force-false--document)
    - [async reload(): Document](#async-reload-document)
    - [async save({ force: false, merge: false }): Document](#async-save-force-false-merge-false--document)
    - [async delete(): Document](#async-delete-document)
    - [serialized: Object](#serialized-object)
    - [toJSON(): Object](#tojson-object)
  - [Query extends Model](#query-extends-model)
    - [promise: Promise<Query>](#promise-promisequery)
    - [async load({ force: false }): Query](#async-load-force-false--query)
    - [reload(): Query](#reload-query)
    - [string: string](#string-string)
    - [serialized: object](#serialized-object)
    - [content](#content)
  - [Auth](#auth)
    - [Sign in](#sign-in)
    - [Link anonymous to credentials](#link-anonymous-to-credentials)
    - [User](#user)
  - [Storage](#storage)
    - [Task extends Model](#task-extends-model)
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
  import { swoof, state, setGlobal, User } from 'swoof';
  import SomethingNice from './SomethingNice.svelte';

  class FancyUser extends User {
  }

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
    },
    swoof: {
      User: FancyUser
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

#### configure(name, config): undefined

Creates FirebaseApp and links it to the name.

#### create(identifier, name): store

Creates and returns swoof store with given identifier and configuration name.

#### store(identifier): store or undefined

Returns existing store for identifier.

``` javascript
swoof.create('main', 'production'); // once

// somewhere else
let store = swoof.store('main');
```

#### destroy(): undefined

Destroys internal FirebaseApp instances

### Model

> Soon. See /dummy for examples

``` javascript
// lib/messages.js
import { Model, computed } from 'swoof';

const {
  attr,
  models,
  tap
} = computed;

class Message extends Model {

  constructor(message) {
    super();
    // tap doesn't bind, just forwards change notifications in this context
    this.property('doc', tap(doc));
  }

  get data() {
    return this.doc.data;
  }

  get text() {
    return this.data.text;
  }

  async save() {
    await this.doc.save();
  }

}

export default class Messages extends Model {

  constructor(store) {
    super();
    this.store = this;
    this.coll = store.collection('messages');

    // query autosubscribes to ref.onSnapshot
    this.property('query', attr(this.coll.orderBy('createdAt').query()));

    // Message models are automatically created for each document.
    // then added/removed based on snapshot.docChanges
    this.property('messages', models('query.content', doc => new Message(doc)));
  }

  async add(text) {
    let { store } = this;
    let doc = this.coll.doc().new({
      text,
      createdAt: store.serverTimestamp();
    });
    await doc.save();
  }

}
```

``` svelte
<script>
  import { store } from 'swoof';
  import Messages from './lib/messages';

  // Writable when subscribed starts all onSnapshot listeners and
  // property change notifications
  // Everything is torn down when last subscriber unsubscribes.
  let messages = writable(new Messages(store));
</script>

<!-- use "$" only for `messages` - first level -->

<div>{$messages.count} messages.</div>
<div>
  {#each $messages.message as message}
    <div>{message.text}</div>
  {/each}
</div>
```

#### writable(model): svelte/writable

Creates Svelte writable for sfoof model instance or tree.

#### Properties

* attr
* array
* models
* tap
* logger

### Store

``` javascript
import { swoof } from 'swoof';
let store = swoof.store('main');
```

#### doc(path): DocumentReference

Creates swoof firestore document reference.

``` javascript
let ref = store.doc('messages/first');
```

#### collection(path): CollectionReference

Creates swoof firestore collection reference.

``` javascript
let ref = store.doc('messages/first/comments');
```

#### serverTimestamp(): firestore.FieldValue.ServerTimestamp

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

#### id: string

Document id

#### path: string

Document path

#### collection(path): CollectionReference

Creates nested Collection Reference

``` javascript
let coll = store.doc('messages/first').collection('comments');
```

#### new(props): Document

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

#### existing(): Document

Creates Document instance which is automatically subscribed to onSnapshot listener.

``` javascript
let doc = store.doc('messages/first').existing();
// doc.isNew === false
```

#### async load({ optional: false }): Document or undefined

Loads document and creates Document instance for it.

``` javascript
let doc = await store.doc('messages/first').load({ optional: true });
```

If document doesn't exist and optional is:
* `true`: `undefined` is returned
* `false`: `SwoofError` with `{ code: 'document/missing' }` is thrown

### CollectionReference

#### id: string

Dollection id

#### path: string

Collection full path

#### doc(path): DocumentReference

Creates nested document reference

``` javascript
let ref = store.collection('messages').doc(); // generated id
let ref = store.collection('messages').doc('first');
```

#### conditions

There are also all firestore condition operators which all also return `QueryableReference` for further conditions and `query()`, `load()` methods.

* where()
* orderBy()
* limit()
* limitToLast()
* startAt()
* startAfter()
* endAt()
* endBefore()

#### query({ type: 'array' }): ArrayQuery or SingleQuery

Creates `onSnapshot` supporting Query instance. There are two types: `array`, `single`.

* array query has `content` property which is array of Document instances
* single query has `content` property which is Document instance or null

``` javascript
let array = store.collection('messages').query();
let single = store.collection('messages').orderBy('createdAt', 'asc').limit(1).query({ type: 'single' });
```

#### async load(): Array<Document>

Loads documents from firestore and creates Document instances for each of them.

``` javascript
let ref = store.collection('messages').load();
let array = await ref.lod(); // [ <Document>, ... ]
```

#### first({ optional: false }): Document or undefined

Loads first document from firestore and creates Document instance

``` javascript
let zeeba = await store.collection('messages').where('name', '==', 'zeeba').limit(1).first();
```

If document doesn't exist and optional is:
* `true`: `undefined` is returned
* `false`: `SwoofError` with `{ code: 'document/missing' }` is thrown

### Document extends Model

Document instance represents one firestore document.

``` javascript
let doc = store.doc('messages/first').new({
  ok: true
});
```

#### store: Store

Store for which this document is created.

#### ref: DocumentReference

DocumentReference for this document

#### id: string

Document id

#### path: string

Document full path

#### promise: Promise<Document>

Promise which is resolved after 1st load or 1st onSnapshot call

#### data: ObjectProxy

Document's data.

``` javascript
let doc = await store.doc('messages/first').load();
doc.data.name = 'new name';
// or
doc.data = { name: 'new name' };
```

Both editing properties directly or replacing data will trigger Svelte component renders.

#### merge(props): undefined

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

#### async load({ force: false }): Document

Loads document if it's not already loaded.

``` javascript
let doc = await store.doc('messages/first').existing();
await doc.load(); // loads
await doc.load(); // ignores. already loade
await doc.load({ force: true }); // loads or reloads
```

#### async reload(): Document

Reloads document. The same as `doc.load({ force: true })`

#### async save({ force: false, merge: false }): Document

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

#### async delete(): Document

Deletes a document

``` javascript
let doc = await store.doc('messages/first');
await doc.delete();
```

#### serialized: Object

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

#### toJSON(): Object

Basically same as serialized with additional data

### Query extends Model

onSnapshot aware query.

``` javascript
let array = store.collection('messages').where('status', '==', 'sent').query({ type: 'array' });
let single = store.collection('messages').limit(1).query({ type: 'single' });
```

#### promise: Promise<Query>

Promise which is resolved after 1st load or 1st onSnapshot call.

``` javascript
let query = store.collection('messages').query();
await query.promise; // resolves after 1st load or onSnapshot
```

#### async load({ force: false }): Query

Loads query if it is not already loaded. See `Document.load` for details on `force`.

``` javascript
let query = store.collection('messages').query();
await query.load();
// isLoaded === true
await query.load(); // doesn't do anything
await query.load({ force: true }); // loads
```

#### reload(): Query

Relaods query. Same as `load({ force: true })`

#### string: string

More or less readable query as a string.

#### serialized: object

Debugish query status representation

``` javascript
{
  error: null
  isError: false
  isLoaded: false
  isLoading: false
  string: "messages.where(status, ==, sent).limit(10)"
}
```

#### content

if `{ type }` is:

* `array` (default): array of Document instances
* `single`: single (first) Document instance or null

### Auth

``` javascript
let auth = store.auth;
```

#### Sign in

``` javascript
await auth.methods.anonymous.signIn();
await auth.methods.email.signIn(email, password);
```

#### Link anonymous to credentials

``` javascript
await auth.methods.anonymous.signIn();
let user = auth.user;
await user.link('email', email, password);
```

#### User

``` javascript
let user = auth.user;
await user.delete();
await user.signOut();
```

### Storage

``` javascript
let storage = store.storage;
```

``` javascript
let ref = storage.ref(`users/${uid}/avatar`);

let task = ref.put({
  type: 'data',
  data: file,
  metadata: {
    contentType: file.type
  }
});

await task.promise;
```

``` javascript
let ref = storage.ref(`users/${uid}/avatar`);
await ref.url();
await ref.metadata();
await ref.update({ contentType: 'image/png' });
```

#### Task extends Model

``` javascript
import { Model, writable, computed, objectToJSON } from 'swoof';

const {
  attr
} = computed;

class Storage extends Model {

  constructor() {
    super();
    this.property('task', attr(null))
  }

  async upload() {
    let task = store.storage.ref('hello').put({
      type: 'string',
      format: 'raw',
      data: 'hey there',
      metadata: {
        contentType: 'text/plain'
      }
    });
    this.task = task;
  }

  get serialized() {
    let { task } = this;
    return {
      task: objectToJSON(task)
    };
  }

}

let model = writable(new Storage());
```

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

- [ ] diff doc onSnapshot changes + state and do writable.set(this) only if there are changes present
- [ ] readOnly() property
- [x] models() property
- [x] tap: needs some kind of tool to forward change notifications to nested models
- [x] add basic auth support (sign up, sign in (email, anon), forgot password, link account, sign out)
- [x] add basic storage support
