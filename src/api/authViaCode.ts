import type { NextApiRequest, NextApiResponse } from 'next'
import { http } from 'utils/http';

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  authUrl?: string;
  user?: {
    kind: string;
    displayName: string;
    photoLink: string;
    me: boolean;
    permissionId: string;
    emailAddress: string;
  };
}
const getAuthCredentials = () => {
  return import('dotenv').then((dotenv) => {
    dotenv.config();
    return {
      CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID,
      CLIENT_SECRET: process.env.CLIENT_SECRET,
      REDIRECT_URL: process.env.NEXT_PUBLIC_REDIRECT_URL,
    };
  });
};

export const getTokenUsingCode = async (code: string, refreshToken?: string): Promise<TokenResponse> => {
  const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } = await getAuthCredentials();
  if (code) {
    return http.post('https://oauth2.googleapis.com/token', {
      code: code,
      redirect_uri: REDIRECT_URL,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'https://www.googleapis.com/auth/drive openid email',
      grant_type: 'authorization_code',
    }).then((resp) => {
      console.log({ codeResp: resp.data });
      return {
        code,
        accessToken: resp.data.access_token,
        refreshToken: resp.data.refresh_token,
      };
    }).catch((err) => {
      console.log({ codeErr: err });
      throw err;
    });
  } else if (refreshToken) {
    throw 'Code not found';
  }
}

export const getAuthUrl = async () => {
  const { CLIENT_ID, REDIRECT_URL } = await getAuthCredentials();
  const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
  const OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount';
  const STATIC_PARAMS = '&prompt=consent&response_type=code&access_type=offline&flowName=GeneralOAuthFlow';
  return `${OAUTH_BASE_URL}?redirect_uri=${REDIRECT_URL}&client_id=${CLIENT_ID}&scope=${DRIVE_SCOPE}${STATIC_PARAMS}`;
}

export const getUserDetails = async (accessToken: string) => {
  try {
    const userInfo = await http.get('https://www.googleapis.com/drive/v3/about?fields=*', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    return userInfo.data.user;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export const authViaCode = async (req: NextApiRequest, res: NextApiResponse) => {
  const { code } = req.query;
  let authResponse: TokenResponse;
  try {
    authResponse = await getTokenUsingCode(code as string);
    authResponse.user = await getUserDetails(authResponse.accessToken);
  } catch {
    authResponse = {
      accessToken: 'REFRESH_TOKEN_NOT_FOUND',
      authUrl: await getAuthUrl(),
    }
  }
  if (authResponse.accessToken === 'REFRESH_TOKEN_NOT_FOUND') {
    authResponse.authUrl = await getAuthUrl();
  }
  res.status(200).json(authResponse)
}
