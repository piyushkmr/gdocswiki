import React from 'react';
import { Sidebar } from 'components/Sidebar';
import { useGAuth } from 'utils/gAuth';
import style from './App.module.scss';
import { DialogPortal } from 'ccl/Dialog';
import { DocumentViewer } from './Content';
import { useRouter } from 'next/router'

const App = () => {
  const { authError } = useGAuth();
  const router = useRouter();

  if (authError) {
    router.push('/login?src=unauthenticated');
    return null;
  }

  return <div className={style.app}>    
    {
      authError ?
        <a href="/login?src=unauthenticated">Redirect to Login</a> :
        <div className={style.appContent}>
          <DialogPortal />
          <Sidebar />
          <DocumentViewer />
        </div>
    }
  </div>
};

export default App;
