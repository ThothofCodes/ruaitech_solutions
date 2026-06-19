// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme.css';
import './index.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);


