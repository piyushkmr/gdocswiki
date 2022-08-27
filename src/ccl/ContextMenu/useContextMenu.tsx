import { ActionMenu, ActionMenuItem } from 'ccl/ActionMenu';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ContextMenuAnchor {
  top: number;
  left: number;
}
interface UseContextMenuOptions {
  items: ActionMenuItem[];
  onSelection: (selection: string) => void;
  onClose?: () => void;
}

const getContextMenuContainer = () => {
  let contextMenuContainerEl = document.getElementById('contextMenuContainer') as HTMLDivElement;
  if (!contextMenuContainerEl) {
    contextMenuContainerEl = document.createElement('div');
    contextMenuContainerEl.id = 'contextMenuContainer';
    document.body.appendChild(contextMenuContainerEl);
  }
  return contextMenuContainerEl;
};

export const useContextMenu = (options: UseContextMenuOptions) => {
  const { items, onSelection } = options;
  const [contextMenu, setContextMenu] = useState<ContextMenuAnchor | null>(null);

  const handleClose = () => {
    setContextMenu(null);
  }

  useEffect(() => {
    getContextMenuContainer();
  }, []);

  useEffect(() => {
    const contextMenuContainerEl = getContextMenuContainer();
    if (contextMenu) {
      ReactDOM.render(<ActionMenu
        items={items}
        onSelection={onSelection}
        onClose={handleClose}
        anchorPosition={contextMenu}
      ></ActionMenu>, contextMenuContainerEl);
    } else {
      ReactDOM.unmountComponentAtNode(contextMenuContainerEl);
    }
  }, [contextMenu])

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    setContextMenu({
      top: event.clientY,
      left: event.clientX,
    });
    event.preventDefault();
    event.stopPropagation();
  }

  return {
    handleContextMenu,
  }
};
