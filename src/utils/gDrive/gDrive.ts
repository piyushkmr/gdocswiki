import { http } from 'utils/http';
import { UIFile } from 'utils/store';
import { sprintf } from 'sprintf-js';
import { FileTypes, GDriveFile, DocumentUrlType } from './gDriveTypes';
import { DOCUMENT_URL_TYPE_MAPPING, FILES_FIELDS, FILE_FIELDS } from './gDriveConstants';

const GDRIVE_BASE_URL = 'https://www.googleapis.com/drive/v3';
const GDOCS_BASE_URL = 'https://docs.googleapis.com/v1';

const GDRIVE_API = {
  GET_FILES: `${GDRIVE_BASE_URL}/files`,
  CREATE_DOCUMENT: `${GDOCS_BASE_URL}/documents`,
}

const DEFAULT_PARAMS = {
  GET_FILES_IN_FOLDER: `q="%(folderId)s"+in+parents&fields=${FILES_FIELDS}`,
}

/** CREATE */
interface CreateGoogleDocPayload {
  title: string;
  parentFolder?: string;
}
export const createGoogleDocument = (payload: CreateGoogleDocPayload) => {
  return http.post(GDRIVE_API.CREATE_DOCUMENT, { title: payload.title }).then((resp) => {
    console.debug(resp.data);
    if (payload.parentFolder) {
      return updateFileParents(resp.data.documentId, [payload.parentFolder]);
    }
  });
}

/** READ */
export const getFilesInFolder = (folderId: string) => {
  return http.get(`${GDRIVE_API.GET_FILES}?${sprintf(DEFAULT_PARAMS.GET_FILES_IN_FOLDER, { folderId })}`).then((resp) => {
    const files = resp.data.files as GDriveFile[];
    files.forEach((file) => file.type = file.mimeType.replace('application/vnd.google-apps.', '') as FileTypes);
    return files;
  });
};

/** UPDATE */
export const updateFileParents = (fileId: string, newParents: string[]) => {
  const fields = FILE_FIELDS.join(',');
  const newParentString = newParents.join(',');
  return http.patch<GDriveFile>(`${GDRIVE_API.GET_FILES}/${fileId}?fields=${fields}&addParents=${newParentString}`).then((resp) => {
    return resp.data;
  });
}
/** DELETE */
export const deleteFile = (fileId: string) => {
  return http.delete<void>(`${GDRIVE_API.GET_FILES}/${fileId}`).then((resp) => resp.data);
}

export const getUrlFor = (file: UIFile, type?: DocumentUrlType) => {
  const urlType = (type || file.currentView) || 'preview';
  const docLink = file.webViewLink;
  const googleDocsRegex = /(.*\.google\.com\/.*\/)([a-zA-Z]*)(.*)\?.*/;
  const docUrl = docLink.replace(googleDocsRegex, `$1${DOCUMENT_URL_TYPE_MAPPING[urlType]}$3`);

  return docUrl;
}
