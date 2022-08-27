import React, { FunctionComponent } from 'react';
import { PlayArrow } from '@mui/icons-material';
import { Icon } from '@mui/material';
import { UIFile, useStore, useStoreFiles } from 'utils/store';
import style from './RenderItem.module.scss';
import { AddItemAction } from '../AddItemAction';
import cn from 'classnames';
import { useContextMenu } from 'ccl/ContextMenu';
import { ContextMenuItemId, CONTEXT_MENU_ITEMS } from './renderItemConstants';
import { contextMenuDelete, contextMenuOpenInNewTab } from './renderItemActions';

interface RenderItemProps {
  file: UIFile;
  onItemClick: (item: UIFile) => void;
}

export const RenderItem: FunctionComponent<RenderItemProps> = (props) => {
  const { file } = props;
  const [activeDocument] = useStore('activeDocument');
  const { removeFile } = useStoreFiles();

  const handleMenuSelect = (menuId: ContextMenuItemId) => {
    switch (menuId) {
      case 'openInNewTab': contextMenuOpenInNewTab(file); break;
      case 'delete': contextMenuDelete(file).then(() => {
        removeFile(file.id);
      }); break;
    }
  };

  const { handleContextMenu } = useContextMenu({ items: CONTEXT_MENU_ITEMS, onSelection: handleMenuSelect });
  const itemClasses = cn(style.itemContent, {
    [style.active]: activeDocument?.id === file.id,
    [style.added]: file.addedByUser,
    'deleted': file.deletedByUser,
  });
  
  return <div className={itemClasses} onClick={() => props.onItemClick(file)}>
    {file.type === 'folder' ?
      <Icon component={PlayArrow} className={`${style.folderDropdownIcon} ${style[`${file.isOpen ? 'folderOpen' : 'folderClose'}`]}`} /> :
      <span className={style.dropdownPlaceholder}></span>
    }
    <img className={cn(style.fileIcon, { [style[`fileIcon-${file.type}`]]: style[`fileIcon-${file.type}`]})} src={file.iconLink} />
    <span className={style.fileName} onContextMenu={handleContextMenu}>{file.name}</span>
    <div className={style.actions}>
      <AddItemAction file={file} />
    </div>
  </div>
};
