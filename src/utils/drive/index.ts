import * as gDrive from '../gDrive';

export const getFilesInFolder = (folderId: string) => {
  return gDrive.getFilesInFolder(folderId);
}

export const getFileInfo = (fileId: string) => {
  return gDrive.getFileInfo(fileId);
}
