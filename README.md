# Swoof

Experimental Firestore library for Svelte.

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

## TODO

- [ ] add basic auth support (sign up, sign in (email, anon), forgot password, link account, sign out)
- [ ] add basic storage support
- [ ] diff doc onSnapshot changes + state and do writable.set(this) only if there are changes present
- [ ] readOnly() property
- [ ] models() property
