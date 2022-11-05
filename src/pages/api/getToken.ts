import type { NextApiRequest, NextApiResponse } from 'next'
import { http } from 'utils/http';

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  authUrl?: string;
}
const getAuthCredentials = () => {
  require('dotenv').config();
  return {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URL: process.env.REDIRECT_URL,
  };
};

const getTokenFromRefresh = (refreshToken: string): Promise<TokenResponse> => {
  const {CLIENT_ID, CLIENT_SECRET } = getAuthCredentials();
  if (refreshToken) {
    return http.post('https://oauth2.googleapis.com/token', {
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
    }).then((resp) => {
      console.debug({ refreshResponse: resp.data });
      return {
        accessToken: resp.data.access_token,
      }
    });
  } else {
    return Promise.resolve({
      accessToken: 'REFRESH_TOKEN_NOT_FOUND'
    });
  }
}

const getTokenUsingCode = (code: string, refreshToken?: string): Promise<TokenResponse> => {
  const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = getAuthCredentials();
  if (code) {
    return http.post('https://oauth2.googleapis.com/token', {
      code: code,
      redirect_uri: REDIRECT_URL,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'https://www.googleapis.com/auth/drive',
      grant_type: 'authorization_code',
    }).then((resp) => {
      console.debug({ codeResp: resp.data });
      return {
        code,
        accessToken: resp.data.access_token,
        refreshToken: resp.data.refresh_token,
      };
    }).catch(() => {
      return getTokenFromRefresh(refreshToken);
    });
  } else if (refreshToken) {
    return getTokenFromRefresh(refreshToken);
  }
}

const getAuthUrl = () => {
  const { CLIENT_ID, REDIRECT_URL } = getAuthCredentials();
  const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
  const OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount';
  const STATIC_PARAMS = '&prompt=consent&response_type=code&access_type=offline&flowName=GeneralOAuthFlow';
  return `${OAUTH_BASE_URL}?redirect_uri=${REDIRECT_URL}&client_id=${CLIENT_ID}&scope=${DRIVE_SCOPE}${STATIC_PARAMS}`;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { refreshToken, code } = req.query;
  let authResponse: TokenResponse;
  try {
    authResponse = await getTokenUsingCode(code as string, refreshToken as string);
  } catch {
    authResponse = {
      accessToken: 'REFRESH_TOKEN_NOT_FOUND',
      authUrl: getAuthUrl(),
    }
  }
  if (authResponse.accessToken === 'REFRESH_TOKEN_NOT_FOUND') {
    authResponse.authUrl = getAuthUrl();
  }
  res.status(200).json(authResponse)
}
