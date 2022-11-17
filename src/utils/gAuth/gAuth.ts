import { useEffect, useState } from 'react';
import { http } from '../http';
import { singletonHook } from 'react-singleton-hook';
import { sprintf } from 'sprintf-js';
import { getUserDetailsFromAccessToken, UserDetails } from './gAuthApi';

const API_BASE = 'https://localhost:3000/api';

const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

const LOCAL_STORAGE = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
}

const AUTH_API = {
  GET_TOKEN: `${API_BASE}/authViaCode?code=%(code)s&refreshToken=%(refreshToken)s`,
};

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  authUrl?: string;
  user?: UserDetails;
}

const getToken = (code: string, refreshToken = '') => {
  return http.get<TokenResponse>(sprintf(AUTH_API.GET_TOKEN, { code, refreshToken })).then((resp) => resp.data);
}

const getAuthUrl = () => {
  const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
  const OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount';
  const STATIC_PARAMS = '&prompt=consent&response_type=code&access_type=offline&flowName=GeneralOAuthFlow';
  return `${OAUTH_BASE_URL}?redirect_uri=${REDIRECT_URL}&client_id=${CLIENT_ID}&scope=${DRIVE_SCOPE}${STATIC_PARAMS}`;
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
  userDetails?: UserDetails;
}

const initialState: GAuthState = {
  isAuthenticated: false,
  isAuthenticating: true,
}

const checkAccessToken = async () => {
  const accessTokenFromLocalStorage = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN);
  if (accessTokenFromLocalStorage) {
    return getUserDetailsFromAccessToken(accessTokenFromLocalStorage);
  } else {
    return Promise.reject();
  }
}

const getGAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>();
  const [authPromise, setAuthPromise] = useState<Promise<string | void>>();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authUrl, setAuthUrl] = useState<string>();
  const [authError, setAuthError] = useState<string>();
  const [userDetails, setUserDetails] = useState<UserDetails>();

  const performAuth = async () => {
    /**
     * access_token -> refresh_token -> authUrl -> code -> refresh_token/access_token
     */
    
    checkAccessToken().then((userData) => {
      setIsAuthenticated(true);
      setUserDetails(userData);
    }).catch(() => { // accessToken is invalid, check from refresh_token or code
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      return getAccessCodes(authCode).then((accessCodes) => {
        const accessToken = accessCodes.accessToken;
        if (accessToken === 'REFRESH_TOKEN_NOT_FOUND') {
          console.log(`Error getting access token: ${accessToken}`);
          setAuthUrl(getAuthUrl());
          setAuthError(accessToken);
        } else {
          setIsAuthenticated(true);
          setAccessToken(accessToken);
          setUserDetails(accessCodes.user)
          return checkAccessToken();
        }
      });
    }).finally(() => {
      setIsAuthenticating(false);
    });
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
    userDetails,
  }
};

export const useGAuth = singletonHook<GAuthState>(initialState, getGAuth);
