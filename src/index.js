import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import store from './redux/store';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom'; // Changed import

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter> {/* Changed component */}
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>
);