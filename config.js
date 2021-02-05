import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: 'AIzaSyDMWndg-5CgZWRmL7FvA5njsFyv9ASxw6U',
  authDomain: 'kartikey-barter-app.firebaseapp.com',
  databaseURL: 'https://kartikey-barter-app.firebaseio.com',
  projectId: 'kartikey-barter-app',
  storageBucket: 'kartikey-barter-app.appspot.com',
  messagingSenderId: '156997145193',
  appId: '1:156997145193:web:950aa98017d50cd42088f8',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
