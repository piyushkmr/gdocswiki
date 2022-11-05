import { useEffect, useState } from 'react';
import { http } from './http';
import { singletonHook } from 'react-singleton-hook';
import { sprintf } from 'sprintf-js';

// mongodb+srv://gdocswikiuser:uihwEblsF6cdPUkh@gdocswiki0.m5awmza.mongodb.net/?retryWrites=true&w=majority

const API_BASE = 'https://localhost:3000/api';


const LOCAL_STORAGE = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
}

const AUTH_API = {
  GET_TOKEN: `${API_BASE}/getToken?code=%(code)s&refreshToken=%(refreshToken)s`,
};

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  authUrl?: string;
}

const getToken = (code: string, refreshToken = '') => {
  return http.get<TokenResponse>(sprintf(AUTH_API.GET_TOKEN, { code, refreshToken })).then((resp) => resp.data);
}

export const getAccessCodes = async (code?: string) => {
  const refreshTokenLocal = localStorage.getItem(LOCAL_STORAGE.REFRESH_TOKEN);
  const tokenResponse = await getToken(code, refreshTokenLocal);
  const {accessToken, refreshToken} = tokenResponse;
  if (accessToken !== 'REFRESH_TOKEN_NOT_FOUND') {
    http.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
    localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, accessToken);
    localStorage.setItem(LOCAL_STORAGE.REFRESH_TOKEN, refreshToken);
  }
  return tokenResponse;
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
    return getAccessCodes(authCode).then((respAccess) => {
      const { accessToken, authUrl } = respAccess;
      if (accessToken === 'REFRESH_TOKEN_NOT_FOUND') {
        console.log(`Error getting access token: ${accessToken}`);
        setAuthUrl(authUrl);
        setAuthError(accessToken);
      } else {
        setIsAuthenticated(true);
        setAccessToken(accessToken);
        return accessToken;
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
