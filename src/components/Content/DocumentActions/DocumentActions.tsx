import React, { FunctionComponent } from 'react';
import { Button } from '@mui/material';
import { UIFile, useStore } from 'utils/store';
import { getUrlFor } from 'utils/gDrive';
import style from './DocumentActions.module.scss';
import { Icon } from 'ccl/Icon';

interface DocumentActionProps {
  file: UIFile;
}

export const DocumentActions: FunctionComponent<DocumentActionProps> = (props) => {
  const { file } = props;
  const fileViewOnlyLink = getUrlFor(file, 'preview');
  const setActiveDocument = useStore('activeDocument')[1];

  const setCurrentDocumentEditable = () => {
    const editableFile: UIFile = { ...file, currentView: 'embedded' };
    setActiveDocument(editableFile);
  }

  const setCurrentDocumentNonEditable = () => {
    const editableFile: UIFile = { ...file, currentView: 'preview' };
    setActiveDocument(editableFile);
  }

  const toggleEditable = () => {
    if (file.currentView !== 'preview') {
      setCurrentDocumentNonEditable();
    } else {
      setCurrentDocumentEditable();
    }
  }
  return <div className={style.documentActions}>
    <Button className={style.withIcon} size="small" onClick={toggleEditable}>
      {file.currentView === 'preview' ?
        <><Icon name="Edit" fontSize="inherit" />Edit </> :
        <><Icon name="EditOff" fontSize="inherit" />Exit Editing</>
      }
    </Button>
    {file.type === 'presentation' && <a href={fileViewOnlyLink} target="_blank" rel="noreferrer" className={style.externalLink}>
      <Button className={style.withIcon} color="warning" variant="outlined" size="small"><Icon name="PresentToAll"></Icon> Present</Button>
    </a>}
  </div>;
};
