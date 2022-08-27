import React, { PropsWithChildren } from 'react';
import MuiMenu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { Icon, IconName } from 'ccl/Icon';
import { StringWith } from 'utils/types';
import style from './ActionMenu.module.scss';
import cn from 'classnames';
export interface ActionMenuItem {
  label: string | JSX.Element;
  icon?: StringWith<IconName>;
  key?: string;
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'default';
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  onSelection: (selectedIndex: string | number) => void;
  anchorPosition?: {
    top: number;
    left: number;
  }
  onClose?: () => void;
}

export const ActionMenu: React.FunctionComponent<PropsWithChildren<ActionMenuProps>> = (props) => {
  const { anchorPosition } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };

  const handleClose = (event?: React.MouseEvent) => {
    setAnchorEl(null);
    props.onClose && props.onClose();
    event?.stopPropagation();
  };

  const onSelection = (index: string | number) => {
    handleClose();
    props.onSelection(index);
    props.onClose && props.onClose();
  };

  return (
    <span data-component="ActionMenu" style={{display: 'inline-block'}} >
      {!anchorPosition && <span aria-controls="actionMenu" onClick={handleOpen} style={{ display: 'inline-block' }} >
        {props.children}
      </span>}
      <MuiMenu
        id="actionMenu"
        anchorEl={anchorEl}
        open={!!anchorEl || !!anchorPosition}
        onClose={handleClose}
        anchorReference={anchorPosition ? 'anchorPosition' : 'anchorEl'}
        anchorPosition={anchorPosition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {
          props.items.map((item, index) => {
            const key = item.key || index;
            const handleClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              onSelection(key);
            };
            let icon: JSX.Element | null = null;
            if (item.icon) {
              const isIconLink = item.icon.indexOf('/') !== -1;
              if (isIconLink) {
                icon = <img src={item.icon} className={style.menuItemIcon} />;
              } else {
                icon = <Icon name={item.icon as IconName} fontSize="inherit" className={style.menuItemIcon} />
              }
            }
            return <MuiMenuItem key={key} onClick={handleClick} className={cn(style.menuItem, { [style.danger]: item.color === 'danger' })}>
              {icon}
              {item.label}
            </MuiMenuItem>;
          })
        }
      </MuiMenu>
    </span>
  );
};

