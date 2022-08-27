import { DialogService } from 'ccl/Dialog';
import { deleteFile } from 'utils/gDrive';
import { UIFile } from 'utils/store';
import { ContextMenuItemId } from './renderItemConstants';

export const contextMenuOpenInNewTab = (file: UIFile) => {
  window.open(file.webViewLink, '_blank');
};

export const contextMenuDelete = (file: UIFile) => {
  return DialogService.open({
    title: `Delete file ${file.name}?`,
    content: 'Are you sure you want to permanently delete this file?',
    actions: [{
      id: 'delete',
      label: 'Delete',
      color: 'error',
      type: 'primary',
    }, {
      id: 'cancel',
      label: 'Cancel',
      type: 'secondary',
    }],
  }).then(() => {
    return deleteFile(file.id);
  });
};

