import React from 'react';
import Login from './login/login.component';
import { BrowserRouter, Route } from 'react-router-dom';
import { CurrentUserContext } from './CurrentUserContext';

export interface RootProps {
  isLoginEnabled: boolean;
}

const Root: React.FC<RootProps> = ({ isLoginEnabled }) => {
  return (
    <CurrentUserContext>
      <BrowserRouter basename={window.spaBase}>
        <Route exact path="/login" render={(props) => <Login {...props} isLoginEnabled={isLoginEnabled} />} />
        <Route exact path="/changePassword" render={(props) => <Login {...props} isLoginEnabled={isLoginEnabled} />} />
      </BrowserRouter>
    </CurrentUserContext>
  );
};

export default Root;
