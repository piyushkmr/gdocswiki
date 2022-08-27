import React from 'react';
import { useStore } from 'utils/store';
import { getUrlFor } from 'utils/gDrive';
import style from './DocumentViewer.module.scss';
import { DocumentActions } from '../DocumentActions';
import Head from 'next/head';

export const DocumentViewer = () => {
  const [activeDocument] = useStore('activeDocument');
  return activeDocument ?
    <div className={style.documentContainer}>
      <Head>
        <title>{activeDocument.name} - GDocsWiki</title>
      </Head>
      <div className={style.documentHeader}>
        <h2 className={style.documentName}>
          <img src={activeDocument.iconLink} alt="Google Doc Icon" />
          {activeDocument.name}
        </h2>
        <DocumentActions file={activeDocument}  />
      </div>
      <iframe
        onLoad={() => { console.log('iframeLoaded') }}
        src={getUrlFor(activeDocument, activeDocument.currentView)}
        className={style.documentViewer}
      ></iframe>
    </div> : null
};

