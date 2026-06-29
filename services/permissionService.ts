import {PermissionsAndroid, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SKIPPED_FLAG_KEY = 'mediaLocationPermissionSkipped';
export type MediaLocationPermissionResult = 'granted' | 'denied' | 'blocked';

type PermissionModule = {
  requestMediaLocationPermission: () => Promise<MediaLocationPermissionResult>;
  checkMediaLocationPermission: () => Promise<MediaLocationPermissionResult>;
  setPermisionMadeFlag: () => Promise<void>;
};

const permissionModule: PermissionModule = {

  checkMediaLocationPermission: async (): Promise<MediaLocationPermissionResult> => {
    if (Platform.OS !== 'android') {
      return 'granted';
    }
    const isGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION);
    if (isGranted) {
      return 'granted';
    }
    const value = await AsyncStorage.getItem(SKIPPED_FLAG_KEY);
    if (value === 'true') {
      return 'blocked';
    } else return 'denied';

  },

  setPermisionMadeFlag: async (): Promise<void> => {
    await AsyncStorage.setItem(SKIPPED_FLAG_KEY, 'true');
  },


  requestMediaLocationPermission: async () => {
    if (Platform.OS !== 'android') {
      return 'granted';
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
      if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return 'blocked';
      }
     
    } catch (error) {
      console.error('Failed to request media location permission:', error);
      return 'denied';
    }
  },
};

export default permissionModule;