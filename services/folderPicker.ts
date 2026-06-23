import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Alert,
  NativeModules,
  Platform,
} from 'react-native';



type StorageAccessNativeModule = {
  openFolderPicker: () => Promise<string | null>;
};

const storageAccessModule = NativeModules
  .StorageAccessModule as StorageAccessNativeModule | undefined;

export const pickFolder = async (
    title: string,
    storageKey: string,
  ) => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported Yet', 'Folder picking is currently implemented for Android.');
      return;
    }

    if (!storageAccessModule) {
      Alert.alert('Module Missing', 'Storage access module is not available. Rebuild the app.');
      return;
    }

    try {
      const uri = await storageAccessModule.openFolderPicker();
      if (uri) {
          await AsyncStorage.setItem(storageKey, uri);
          return uri;    
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to pick folder.';
      Alert.alert(title, message);
    }
  };