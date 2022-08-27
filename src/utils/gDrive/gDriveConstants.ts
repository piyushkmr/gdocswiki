import { DocumentUrlType } from './gDriveTypes';

export const DOCUMENT_URL_TYPE_MAPPING: Record<DocumentUrlType, string> = {
  edit: 'edit',
  preview: 'preview',
  embedded: 'view?rm=embedded',
  minimal: 'view?rm=minimal',
  demo: 'view?rm=demo',
}

export const FILE_FIELDS = [
  'kind',
  'id',
  'name',
  'mimeType',
  'webViewLink',
  'webContentLink',
  'iconLink',
  'parents',
];

export const FILES_FIELDS = FILE_FIELDS.map((field) => `files/${field}`).join(',');
