const GDRIVE_BASE_URL = 'https://www.googleapis.com/drive/v3';
const GDOCS_BASE_URL = 'https://docs.googleapis.com/v1';

export const GDRIVE_API = {
  GET_FILES: `${GDRIVE_BASE_URL}/files`,
  CREATE_DOCUMENT: `${GDOCS_BASE_URL}/documents`,
  ABOUT: `${GDRIVE_BASE_URL}/about`,
}
