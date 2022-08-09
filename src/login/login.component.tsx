import React, { useEffect } from 'react';
import styles from '../styles.scss';
import { RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConfig, ConfigurableLink, refetchCurrentUser } from '@openmrs/esm-framework';
import { login, performLogin, saveUser, Status, updatePasswordUser } from './login.resource';
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
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const usernameInputRef = React.useRef<HTMLInputElement>(null);
  const oldPasswordInputRef = React.useRef<HTMLInputElement>(null);
  const newPasswordInputRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = React.useRef<HTMLInputElement>(null);
  const [t] = useTranslation();
  const [updatePassword, setUpdatePassword] = React.useState(localStorage.getItem('token'));

  // alert(updatePassword);

  useEffect(() => {
    if (user) {
      history.push('home');
    } else if (!username) {
      history.replace('/login');
    }
  }, []);

  const changeUsername = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setUsername(evt.target.value),
    [],
  );
  const changePassword = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setPassword(evt.target.value),
    [],
  );

  const changeOldPassword = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setOldPassword(evt.target.value),
    [],
  );
  const changeNewPassword = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setNewPassword(evt.target.value),
    [],
  );
  const changeConfirmPassword = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(evt.target.value),
    [],
  );

  const handleSubmit = React.useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      evt.stopPropagation();
      try {
        if (updatePassword) {
          if (oldPassword === newPassword) throw new Error('your new password may be different from the old password');
          if (newPassword !== confirmPassword) throw new Error('your new password is not confirm');
          updatePasswordUser(new AbortController(), oldPassword, newPassword, updatePassword).then(async (res) => {
            const userLogin = await login(username, newPassword);
            let user = {
              userProperties: {
                ...userLogin.data.user.userProperties,
                status: Status.ENABLE,
              },
            };
            await saveUser(new AbortController(), user, userLogin.data.user.uuid);
            localStorage.removeItem('token');
            setUpdatePassword(undefined);
            refetchCurrentUser();
            history.push('home');
          });
        } else {
          const loginRes = await performLogin(username, password);
          const authData = loginRes.data;
          const valid = authData && authData.authenticated;
          if (valid == null) {
            localStorage.setItem('token', window.btoa(`${username}:${password}`));
            setUpdatePassword(localStorage.getItem('token'));
          } else if (!valid) throw new Error('Incorrect username or password');
        }
        history.push('home');
      } catch (error) {
        setErrorMessage(error.message);
      }
      return false;
    },
    [username, password, newPassword, oldPassword, confirmPassword, updatePassword],
  );

  return (
    <div className={styles.container}>
      <div className={`${styles['login-card']}`}>
        <div className={styles.titleMhiseg}>
          <h1> MHISEG</h1>
          <h3> Modern Health Information System Expert Group</h3>
        </div>
        <form className={`${styles.form}`} onSubmit={handleSubmit}>
          {updatePassword ? (
            <>
              <h3 className={`${styles.title}`}>{t('changePasswordLabel')}</h3>
              <br />

              <div className={styles.blockInput}>
                <label>{t('oldPassword')}</label>
                <TextInput.PasswordInput
                  className={styles.inputStyle}
                  id={'oldPassword]'}
                  labelText={''}
                  ref={oldPasswordInputRef}
                  required
                  invalidText={t('messageErrorPassword')}
                  onChange={changeOldPassword}
                />
              </div>
              <div className={styles.blockInput}>
                <label>{t('newPassword')}</label>
                <TextInput.PasswordInput
                  className={styles.inputStyle}
                  id={'newPassword]'}
                  labelText={''}
                  ref={newPasswordInputRef}
                  required
                  invalidText={t('messageErrorPassword')}
                  onChange={changeNewPassword}
                />
              </div>
              <div className={styles.blockInput}>
                <label>{t('messageErrorPasswordConfirm')}</label>
                <TextInput.PasswordInput
                  className={styles.inputStyle}
                  id={'confirmPassword]'}
                  labelText={''}
                  ref={confirmPasswordInputRef}
                  required
                  invalidText={t('messageErrorPassword')}
                  onChange={changeConfirmPassword}
                />
              </div>
            </>
          ) : (
            <>
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
              </div>
            </>
          )}
          <div className={styles['center']}>
            <p className={styles['error-msg']}>{t(errorMessage)}</p>
          </div>
          <Button className={styles.loginButton} type="submit">
            {t(updatePassword ? 'changePassword' : 'login')}
          </Button>
          {updatePassword && (
            <div className={styles['need-help']}>
              <p className={styles['need-help-txt']}>
                {t('needAccount', 'Need account?')}
                <ConfigurableLink
                  to="${openmrsBase}/spa/login"
                  className={styles['need-account']}
                  onClick={(e) => {
                    localStorage.removeItem('token');
                  }}>
                  &nbsp;{t('signIn')}
                </ConfigurableLink>
              </p>
            </div>
          )}
        </form>
      </div>
      <span className={styles.footer}>in collaboration with OpenMRS community</span>
    </div>
  );
};
export default Login;
