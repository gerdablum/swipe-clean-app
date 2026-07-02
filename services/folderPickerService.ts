import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, NativeModules, Platform} from 'react-native';

import {BIN_FOLDER_URI_KEY, DEST_FOLDER_URI_KEY} from './constants';

type StorageAccessNativeModule = {
  openFolderPicker: () => Promise<string | null>;
};

export class FolderPickerService {
  private readonly storageAccessModule = NativeModules
    .StorageAccessModule as StorageAccessNativeModule | undefined;

  private static normalizeSourceFolderUris(value: string | null): string[] {
    if (!value) {
      return [];
    }

    const trimmedValue = value.trim();
    if (trimmedValue.startsWith('[')) {
      const parsed = JSON.parse(trimmedValue) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }

      return [];
    }

    return [value];
  }

  private async pickFolderUri(title: string): Promise<string | null> {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported Yet', 'Folder picking is currently implemented for Android.');
      return null;
    }

    if (!this.storageAccessModule) {
      Alert.alert('Module Missing', 'Storage access module is not available. Rebuild the app.');
      return null;
    }

    try {
      return await this.storageAccessModule.openFolderPicker();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to pick folder.';
      Alert.alert(title, message);
      return null;
    }
  }

  private async getStoredSourceFolderUris(): Promise<string[]> {
    const storedValue = await AsyncStorage.getItem(DEST_FOLDER_URI_KEY);
    return FolderPickerService.normalizeSourceFolderUris(storedValue);
  }

  async getSourceFolders(): Promise<string[]> {
    return await this.getStoredSourceFolderUris();
  }

  async getSourceFolder(): Promise<string | null> {
    const sourceFolders = await this.getStoredSourceFolderUris();
    return sourceFolders[0] ?? null;
  }

  async addSourceFolder(): Promise<string | null> {
    const uri = await this.pickFolderUri('Source folder error');
    if (!uri) {
      return null;
    }

    const sourceFolders = await this.getStoredSourceFolderUris();
    if (!sourceFolders.includes(uri)) {
      sourceFolders.push(uri);
      await AsyncStorage.setItem(DEST_FOLDER_URI_KEY, JSON.stringify(sourceFolders));
    }

    return uri;
  }

  async removeSourceFolder(uri: string): Promise<void> {
    const sourceFolders = await this.getStoredSourceFolderUris();
    const updatedSourceFolders = sourceFolders.filter((sourceFolderUri) => sourceFolderUri !== uri);
    await AsyncStorage.setItem(DEST_FOLDER_URI_KEY, JSON.stringify(updatedSourceFolders));
  }

  async getBinFolder(): Promise<string | null> {
    return await AsyncStorage.getItem(BIN_FOLDER_URI_KEY);
  }

  async changeBinFolder(): Promise<string | null> {
    const uri = await this.pickFolderUri('Bin folder error');
    if (!uri) {
      return null;
    }

    await AsyncStorage.setItem(BIN_FOLDER_URI_KEY, uri);
    return uri;
  }
}