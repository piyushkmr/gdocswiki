import React from 'react';
import { useGAuth } from 'utils/gAuth';
import style from './Login.module.scss';
import Head from 'next/head'

export const Login = () => {
  const { authUrl } = useGAuth();

  return <div className={style.app}>
    <Head>
      <title>Login - GDocsWiki</title>
    </Head>    
    <div className={style.signInContainer}>
      <div className={style.appName}>GDocsWiki</div>
      <div className={style.signInHeading}>Sign In</div>
      <a href={authUrl} className={style.googleSignInButtonLink}>
        <button className={style.googleSignInButton}>
          <span className={style.googleLogo}></span>
          Sign in with Google
        </button>
      </a>
    </div>
  </div>
};
