'use client';

import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "apikey",
  authDomain: "springgreens-afe09.firebaseapp.com",
  projectId: "springgreens-afe09",
  storageBucket: "springgreens-afe09.appspot.com",
  messagingSenderId: "368919350125",
  appId: "1:368919350125:web:b0ed55f39f8a67a00c2864",
  measurementId: "G-VJ3KHGSJ3E"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export default function ClientComponent() {
  const [isSWRegistered, setSWRegistered] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          setSWRegistered(true);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    } else {
      console.log('Service Worker not supported in this browser.');
    }

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);

      // Extract data fields
      const score = payload.data?.score || 'No Score';
      const time = payload.data?.time || 'No Time';
      console.log(score, time);

      // Update notification state
      setNotification({
        title: `Score: ${score}`,
        body: `Time: ${time}`
      });
    });

    return () => unsubscribe();
  }, []);

  const requestPermission = async () => {
    if (isSWRegistered) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('An error occurred while requesting permission.', error);
        setError(error);
      }
    } else {
      console.log('Service Worker not registered yet.');
    }
  };

  const getTokenHandler = async () => {
    if (permissionGranted) {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: 'vapid' // 환경 변수 사용 예시
        });
        if (currentToken) {
          setToken(currentToken);
          console.log('Token:', currentToken);
        } else {
          console.log('No registration token available.');
        }
      } catch (error) {
        console.error('An error occurred while retrieving token.', error);
        setError(error);
      }
    } else {
      console.log('Permission not granted yet.');
    }
  };

  return (
    <div>
      <button onClick={requestPermission}>Request Permission</button>
      <button onClick={getTokenHandler} disabled={!permissionGranted}>Get Token</button>
      {token && <p>Token: {token}</p>}
      {notification && (
        <div>
          <h2>{notification.title}</h2>
          <p>{notification.body}</p>
        </div>
      )}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}