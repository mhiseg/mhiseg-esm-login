import { Logout32 } from '@carbon/icons-react';
import { getLoggedInUser, openmrsFetch, refetchCurrentUser } from '@openmrs/esm-framework';
import { useCurrentUser } from '../CurrentUserContext';
const BASE_WS_API_URL = '/ws/rest/v1/';
export enum Status {
  ENABLE = 'enable',
  DISABLED = 'disabled',
  WAITING = 'waiting',
}

export async function performLogin(username, password, isUpdate?) {
  const userLogin = await login(username, password);
  if (userLogin?.data?.user?.userProperties?.status == Status.WAITING) {
    return logout();
  } else {
    refetchCurrentUser();
    return userLogin;
  }
}

export function login(username, password) {
  const token = window.btoa(`${username}:${password}`);
  return openmrsFetch(`/ws/rest/v1/session`, {
    headers: {
      Authorization: `Basic ${token}`,
    },
  });
}
export async function updatePasswordUser(
  abortController: AbortController,
  oldPassword: string,
  newPassword: string,
  token: string,
) {
  return openmrsFetch(`${BASE_WS_API_URL}password`, {
    method: 'POST',
    body: {
      oldPassword: oldPassword,
      newPassword: newPassword,
    },
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}

export function saveUser(abortController: AbortController, user, uuid?: string) {
  return openmrsFetch(`${BASE_WS_API_URL}user/${uuid}`, {
    method: 'POST',
    body: user,
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
  });
}

function logout() {
  return openmrsFetch('/ws/rest/v1/session', { method: 'DELETE' });
}
