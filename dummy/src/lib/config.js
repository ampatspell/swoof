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
    User
  }
};

export const isDevelopment = true;
