import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Toaster} from "@/components/ui/sonner.jsx";
import {BrowserRouter} from "react-router-dom";
import { store } from './redux/store.js'
import { Provider } from 'react-redux'
import {PersistGate} from "redux-persist/integration/react";
import {persistStore} from "redux-persist";

let persistor=persistStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>
          <PersistGate persistor={persistor} loading={null}>
              <BrowserRouter>
                  <App />
                  <Toaster/>
              </BrowserRouter>
          </PersistGate>

      </Provider>

  </StrictMode>,
)
