import React from 'react';
import { DialogService } from './DialogService';

interface DialogPortalState {
  dialogContent: JSX.Element;
}

interface DialogPortalProps {
  containerSelector?: string;
}

export class DialogPortal extends React.Component<DialogPortalProps, DialogPortalState> {
  dialogContainer?: HTMLDivElement;
  state = {
    dialogContent: <></>,
  };

  componentDidUpdate() {
    if (!this.dialogContainer) {
      const containerSelector = this.props.containerSelector || 'dialog-container';
      const el = document.querySelector<HTMLDivElement>(containerSelector);
      if (el) {
        this.dialogContainer = el;
      } else {
        const body = document.querySelector<HTMLBodyElement>('body');
        const dialogContainer = document.createElement('div') as HTMLDivElement;
        dialogContainer.id = containerSelector;
        body.appendChild(dialogContainer);
        this.dialogContainer = dialogContainer;
      }
    }
    DialogService.injectDialogContentMountPoint(this.setDialogContent);
  }

  setDialogContent = (dialogContent: JSX.Element) => {
    this.setState({ dialogContent });
  };

  render() {
    return this.state.dialogContent;
  }
}
