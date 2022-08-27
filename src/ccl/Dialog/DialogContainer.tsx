import React, { MouseEventHandler, ComponentType } from 'react';
import Dialog from './Dialog';
import { ActionsRenderer } from './DialogActions';
import { StringWith } from 'utils/types';
interface DialogContainerBaseState {
  open: boolean;
}

type DialogContainerState<InjectedState> = DialogContainerBaseState | Partial<InjectedState>;
interface InternalState {
  dialogLoadingButtonId?: string;
  error?: string;
}
export type DialogState<InjectedState> = InjectedState & InternalState & {
  setState: (newState: Partial<InjectedState | InternalState>) => void;
};
/**
 * External Arguments injected via dialogService `options`
 * `props`: External injected props while invoking dialogService
 * `state`: Internally managed state via component or actions
 */
export interface DialogRendererProps<InjectedState, ExternalProps> {
  props?: ExternalProps;
  state: DialogState<InjectedState>;
}

export type JSXRenderer<InjectedState, ExternalProps> = ComponentType<DialogRendererProps<InjectedState, ExternalProps>>;
export type ActionButtonBuilder<InjectedState, ExternalProps> = (args: DialogRendererProps<InjectedState, ExternalProps>) => ActionConfig[];

export interface ActionConfig {
  /**
   * Use `cancel` to reject the promise.
   * There can be only one `cancel`.
   *
   * Use `ok` or any other string to resolve the dialog promise.
   *
   * Use `delete` to highlight the button as red. You can also override the button `color: 'danger'`.
   */
  id: StringWith<'ok' | 'cancel' | 'delete'>;
  label: string;
  /**
   * `primary` - Container button, best for Primary button
   *
   * `secondary` - Outline button, best for Cancel action
   *
   * `tertiary` - Best for actions that are best to be avoided or hidden.
   *
   * `menu` - Show 3-dot in title. Action will not Close the dialog.
   *  You will have to manually call `DialogService.onClose()` to close the dialog box;
   */
  type: 'primary' | 'secondary' | 'tertiary' | 'menu';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  name?: string;
  /**
   * Optional tooltip to show. Recommended to pass tooltip if button is disabled
   */
  tooltip?: JSX.Element | string;
  isLoading?: boolean;
  color?: string;
}

type SuccessAction<InjectedState> = (action: ActionConfig, state: DialogState<InjectedState>) => any | Promise<any>;
export interface DialogContainerProps<InjectedState, ExternalProps> {
  title?: JSX.Element | string;
  /**
   * Content string or JSX Element. Optionally you can pass a builder function that returns a JSX.Element
   * ```
   * (args: { props: ExternalProps, state: DialogState<InjectedState> }) => {
   *  return <>{args.props} {args.state}</>
   * };
   * ```
   */
  content: JSXRenderer<InjectedState, ExternalProps> | JSX.Element | string;
  /**
   * Actions can be `ActionConfig[]` or builder function that returns `ActionConfig[]`.
   * ```
   * (args: { props: ExternalProps, state: DialogState<InjectedState> }) => {
   *  return [{
   *    ...config,
   *  }];
   * };
   * ```
   */
  actions?: ActionButtonBuilder<InjectedState, ExternalProps> | ActionConfig[];
  hideCloseIcon?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClose?: (reason: 'cancelButton' | 'backdropClick' | 'escapeKeyDown' | 'crossButton') => void;
  onSuccess?: SuccessAction<InjectedState>;
  disableAutoClose?: boolean;
  fullWidth?: boolean;
  props?: ExternalProps;
  initialState?: Partial<InjectedState>;
  setCloseTrigger?: (closeTrigger: () => Promise<unknown>) => void;
}

export class DialogContainer<InjectedState, ExternalProps>
  extends React.Component<DialogContainerProps<InjectedState, ExternalProps>, DialogContainerState<InjectedState>> {
  injectedState: DialogState<InjectedState>;
  state = Object.assign({ open: true }, this.props.initialState);

  constructor(props: DialogContainerProps<InjectedState, ExternalProps>) {
    super(props);
    this.injectedState = Object.assign(this.props.initialState || {}, { setState: this.setInjectedState }) as DialogState<InjectedState>;
    this.props.setCloseTrigger && this.props.setCloseTrigger(this.closeDialog);
  }

  setInjectedState = (newState: Partial<InjectedState>) => {
    Object.assign(this.injectedState, newState);
    this.setState(newState);
  };


  onClose = (_event: any, reason: 'backdropClick' | 'escapeKeyDown' | 'crossButton') => {
    this.setState({ open: false });
    this.props.onClose && this.props.onClose(reason);
  };

  closeDialog = () => {
    this.setState({ open: false });
    return new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  };

  getTitleActions = (): ActionConfig[] => {
    if (this.props.actions) {
      const actionArray = Array.isArray(this.props.actions) ?
        this.props.actions :
        this.props.actions({ state: this.injectedState, props: this.props.props });
      const titleActions = actionArray.filter((action) => action.type === 'menu');
      return titleActions;
    }
    return [];
  };

  handleTitleAction = (actionKey: string | number) => {
    const action = this.getTitleActions().find((titleAction) => titleAction.id === actionKey);
    if (action && this.props.onSuccess) {
      this.props.onSuccess(action, this.injectedState);
    }
  };


  render() {
    const { open } = this.state;
    const { content: Content, title, size, disableAutoClose, fullWidth, hideCloseIcon } = this.props;
    const props = this.props.props || {} as ExternalProps;

    const content = typeof Content === 'function' && !React.isValidElement(Content) ?
      <Content props={props} state={this.injectedState} /> :
      <>{Content}</>;

    return <Dialog
      title={title}
      open={open}
      onClose={this.onClose}
      hideCloseIcon={hideCloseIcon}
      actions={<ActionsRenderer props={this.props} state={this.injectedState} />}
      isLoading={!!this.injectedState.dialogLoadingButtonId}
      content={content}
      size={size}
      fullWidth={fullWidth}
      disableAutoClose={disableAutoClose}
    />;
  }

}
