import {PermissionsAndroid, Platform} from 'react-native';

export type MediaLocationPermissionResult = 'granted' | 'denied' | 'blocked';

type PermissionModule = {
  requestMediaLocationPermission: () => Promise<MediaLocationPermissionResult>;
};

const permissionModule: PermissionModule = {

  requestMediaLocationPermission: async () => {
    if (Platform.OS !== 'android') {
      return 'granted';
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
      if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
      return 'denied';
    } catch (error) {
      console.error('Failed to request media location permission:', error);
      return 'denied';
    }
  },
};

export default permissionModule;