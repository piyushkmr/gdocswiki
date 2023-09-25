import { createGlobalState } from 'react-hooks-global-state';
import { DocumentUrlType, GDriveFile } from './gDrive';
import { useEffect } from 'react';
import { getFileInfo, getFilesInFolder } from './drive';

/**
 * `UIFile` interface has additional properties to properly display files in sidebar.
 */
export interface UIFile extends GDriveFile {
  isOpen: boolean;
  indentation: number;
  parent: string;
  children?: UIFile[];
  currentView?: DocumentUrlType;
  addedByUser?: boolean;
  deletedByUser?: boolean;
  /**
   * To show custom display for the file name, overrides default `name` property
   * This can be use to parse file names with spacial prefixex (or to remove extensions)
   */
  displayName?: string;
}

interface StoreState {
  activeDocument?: UIFile,
  files: UIFile[];
  fileTree?: UIFile[];
  spaces: UIFile[];
  root?: UIFile;
}

const initialState: StoreState = {
  activeDocument: undefined,
  files: [],
  fileTree: undefined,
  spaces: [],
  root: undefined,
};

const SPACES_PREFIX = 'SPACE:';

const globalState = createGlobalState<StoreState>(initialState);

const convertListToTree = (files: UIFile[]) => {
  const rootFolders = files.filter((file) => !files.find((f) => file.parents.includes(f.id)));
  const fileTree: UIFile[]  = rootFolders;
  fileTree.forEach((file) => {
    file.children = files.filter((f) => f.parents.includes(file.id));
  });
  return fileTree;
}

const deduplicateFiles = (oldFiles: UIFile[], newFiles: UIFile[]) => {
  newFiles = newFiles.filter((newFile) => !oldFiles.find((oldFile) => oldFile.id === newFile.id));
  const allFiles = [...oldFiles, ...newFiles];
  return allFiles;
}

const injectInArray = <T extends any>(array: T[], newIndex: number, newItems: T[]) => {
  if (newIndex !== -1) {
    const requestedFolderBefore = array.slice(0, newIndex + 1);
    const requestedFolderAfter = array.slice(newIndex + 1, array.length);
    const newArray = [...requestedFolderBefore, ...newItems, ...requestedFolderAfter];
    return newArray;
  }
}

const getSpacesFromFiles = (files: UIFile[]) => {
  const spaces = files.filter((file) => file.name.startsWith(SPACES_PREFIX))
  spaces.forEach((file) => file.displayName = file.name.replace(SPACES_PREFIX, ''));
  // const rootFile = files.find((file) => file.parent)
  return spaces;
};

export const useStoreFiles = () => {
  const [files, setFiles] = globalState.useGlobalState('files');
  const [root, setRoot] = globalState.useGlobalState('root');
  const [spaces, setSpaces] = globalState.useGlobalState('spaces');
  const [fileTree, setFileTree] = globalState.useGlobalState('fileTree');
  const [activeDocument, setActiveDocument] = globalState.useGlobalState('activeDocument');

  useEffect(() => {
    if (!root) {
      getFileInfo('root').then((file) => {
        const uiFile = {
          ...file,
          isOpen: true,
          indentation: 0,
          parent: null,
          displayName: 'Global'
        }
        setRoot(uiFile);
        setSpaces([uiFile, ...getSpacesFromFiles(files)]);
      });
    }
  }, []);
  const isFolderOpen = (id: string) => {
    const file = files.find(file => file.id === id);
    if (file) {
      return file.isOpen
    }
  };

  const setFolderOpen = (id: string, isOpen: boolean) => {
    const file = files.find(file => file.id === id);
    if (file) {
      file.isOpen = isOpen;
      setFiles([...files]);
    }
  };

  const setFilesIndentation = (id: string, indentation: number) => {
    const file = files.find(file => file.id === id);
    if (file) {
      file.indentation = indentation;
      setFiles([...files]);
    }
  };

  const addFiles = (newFiles: GDriveFile[], requestedByFolderId?: string, addedByUser = false) => {
    const newUIFiles = newFiles.map(file => {
      const uiFile: UIFile = {
        ...file,
        parent: file.parents[0],
        isOpen: false,
        indentation: 0,
        addedByUser,
      };
      return uiFile;
    });
    let allFiles = deduplicateFiles(files, newUIFiles);
    const requestedFolderIndex = files.findIndex(file => file.id === requestedByFolderId);
    const requestedFolder = files[requestedFolderIndex];
    if (requestedFolderIndex !== -1) {
      const requestedFolderBefore = files.slice(0, requestedFolderIndex + 1);
      const requestedFolderAfter = files.slice(requestedFolderIndex + 1, files.length);
      allFiles = [...requestedFolderBefore, ...newUIFiles, ...requestedFolderAfter];
      newUIFiles.forEach((file) => file.indentation = requestedFolder.indentation + 1);
    }
    setFileTree(convertListToTree(allFiles));
    setFiles(allFiles);
    setSpaces(root ? [root, ...getSpacesFromFiles(allFiles)] : getSpacesFromFiles(allFiles));
  };

  const removeFile = (id: string) => {
    // flagFileForDeletion
    const newFiles = [...files].map((file) => {
      if (file.id === id) {
        file.deletedByUser = true;
      }
      return file;
    });
    setFileTree(convertListToTree(newFiles));
    setFiles(newFiles);
    setSpaces(root ? [root, ...getSpacesFromFiles(newFiles)] : getSpacesFromFiles(newFiles));
  };
  const filesStore = {
    files,
    spaces,
    fileTree,
    activeDocument,
    setActiveDocument,
    isFolderOpen,
    setFolderOpen,
    setFilesIndentation,
    addFiles,
    removeFile,
  };
  if (typeof window !== 'undefined') {
    (window as any).filesStore = filesStore;
  }
  return filesStore;
}

export const useStore = globalState.useGlobalState;
