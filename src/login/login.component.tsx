import { ConfigurableLink, refetchCurrentUser } from '@openmrs/esm-framework';
import { Form, TextInput, Button, PasswordInput } from 'carbon-components-react';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, StaticContext } from 'react-router';
import * as Yup from 'yup';
import { useCurrentUser } from '../CurrentUserContext';
import styles from '../styles.scss';
import { updatePasswordUser, login, Status, saveUser, performLogin, logout } from './login.resource';

export interface LoginReferrer {
  referrer?: string;
}

export interface LoginProps extends RouteComponentProps<{}, StaticContext, LoginReferrer> {
  isLoginEnabled: boolean;
}

const Login: React.FC<LoginProps> = ({ history, isLoginEnabled }) => {
  const { t } = useTranslation();
  const abortController = new AbortController();
  const [user, setUser] = useState(useCurrentUser());
  const [updatePassword, setUpdatePassword] = React.useState(localStorage.getItem('token'));
  const [errorMessage, setErrorMessage] = React.useState('');

  const [initialV, setInitialValue] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    username: '',
    password: '',
  });

  const authSchema = Yup.object().shape({
    oldPassword: Yup.string(),
    newPassword: Yup.string()
      .min(8, t('messageErrorPasswordMin'))
      .max(50, 'messageErrorPasswordMax')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/, t('messageErrorPasswordFormat')),
    confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], t('messageErrorIdenticPassword')),
  });

  useEffect(() => {
    if (user) {
      history.push(user?.userProperties?.defaultPage || '/home');
    } else {
      history.replace('/login');
    }
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (updatePassword) {
        if (values.oldPassword === values.newPassword) throw new Error('messageErrorIdentic');
        updatePasswordUser(new AbortController(), values.oldPassword, values.newPassword, updatePassword).then(
          async (res) => {
            const userLogin = await login(values.username, values.newPassword);
            let user = {
              userProperties: {
                ...userLogin?.data?.user?.userProperties,
                status: Status.ENABLE,
              },
            };
            await saveUser(new AbortController(), user, userLogin.data.user.uuid);
            localStorage.removeItem('token');
            setUpdatePassword(undefined);
            refetchCurrentUser();
            history.push(user?.userProperties?.defaultPage || 'home');
          },
        );
      } else {
        const loginRes = await performLogin(values.username, values.password);
        const authData = loginRes?.data;
        const valid = authData && authData.authenticated;
        if (valid == null || valid === undefined) {
          localStorage.setItem('token', window.btoa(`${values.username}:${values.password}`));
          setUpdatePassword(localStorage.getItem('token'));
        } else if (!valid) {
          throw new Error(t('messageErrorUsernameOrPassword'));
        }
        history.push(authData?.user?.userProperties?.defaultPage || '/home');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={`${styles['login-card']}`}>
          <div className={styles.titleMhiseg}>
            <h1> MHISEG</h1>
            <h3> Modern Health Information System Expert Group</h3>
          </div>
          <Formik
            enableReinitialize
            initialValues={initialV}
            validationSchema={authSchema}
            onSubmit={(values) => {
              // alert(0)
              handleSubmit(values);
            }}>
            {(formik) => {
              const { values, handleSubmit, isValid, dirty, errors, touched, handleChange } = formik;
              return (
                <Form name="form" className={`${styles.form}`} onSubmit={handleSubmit}>
                  {updatePassword ? (
                    <>
                      <h3 className={`${styles.title}`}>{t('changePasswordLabel')}</h3>
                      <br />

                      <div className={styles.blockInput}>
                        <label>{t('oldPassword')}</label>
                        <PasswordInput
                          className={styles.inputStyle}
                          id={'oldPassword]'}
                          name="oldPassword"
                          required={true}
                          labelText={''}
                          invalid={errors.oldPassword && touched.oldPassword}
                          invalidText={errors.oldPassword}
                          value={values.oldPassword}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.blockInput}>
                        <label>{t('newPassword')}</label>
                        <PasswordInput
                          className={styles.inputStyle}
                          required={true}
                          id={'newPassword]'}
                          name="newPassword"
                          labelText={''}
                          invalid={errors.newPassword && touched.newPassword}
                          invalidText={errors.newPassword}
                          value={values.newPassword}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.blockInput}>
                        <label>{t('passwordConfirm')}</label>
                        <PasswordInput
                          className={styles.inputStyle}
                          required={true}
                          id={'confirmPassword]'}
                          name="confirmPassword"
                          labelText={''}
                          invalid={errors.confirmPassword && touched.confirmPassword}
                          invalidText={errors.confirmPassword}
                          value={values.confirmPassword}
                          onChange={handleChange}
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
                          invalidText={errors.username}
                          value={values.username}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.blockInput}>
                        <label>{t('password')}</label>
                        <PasswordInput
                          className={styles.inputStyle}
                          id={'password]'}
                          labelText={''}
                          required
                          invalidText={errors.password}
                          value={values.password}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                  {isValid && (
                    <div className={styles['center']}>
                      <p className={styles['error-msg']}>{t(errorMessage)}</p>
                    </div>
                  )}
                  <Button className={styles.loginButton} type="submit" isSelected={true}>
                    {t(updatePassword ? 'changePassword' : 'login')}
                  </Button>

                  {updatePassword && (
                    <div className={styles['need-help']}>
                      <p className={styles['need-help-txt']}>
                        {t('needAccount', 'Need account?')}
                        <ConfigurableLink
                          to="${openmrsBase}/spa/login"
                          className={styles['need-account']}
                          onClick={async (e) => {
                            localStorage.removeItem('token');
                            await logout();
                          }}>
                          &nbsp;{t('signIn')}
                        </ConfigurableLink>
                      </p>
                    </div>
                  )}
                </Form>
              );
            }}
          </Formik>
        </div>
        <span className={styles.footer}>in collaboration with OpenMRS community</span>
      </div>
    </>
  );
};

export default Login;
