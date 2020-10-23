const functions = require('firebase-functions');

const echo = functions.https.onCall((data, context) => {
  const uid = context.auth && context.auth.uid;
  return {
    uid,
    data
  };
});

module.exports = {
  echo
};