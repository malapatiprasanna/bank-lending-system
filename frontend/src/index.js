// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Removed the import for reportWebVitals as it's causing a module not found error.
// import reportWebVitals from './reportWebVitals'; // This line is removed

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Removed the call to reportWebVitals.
// If you want to start measuring performance in your app, pass a function
// to log results (for example: console.log)
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(); // This line is removed
