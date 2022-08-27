import { ActionMenuItem } from 'ccl/ActionMenu';

export const _CONTEXT_MENU_ITEMS = [{
  key: 'openInNewTab' as const,
  label: 'Open in New Tab',
  icon: 'OpenInNew',
}, {
  key: 'delete' as const,
  label: 'Move to Trash',
  icon: 'Delete',
  color: 'danger',
  }];

export type ContextMenuItemId = (typeof _CONTEXT_MENU_ITEMS)[number]['key'];

export const CONTEXT_MENU_ITEMS = _CONTEXT_MENU_ITEMS as ActionMenuItem[];
