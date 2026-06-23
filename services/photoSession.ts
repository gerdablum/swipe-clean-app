import {NativeModules} from 'react-native';
export interface ExifNativeResult {
  dateTime: string | null;
  lat: number | null;
  lon: number | null;
}

type StorageAccessNativeModule = {
  listImageFiles: (folderUri: string, alreadySwipedPhotos: string[]) => Promise<string[]>;
  getImageMetadata: (fileUri: string) => Promise<ExifNativeResult>;
  moveToBin?: (sourceUri: string, binUri: string) => Promise<boolean>;
  saveUri?: (uri: string, folderUri: string) => Promise<boolean>;
  openFolderInFileManager?: (folderUri: string) => Promise<boolean>;
  saveFolderPaths?: (sourceUri: string, binUri: string) => Promise<boolean>;
  getSavedFolderPaths?: () => Promise<{
    sourceFolderUri: string | null;
    binFolderUri: string | null;
  } | null>;
};

const storageAccessModule = NativeModules.StorageAccessModule as StorageAccessNativeModule | undefined;

export const listImageFiles = async (folderUri: string, alreadySwipedPhotos: string[]): Promise<string[]> => {
  if (!storageAccessModule || !storageAccessModule.listImageFiles) return [];
  try {
    const files = await storageAccessModule.listImageFiles(folderUri, alreadySwipedPhotos);
    return files || [];
  } catch (e) {
    console.error('Error listing image files:', e);
    return [];
  }
};

export const getImageMetadata = async(filename: string): Promise<ExifNativeResult | null> => {
  if (!storageAccessModule || !storageAccessModule.getImageMetadata) return null;
  try {
    const files = await storageAccessModule.getImageMetadata(filename);
    return files || [];
  } catch (e) {
    console.error('Error listing image files:', e);
    return null;
  }
}
export const moveToBin = async (sourceUri: string, binUri: string): Promise<boolean> => {
  if (!storageAccessModule || !storageAccessModule.moveToBin) return false;
  try {
    return await storageAccessModule.moveToBin(sourceUri, binUri);
  } catch (e) {
    console.error('Error moving file to bin:', e);
    return false;
  }
};

export const saveUri = async (uri: string, folderUri: string): Promise<boolean> => {
  // TODO implement this method
  return false;
};

export const openFolderInFileManager = async (folderUri: string): Promise<boolean> => {
  if (!storageAccessModule || !storageAccessModule.openFolderInFileManager) return false;
  try {
    return await storageAccessModule.openFolderInFileManager(folderUri);
  } catch (e) {
    console.error('Error opening folder in file manager:', e);
    return false;
  }
};

export const saveFolderPaths = async (sourceUri: string, binUri: string): Promise<boolean> => {
  if (!storageAccessModule || !storageAccessModule.saveFolderPaths) return false;
  try {
    return await storageAccessModule.saveFolderPaths(sourceUri, binUri);
  } catch (e) {
    console.error('Error saving folder paths:', e);
    return false;
  }
};

export const getSavedFolderPaths = async (): Promise<{
  sourceFolderUri: string;
  binFolderUri: string;
} | null> => {
  if (!storageAccessModule || !storageAccessModule.getSavedFolderPaths) return null;
  try {
    const paths = await storageAccessModule.getSavedFolderPaths();
    if (!paths?.sourceFolderUri || !paths?.binFolderUri) {
      return null;
    }

    return {
      sourceFolderUri: paths.sourceFolderUri,
      binFolderUri: paths.binFolderUri,
    };
  } catch (e) {
    console.error('Error getting saved folder paths:', e);
    return null;
  }
};
