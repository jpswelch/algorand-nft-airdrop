// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCk1IoE62dni9GHAy6nwJ778VUCevRtpBk',
  authDomain: 'algorado-rnd-nft-airdrop.firebaseapp.com',
  databaseURL: 'https://algorado-rnd-nft-airdrop-default-rtdb.firebaseio.com',
  projectId: 'algorado-rnd-nft-airdrop',
  storageBucket: 'algorado-rnd-nft-airdrop.appspot.com',
  messagingSenderId: '765821423122',
  appId: '1:765821423122:web:d7995b5e59a388be2912cb',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
