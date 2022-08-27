import React from 'react';
import { DialogContainer, DialogContainerProps, DialogState, ActionConfig } from './DialogContainer';
import { DialogPromise } from './DialogPromise';

export type DialogServiceProps
  <InjectedState = Record<string, any>, ExternalProps = Record<string, any>, > = DialogContainerProps<InjectedState, ExternalProps>;

type NoObject = Record<string, unknown>;

class DialogCreator {
  dialogContainer?: HTMLDivElement;
  dialogContainerSelector: string;
  closeTrigger?: () => Promise<any>;
  mountDialogContent?: any;
  isClosing = false;

  constructor(dialogContainerSelector: string) {
    this.dialogContainerSelector = dialogContainerSelector;
  }

  onInit = () => {
    if (!this.dialogContainer) {
      const el = document.querySelector<HTMLDivElement>(this.dialogContainerSelector);
      if (el) {
        this.dialogContainer = el;
      } else {
        const body = document.querySelector<HTMLBodyElement>('body');
        const dialogContainer = document.createElement('div') as HTMLDivElement;
        dialogContainer.id = this.dialogContainerSelector;
        body.appendChild(dialogContainer);
        this.dialogContainer = dialogContainer;
      }
    }
  };

  setDialogContent = (dialogContent: JSX.Element) => {
    if (this.mountDialogContent) {
      this.mountDialogContent(dialogContent);
    }
  };

  injectDialogContentMountPoint = (setter: any) => {
    this.mountDialogContent = setter;
  };

  unmountDialog = () => {
    this.isClosing = true;
    let closePromise = Promise.resolve();
    if (this.closeTrigger) {
      closePromise = this.closeTrigger();
    }
    return closePromise.then(() => {
      this.setDialogContent(<></>);
      this.isClosing = false;
    });
  };

  onClose = () => {
    return this.unmountDialog();
  };

  setCloseTrigger = (closeTrigger: () => Promise<unknown>) => {
    this.closeTrigger = closeTrigger;
  };

  open<InjectedState = NoObject, ExternalProps = NoObject>(options: DialogServiceProps<InjectedState, ExternalProps>) {
    this.isClosing = false;
    this.onInit();
    return new DialogPromise<{action: ActionConfig, state: DialogState<InjectedState>}>((resolve, reject) => {
      const onClose = (reason?: 'cancelButton' | 'backdropClick' | 'escapeKeyDown' | 'crossButton') => {
        reject(reason);
        this.unmountDialog();
      };

      const onSuccess = (action: ActionConfig, state: DialogState<InjectedState>) => {
        return resolve({action, state});
      };

      const dialogContent = <DialogContainer<InjectedState, ExternalProps>
        title={options.title}
        content={options.content}
        onClose={onClose}
        onSuccess={onSuccess}
        hideCloseIcon={options.hideCloseIcon}
        actions={options.actions}
        size={options.size}
        fullWidth={options.fullWidth}
        disableAutoClose={options.disableAutoClose}
        props={options.props}
        initialState={options.initialState}
        setCloseTrigger={this.setCloseTrigger}
      />;

      this.setDialogContent(dialogContent);
    });
  }
}

export const DialogService = new DialogCreator('dialog-container');
