import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBc6f-H1aKpQi0jaXw2v4srCfpAbyEf_Ek",
  authDomain: "dashboard.sellerapp.com",
  databaseURL: "https://goseller.firebaseio.com",
  projectId: "goseller",
  storageBucket: "goseller.appspot.com",
  messagingSenderId: "207791529245",
  appId: "1:207791529245:web:04fec874a52f44663d55f4",
  measurementId: "G-BBXNP5X680",
};

const app = initializeApp(firebaseConfig);
export const getAuthentication = () => {
  // const auth: Auth = initializeAuth(app, { errorMap: debugErrorMap });
  const auth = getAuth(app);
  auth.tenantId = `platform-ja19j`;
  // auth.languageCode = "en";
  return auth;
};
