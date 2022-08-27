import { makeKey, StringWith } from 'utils/types';

const FILE_TYPES = [
  'audio',
  'document',
  'drive-sdk',
  'drawing',
  'file',
  'folder',
  'form',
  'fusiontable',
  'jam',
  'map',
  'presentation',
  'script',
  'shortcut',
  'site',
  'spreadsheet',
  'photo',
  'unknown',
  'video',
] as const;

export type FileTypes = typeof FILE_TYPES[number];

const MIME_TYPE_PREFIX = 'application/vnd.google-apps.' as const;

const MIME_TYPES = FILE_TYPES.map((fileType) => makeKey(MIME_TYPE_PREFIX, fileType));

type SupportedMimeTypes = typeof MIME_TYPES[number];

export type MimeTypes = StringWith<SupportedMimeTypes>;

export type DocumentUrlType =
  'edit' |
  /**
   * Non-editable, no menubar, no toolbar, no ruler, just plain page
   */
  'preview' |
  /**
   * No title of the document, editable. Good for embedding in iframes.
   */
  'embedded' |
  /**
   * No title, no menubar, no toolbar, only the ruler and page, editable. Good for distraction free minimal editor.
   */
  'minimal' |
  /**
   * No title bar, no menubar. Shows the toolbar. Good for a editor with basic controls.
   */
  'demo';

interface GDriveUser {
  kind: 'drive#user',
  displayName: string,
  photoLink: string,
  me: boolean,
  permissionId: string,
  emailAddress: string
}

export interface GDriveFile {
  kind: 'drive#file',
  id: string,
  name: string,
  mimeType: MimeTypes,
  type: FileTypes;
  description: string,
  starred: boolean,
  trashed: boolean,
  explicitlyTrashed: boolean,
  trashingUser: GDriveUser,
  trashedTime: string,
  parents: string[],
  properties: Record<string, string>,
  appProperties: Record<string, string>,
  spaces: string[],
  version: number,
  webContentLink: string,
  webViewLink: string,
  iconLink: string,
  hasThumbnail: boolean,
  thumbnailLink: string,
  thumbnailVersion: number,
  viewedByMe: boolean,
  viewedByMeTime: string,
  createdTime: string,
  modifiedTime: string,
  modifiedByMeTime: string,
  modifiedByMe: boolean,
  sharedWithMeTime: string,
  sharingUser: GDriveUser,
  owners: GDriveUser[],
  teamDriveId: string,
  driveId: string,
  lastModifyingUser: GDriveUser,
  shared: boolean,
  ownedByMe: boolean,
  viewersCanCopyContent: boolean,
  copyRequiresWriterPermission: boolean,
  writersCanShare: boolean,
  hasAugmentedPermissions: boolean,
  folderColorRgb: string,
  originalFilename: string,
  fullFileExtension: string,
  fileExtension: string,
  md5Checksum: string,
  size: number,
  quotaBytesUsed: number,
  headRevisionId: string,
  resourceKey: string,
  linkShareMetadata: {
    securityUpdateEligible: boolean,
    securityUpdateEnabled: boolean
  }
}

