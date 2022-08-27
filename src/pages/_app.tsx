import { getCssTheme } from 'ccl/style/getCssTheme';
import React, { useEffect, useState } from 'react';
import { DialogPortal } from 'ccl/Dialog';
import Head from 'next/head'
import '../components/theme.scss';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  const [cssTheme, setCssTheme] = useState('');
  useEffect(() => {
    setCssTheme(getCssTheme());
  }, []);

  return <>
    <Head>
      <title>GDocsWiki</title>
    </Head>  
    <style>{`:root {${cssTheme}}`}</style>    
    <Component {...pageProps} />
    <DialogPortal />
  </>;
}
