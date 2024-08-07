importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "apikey",
    authDomain: "springgreens-afe09.firebaseapp.com",
    projectId: "springgreens-afe09",
    storageBucket: "springgreens-afe09.appspot.com",
    messagingSenderId: "368919350125",
    appId: "1:368919350125:web:b0ed55f39f8a67a00c2864",
    measurementId: "G-VJ3KHGSJ3E"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log('Received background message: ', payload);
  
//   // Extract data fields
//   const score = payload.data ? payload.data.score : 'No score';
//   const time = payload.data ? payload.data.time : 'No time';
//   console.log(score, time);
  
//   // Define notification title and options
//   const notificationTitle = `Score: ${score}`;
//   const notificationOptions = {
//     body: `Time: ${time}`,
//     icon: '/icon.png'
//   };
  
//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  const { title = 'Default Title', body = 'Default Body' } = payload.notification || {};
  const notificationOptions = {
    body: body,
    icon: '/icon.png'
  };

  self.registration.showNotification(title, notificationOptions);
});