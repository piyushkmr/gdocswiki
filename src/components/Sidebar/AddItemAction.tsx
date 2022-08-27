import React from 'react';
import { Icon } from 'ccl/Icon';
import { FunctionComponent } from 'react';
import { UIFile, useStoreFiles } from 'utils/store';
import './AddItemAction.module.scss';
import { DialogService } from 'ccl/Dialog';
import { ActionMenu } from 'ccl/ActionMenu';
import { TextField } from '@mui/material';
import { createGoogleDocument } from 'utils/gDrive';

interface AddItemActionProps {
  file: UIFile;
}

const GDOCS_ICONS = {
  FOLDER: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder',
  DOCUMENT: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
  SLIDES: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation',
  SPREADSHEET: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.spreadsheet',
};

const addActionItems = [{
  icon: GDOCS_ICONS.DOCUMENT,
  label: 'Google Docs',
  id: 'googleDocs',
}, {
  icon: GDOCS_ICONS.SPREADSHEET,
  label: 'Google Sheets',
  id: 'googleSheets',
}, {
  icon: GDOCS_ICONS.SLIDES,
  label: 'Google Slides',
  id: 'googleSlides',
}];

interface AddDocDialogState {
  docName: string;
}
const openDialog = (selection: string, file: UIFile) => {
  const selectedItem = addActionItems[selection];
  return DialogService.open<AddDocDialogState>({
    title: `Create ${selectedItem.label}`,
    content: ({ state }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        state.setState({ docName: e.target.value });
      }
      return <div>
        <p>This fill will be created inside <b>{file.name}</b> folder, and will have same permissions.</p>
        <TextField name="docName" label="Doc Name" onChange={handleChange} />
      </div>;
    },
    actions: [{
      id: 'ok',
      label: 'Create',
      type: 'primary',
    }, {
      id: 'cancel',
      label: 'Cancel',
      type: 'secondary',
    }]
  }).then(({ state }) => {
    if (state.docName) {
      return createGoogleDocument({ title: state.docName, parentFolder: file.id });
    }
  });
}

export const AddItemAction: FunctionComponent<AddItemActionProps> = (props) => {
  const { file } = props;
  const { addFiles } = useStoreFiles();

  const handleMenuSelect = (selection: string) => {
    openDialog(selection, file).then((addedFile) => {
      addFiles([addedFile], file.id, true);
    });
  };

  return file.type === 'folder' ? <>
    <ActionMenu items={addActionItems} onSelection={handleMenuSelect}>
      <Icon name="Add" />
    </ActionMenu>
  </> : null;
};
