import config from '../config';
import axios from 'axios';

const { apiBase, apiRequestTimeout, authentication } = config;

const sparkpostRequest = axios.create({
  baseURL: apiBase,
  timeout: apiRequestTimeout
});

// TODO handle timeout error better

function useRefreshToken(refresh_token) {
  return sparkpostRequest({
    method: 'POST',
    url: '/authenticate',
    data: `grant_type=refresh_token&refresh_token=${refresh_token}`,
    headers: authentication.headers
  });
}

function sparkpostLogin(username, password, rememberMe) {
  username = encodeURIComponent(username);
  password = encodeURIComponent(password);
  const data = `grant_type=password&username=${username}&password=${password}&rememberMe=${rememberMe}`;
  
  return sparkpostRequest({
    method: 'POST',
    url: '/authenticate',
    data,
    headers: authentication.headers
  });
}

export { sparkpostRequest, sparkpostLogin, useRefreshToken };