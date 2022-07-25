import React, { useEffect } from 'react';
import styles from '../styles.scss';
import { RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigate, NavigateOptions, useConfig, ConfigurableLink } from '@openmrs/esm-framework';
import { performLogin } from './login.resource';
import { useCurrentUser } from '../CurrentUserContext';
import type { StaticContext } from 'react-router';
import { Button, TextInput } from 'carbon-components-react';

const hidden: React.CSSProperties = { height: 0, width: 0, border: 0, padding: 0 };

export interface LoginReferrer {
  referrer?: string;
}

export interface LoginProps extends RouteComponentProps<{}, StaticContext, LoginReferrer> {
  isLoginEnabled: boolean;
}

const Login: React.FC<LoginProps> = ({ history, location, isLoginEnabled }) => {
  const config = useConfig();
  const user = useCurrentUser();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const usernameInputRef = React.useRef<HTMLInputElement>(null);
  const [t] = useTranslation();
  const to: NavigateOptions = { to: window.spaBase + '/home' };

  useEffect(() => {
    if (user) {
      history.push('home');
    } else if (!username) {
      history.replace('/login');
    }
  }, [user, username, history]);

  const changeUsername = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setUsername(evt.target.value),
    [],
  );
  const changePassword = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setPassword(evt.target.value),
    [],
  );
  const handleSubmit = React.useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      evt.stopPropagation();
      try {
        const loginRes = await performLogin(username, password);
        const authData = loginRes.data;
        const valid = authData && authData.authenticated;
        if (!valid) throw new Error('Incorrect username or password');
      } catch (error) {
        setErrorMessage(error.message);
      }
      return false;
    },
    [username, password],
  );

  return (
    <div className={styles.container}>
      <div className={`${styles['login-card']}`}>
        <div className={styles.titleMhiseg}>
          <h1> MHISEG</h1>
          <h3> Modern Health Information System Expert Group</h3>
        </div>
        <form className={`${styles.form}`} onSubmit={handleSubmit}>
          <div className={styles.blockInput}>
            <label>{t('username')}</label>
            <TextInput
              className={styles.inputStyle}
              id={'username'}
              labelText={''}
              ref={usernameInputRef}
              required
              invalidText={t('A valid value is required')}
              onChange={changeUsername}
            />
          </div>
          <div className={styles.blockInput}>
            <label>{t('password')}</label>
            <TextInput.PasswordInput
              className={styles.inputStyle}
              id={'password]'}
              labelText={''}
              ref={passwordInputRef}
              required
              invalidText={t('A valid value is required')}
              onChange={changePassword}
            />
            <div className={styles['center']}>
              <p className={styles['error-msg']}>{t(errorMessage)}</p>
            </div>
          </div>
          <Button className={styles.loginButton} type="submit">
            {t('login', 'Log in')}
          </Button>
          <div className={styles['need-help']}>
            <p className={styles['need-help-txt']}>
              {t('needAccount', 'Need account?')}
              <ConfigurableLink to="${openmrsBase}/spa/login/signup" className={styles['need-account']}>
                &nbsp;{t('signUp')}
              </ConfigurableLink>
            </p>
          </div>
        </form>
      </div>
      <span className={styles.footer}>in collaboration with OpenMRS community</span>
    </div>
  );
};
export default Login;
