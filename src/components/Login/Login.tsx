import React, { useEffect } from 'react';
import { useGAuth } from 'utils/gAuth';
import style from './Login.module.scss';
import Head from 'next/head'

const GoogleSignInButton = () => {
  const { authUrl } = useGAuth();
  return <a href={authUrl} className={style.googleSignInButtonLink}>
    <button className={style.googleSignInButton}>
      <span className={style.googleLogo}></span>
      Sign in with Google
    </button>
  </a>;
}

const Loader = () => {
  return <div className={style.loader}></div>;
};

const UserData = () => {
  const { userDetails: { user } } = useGAuth();
  
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        window.location.href = '/';
      }, 750);
    }
  }, [])

  return <div className={style.userContainer}>
    <div className={style.userAvatar}>
      {user.photoLink && <img src={user.photoLink} alt={user.displayName} referrerPolicy="no-referrer" />}
    </div>
    <div className="userName">{user.displayName}</div>
  </div>;
};

export const Login = () => {
  const { isAuthenticating, isAuthenticated, userDetails, authError } = useGAuth();

  return <div className={style.app}>
    <Head>
      <title>Login - GDocsWiki</title>
    </Head>    
    <div className={style.signInContainer}>
      <div className={style.appName}>GDocsWiki</div>
      <div className={style.signInHeading}>Sign In</div>
      {isAuthenticating && <div className={style.loaderContainer}><Loader /></div>}
      {authError && <GoogleSignInButton />}
      {isAuthenticated && userDetails && <UserData />}
    </div>
  </div>
};
