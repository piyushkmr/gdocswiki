import React, { MouseEvent } from 'react';
import { FunctionComponent } from 'react';
import { DialogContainerProps, DialogState, ActionConfig } from './DialogContainer';
import { Button } from '@mui/material';

const BUTTON_TYPE_ORDER = ['primary', 'secondary', 'tertiary'] as const;
const BUTTON_VARIANTS = ['contained', 'outlined', 'text'] as const;
const BUTTON_TYPE_VARIANTS: Record<(typeof BUTTON_TYPE_ORDER)[number], (typeof BUTTON_VARIANTS)[number]> = {
  primary: 'contained',
  secondary: 'outlined',
  tertiary: 'text',
};

const getColor = (action: ActionConfig) => {
  let buttonColor = action.id === 'delete' ? 'danger' : 'primary';
  buttonColor = action.color || buttonColor; // Override if color is given from outside
  return buttonColor;
};

const handleDialogState = <InjectedState extends any>(
  actionHandlerResponse: Promise<any>,
  state: DialogState<InjectedState>,
  action: ActionConfig,
) => {
  state.setState({ dialogLoadingButtonId: action.id });
  actionHandlerResponse.then(() => {
    state.setState({ dialogLoadingButtonId: '' });
  }).catch((error: string) => {
    state.setState({ dialogLoadingButtonId: '', error });
  });
};

const Spacer: FunctionComponent = () => {
  return <div style={{ flex: 1 }}></div>;
};

interface ActionsRendererProps<InjectedState = any, ExternalProps = any> {
  props: DialogContainerProps<InjectedState, ExternalProps>,
  state: DialogState<InjectedState>
}

export const ActionsRenderer: FunctionComponent<ActionsRendererProps> = <InjectedState, ExternalProps>(
  allProps: ActionsRendererProps<InjectedState, ExternalProps>
) => {
  const { props, state } = allProps;
  const { actions = []} = props;
  if (!actions || Array.isArray(actions) && actions.length === 0) {
    return null;
  }
  const externalProps = props.props || {} as ExternalProps;
  let actionsConfig = typeof actions === 'function' ? actions({ props: externalProps, state }) : (actions || []);
  actionsConfig = actionsConfig.filter((action) => action.type !== 'menu');
  const buttonActionWrapper = (e: MouseEvent<HTMLButtonElement>) => {
    const action = actionsConfig.find((actionConfig) => actionConfig.id === e.currentTarget.id);
    action.onClick && action.onClick(e);
    const actionHandler = action.id === 'cancel' ? props.onClose : props.onSuccess;
    if (actionHandler) {
      let actionHandlerResponse;
      if (action.id === 'cancel') {
        actionHandlerResponse = props.onClose && props.onClose('cancelButton');
      } else {
        actionHandlerResponse = props.onSuccess && props.onSuccess(action, state);
      }
      if (actionHandlerResponse instanceof Promise) {
        handleDialogState(actionHandlerResponse, state, action);
      }
    }
  };

  if (actionsConfig.length > 0) {
    const actionsConfigCopy = Array.from(actionsConfig);
    const actionButtons: JSX.Element[] = [];
    BUTTON_TYPE_ORDER.forEach((buttonType, index) => {
      const buttonIndex = actionsConfigCopy.findIndex((actionConfig) => actionConfig.type === buttonType);
      const buttonConfig = buttonIndex === -1 ? // not found
        actionsConfigCopy.shift() :
        actionsConfigCopy.splice(buttonIndex, 1)[0];
      if (buttonConfig) {
        const _buttonType = buttonConfig.type as 'primary' | 'secondary' | 'tertiary';
        const actionButton = <Button
          key={buttonConfig.id}
          id={buttonConfig.id}
          variant={BUTTON_TYPE_VARIANTS[_buttonType] || BUTTON_VARIANTS[index]}
          onClick={buttonActionWrapper}
          disabled={buttonConfig.disabled || !!state.dialogLoadingButtonId} // Disable all buttons
          color={getColor(buttonConfig) as any}
        >{buttonConfig.label}</Button>;
        actionButtons.push(actionButton);
        if (
          actionsConfig.length === 1 ||
          (actionsConfig.length === 2 &&  index === 1) ||
          (actionsConfig.length === 3 &&  index === 1)
        ) { // If only 1 item, or after 2nd item
          // Spacer is added to push the tertiary button to left
          actionButtons.push(<Spacer key="spacer" />);
        }
      }
    });
    return <>{actionButtons}</>;
  }
  return null;
};
