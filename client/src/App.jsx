import AppRoute from "./routes/AppRoute";
import Toastify from "./components/common/Toastify.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import {store} from "./store/index.js";
function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
          <AppRoute />
          <Toastify />
      </Provider>
    </GoogleOAuthProvider> 
  );
}

export default App;
