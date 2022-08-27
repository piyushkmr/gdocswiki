import React, { FunctionComponent, useEffect } from 'react';
import { useGAuth } from 'utils/gAuth';
import { getFilesInFolder } from 'utils/gDrive';
import { useStore, useStoreFiles, UIFile } from 'utils/store';
import { RenderTree } from './RenderTree';
import style from './Sidebar.module.scss';


export const Sidebar: FunctionComponent = () => {
  const { isAuthenticated } = useGAuth();
  const setActiveDocument = useStore('activeDocument')[1];
  const { fileTree, isFolderOpen, setFolderOpen, addFiles } = useStoreFiles();

  useEffect(() => {
    if (isAuthenticated) {
      getFilesInFolder('1JcklaK-m-KL-khbFGA4egX-NnH0fprl5').then((files) => addFiles(files, '1JcklaK-m-KL-khbFGA4egX-NnH0fprl5'));
    }
  }, [isAuthenticated]);

  const toggleFolderOpen = (fileId: string) => {
    const newFolderState = !isFolderOpen(fileId);
    setFolderOpen(fileId, newFolderState);
    return newFolderState;
  }
  const onDocumentClick = (file: UIFile) => {
    if (file.type === 'folder') {
      const isOpen = toggleFolderOpen(file.id);
      if (isOpen && file.children?.length === 0) {
        getFilesInFolder(file.id).then((files) => addFiles(files, file.id));
      }
    } else {
      const activeDocument: UIFile = { ...file, currentView: 'preview'}
      setActiveDocument(activeDocument);
    }
  }

  return isAuthenticated ?
    <div className={style.sidebar}>
      <RenderTree tree={fileTree} onItemClick={onDocumentClick} />
    </div> : null;
};
