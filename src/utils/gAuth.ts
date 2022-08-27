import { useEffect, useState } from 'react';
import { http } from './http';
import { singletonHook } from 'react-singleton-hook';

const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URL = 'https://localhost:3000';

const LOCAL_STORAGE = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
}
const getTokenUsingCode = (code: string) => {
  return http.post('https://oauth2.googleapis.com/token', {
    code: code,
    redirect_uri: REDIRECT_URL,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://www.googleapis.com/auth/drive',
    grant_type: 'authorization_code',
  }).then((resp) => {
    console.debug({ codeResp: resp.data });
    localStorage.setItem('code', code);
    localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, resp.data.access_token);
    localStorage.setItem(LOCAL_STORAGE.REFRESH_TOKEN, resp.data.refresh_token);
    return resp.data.access_token as string;
  }).catch(() => {
    return getTokenFromRefresh();
  });
}

const getTokenFromRefresh = () => {
  const refreshToken = localStorage.getItem(LOCAL_STORAGE.REFRESH_TOKEN);
  if (refreshToken) {
    return http.post('https://oauth2.googleapis.com/token', {
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
    }).then((resp) => {
      console.debug({ refreshResponse: resp.data });
      localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, resp.data.access_token);
      return resp.data.access_token as string;
    });
  } else {
    return Promise.resolve('REFRESH_TOKEN_NOT_FOUND');
  }
}

export const getAccessToken = (code?: string) => {
  let authPromise: Promise<string>;
  if (code) {
    authPromise = getTokenUsingCode(code);
  } else {
    authPromise = getTokenFromRefresh();
  }
  authPromise.then((accessToken) => {
    if (accessToken !== 'REFRESH_TOKEN_NOT_FOUND') {
      http.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return accessToken;
  });
  return authPromise;
}

const getAuthUrl = () => {
  const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
  const OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount';
  const STATIC_PARAMS = '&prompt=consent&response_type=code&access_type=offline&flowName=GeneralOAuthFlow';
  return `${OAUTH_BASE_URL}?redirect_uri=${REDIRECT_URL}&client_id=${CLIENT_ID}&scope=${DRIVE_SCOPE}${STATIC_PARAMS}`;
}

interface GAuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  accessToken?: string;
  authPromise?: Promise<string | void>;
  authUrl?: string;
  authError?: string;
}
const initialState: GAuthState = {
  isAuthenticated: false,
  isAuthenticating: true,
}
const getGAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>();
  const [authPromise, setAuthPromise] = useState<Promise<string | void>>();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authUrl, setAuthUrl] = useState<string>();
  const [authError, setAuthError] = useState<string>();

  const performAuth = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    return getAccessToken(authCode).then((respAccessToken) => {
      if (respAccessToken === 'REFRESH_TOKEN_NOT_FOUND') {
        console.log(`Error getting access token: ${respAccessToken}`);
        setAuthUrl(getAuthUrl());
        setAuthError(respAccessToken);
      } else {
        setIsAuthenticated(true);
        setAccessToken(respAccessToken);
        return respAccessToken;
      }
    }).finally(() => {
      setIsAuthenticating(false);
    })
  }

  useEffect(() => {
    http.interceptors.response.use((response) => response, (error) => {
      if (error.status === 401) {
        return performAuth();
      } else {
        return Promise.reject(error);
      }
    });
  }, []);

  useEffect(() => {
    if (!authPromise) {
      setAuthPromise(performAuth());
    }
  }, [])

  return {
    isAuthenticated,
    accessToken,
    authPromise,
    isAuthenticating,
    authUrl,
    authError,
  }
};

export const useGAuth = singletonHook<GAuthState>(initialState, getGAuth);
