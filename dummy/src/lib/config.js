import User from './user';

let {
  firebase
} = process.env.CONFIG;

export const config = {
  firebase,
  firestore: {
    enablePersistence: true
  },
  swoof: {
    auth: {
      User
    },
    // functions: {
    //   // custom default region
    //   region: 'us-central1'
    // }
  }
};

export const isDevelopment = true;
