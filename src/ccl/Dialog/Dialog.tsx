import React, { FunctionComponent } from 'react';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogActions from '@mui/material/DialogActions';
import MuiDialogContent from '@mui/material/DialogContent';
import { Icon } from 'ccl/Icon';
import style from './Dialog.module.scss';
import { LinearProgress } from '@mui/material';

export interface DialogProps {
  open: boolean;
  title?: JSX.Element | string;
  content: JSX.Element | string;
  actions?: JSX.Element;
  hideCloseIcon?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disableAutoClose?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  onClose: (event: any, reason: 'backdropClick' | 'escapeKeyDown' | 'crossButton') => void;
}

export const DialogTitle: FunctionComponent<any> = (props) => {
  const displayCrossButton = !props.hideCloseIcon;

  return <div className={style.dialogTitle}>
    <h3 className={style.dialogTitleName}>{props.children}</h3>
    {displayCrossButton &&
      <span className={style.dialogClose} onClick={(e) => props.onClose(e, 'crossButton')} >
        <Icon name="Close" />
      </span>}
  </div>;
};

export const Dialog: FunctionComponent<DialogProps> = (props) => {
  const { open, title, content, actions, size, onClose, fullWidth, isLoading } = props;
  return <MuiDialog
    open={open}
    maxWidth={size}
    scroll={'paper'}
    onClose={onClose}
    aria-labelledby="dialog-title"
    fullWidth={fullWidth}
    className={style.dialogContainer}
  >
    {title && <DialogTitle {...props}>{title}</DialogTitle>}
    <MuiDialogContent className={style.dialogBody}>
      {content}
    </MuiDialogContent>
    { actions &&
      <MuiDialogActions
        disableSpacing
        className={style.dialogActions}
      >
        {actions}
      </MuiDialogActions>
    }
    {isLoading && <LinearProgress variant="indeterminate" />}
  </MuiDialog>;
};

export default Dialog;
