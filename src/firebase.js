import firebase from "firebase/app";
import 'firebase/storage';
import 'firebase/auth';
import 'firebase/firestore';

const initializeApp = config => firebase.initializeApp(config);

const enablePersistence = async firebase => {
  await firebase.firestore().enablePersistence({ synchronizeTabs: true }).catch(err => {
    console.log(err.stack);
  });
};

export {
  initializeApp,
  enablePersistence
}
