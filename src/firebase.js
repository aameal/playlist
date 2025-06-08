// src/firebase.js

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // ✅ 실시간 데이터베이스용

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCP2RaFFD_VOcqVfR11EfSYKOW8birg-eE",
  authDomain: "playlist-v2-b4c4e.firebaseapp.com",
  databaseURL: "https://playlist-v2-b4c4e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "playlist-v2-b4c4e",
  storageBucket: "playlist-v2-b4c4e.firebasestorage.app",
  messagingSenderId: "865818889381",
  appId: "1:865818889381:web:a74f2e3ab2b7d77745914c"
  // ❌ measurementId는 필요 없으니 삭제해도 됨
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 실시간 DB 객체 export
export const db = getDatabase(app);
