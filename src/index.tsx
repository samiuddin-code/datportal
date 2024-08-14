import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider, message, notification } from "antd";
import "antd/dist/antd.variable.min.css";
import "antd-css-utilities/utility.min.css";
import "../src/assets/scss/style.scss";
import App from './App';

ConfigProvider.config({
  theme: {
    primaryColor: "#137749",
  },
});

message.config({
  // Set the max count of messages to be displayed globally so that it doesn't flood the screen.
  maxCount: 1,
});

notification.config({
  // Set the max count of notifications to be displayed globally so that it doesn't flood the screen.
  maxCount: 1,
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
