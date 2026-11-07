import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import store from './redux/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ThemeModeProvider from './ThemeModeProvider';
import { installSession } from './utils/session';
import { authLogout } from './redux/userRelated/userSlice';

installSession(() => store.dispatch(authLogout()));

// Derive the basename from the homepage field (PUBLIC_URL) so the same build
// works both locally ("/") and on GitHub Pages ("/therapyhome"). This gives
// clean URLs (no "#") while staying deployable to a project subpath. The
// public/404.html + index.html restore script handle deep-link refreshes.
const basename = process.env.PUBLIC_URL || '/';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeModeProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </ThemeModeProvider>
    </Provider>
  </React.StrictMode>
);
