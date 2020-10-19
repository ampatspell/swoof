# swoof

Experimental Firestore library for Svelte.

``` svelte
// App.svelte
<script>
  import { stores } from 'swoof';
  import Whatever from './Whatever.svelte';

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

  stores.configure('main', config);
  let store = stores.create('main', 'main');
</script>

<Whatever/>

<style>
</style>
```

``` svelte
// Whatever.svelte
<script>
  import { JSON, stores, setGlobal } from 'swoof';

  let store = stores.get('main');

  let id = 'first';

  $: doc = store.doc(`foobar/${id}`).existing();
  $: setGlobal({ doc });

  let save = () => {
    doc.data.updatedAt = store.serverTimestamp;
    console.log('save', doc.serialized.data);
    doc.save();
  };
</script>

<input bind:value={id}/>

<input bind:value={$doc.data.text}/>
<button on:click={() => save()}>Save</button>

<JSON object={$doc}/>

<style>
</style>
```

``` svelte
// Query.svelte
<script>
  import { JSON, stores, setGlobal } from 'swoof';

  let store = stores.get('main');

  let query = store.collection('messages').query();
  setGlobal({ query });

</script>

<JSON object={$query}/>

{#each $query.content as doc}
  <JSON object={doc}/>
  <input bind:value={doc.data.text}/>
  <button on:click={() => doc.save()}>Save</button>
{/each}

<style type="text/scss">
</style>
```

## process is not defined

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

## 'registerComponent' of undefined

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
