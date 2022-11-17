import { GDRIVE_API } from 'utils/gApi';
import { http } from 'utils/http';

export interface UserDetails {
  kind: 'drive#about';
  user: {
    kind: 'drive#user';
    displayName: string;
    photoLink: string;
    me: boolean;
    permissionId: string;
    emailAddress: string;
  };
  storageQuota: {
    limit: number;
    usage: number;
    usageInDrive: number;
    usageInDriveTrash: number;
  };
  maxUploadSize: number;
  folderColorPalette: string[];
  canCreateTeamDrives: boolean;
  canCreateDrives: boolean;
}

export const getUserDetailsFromAccessToken = (accessToken: string) => {
  return http.get<UserDetails>(`${GDRIVE_API.ABOUT}?fields=*`, {
    headers: { 'Authorization': `Bearer ${accessToken}`},
  }).then((resp) => {
    const userData = resp.data;
    http.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
    return userData;
  });
}
