import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RenderRoutes, { routes } from './routes';
import { AuthProvider } from './components/AuthContext';

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.VITE_APP_BASE_NAME}>
      <AuthProvider>
        <RenderRoutes routes={routes} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
