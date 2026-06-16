import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAVhQohz3ueJ_DNaY0HNOVcC-BkPSNFcfQ',
  authDomain: 'boodschappenlijstjesmaker.firebaseapp.com',
  projectId: 'boodschappenlijstjesmaker',
  storageBucket: 'boodschappenlijstjesmaker.firebasestorage.app',
  messagingSenderId: '624229728215',
  appId: '1:624229728215:web:4f89657e1ddf044a4fd592',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export const auth = firebaseApp.auth();
export const db = firebaseApp.firestore();

db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence: multiple tabs open, only one can enable persistence.');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence: browser does not support it.');
  }
});

export { firebase };
