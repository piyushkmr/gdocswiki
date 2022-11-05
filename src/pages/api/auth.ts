import type { NextApiRequest, NextApiResponse } from 'next'

const getAuthCredentials = () => {
  require('dotenv').config();
  return {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URL: process.env.REDIRECT_URL,
  };
};

const getAuthUrl = () => {
  const { CLIENT_ID, REDIRECT_URL } = getAuthCredentials();
  const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
  const OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount';
  const STATIC_PARAMS = '&prompt=consent&response_type=code&access_type=offline&flowName=GeneralOAuthFlow';
  return `${OAUTH_BASE_URL}?redirect_uri=${REDIRECT_URL}&client_id=${CLIENT_ID}&scope=${DRIVE_SCOPE}${STATIC_PARAMS}`;
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  const authUrl = getAuthUrl();
  res.status(200).json({ authUrl });
}
