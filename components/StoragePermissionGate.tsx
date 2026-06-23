import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AppState,
  Alert,
  Linking,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

type PermissionState = 'idle' | 'granted' | 'denied' | 'blocked';
type StorageAccessNativeModule = {
  isManageExternalStorageGranted: () => Promise<boolean>;
  openManageExternalStorageSettings: () => Promise<boolean>;
};

type StoragePermissionGateProps = {
  children?: React.ReactNode;
  appName?: string;
  onPermissionGranted?: () => void;
};

const storageAccessModule = NativeModules
  .StorageAccessModule as StorageAccessNativeModule | undefined;

const getAndroidVersion = () =>
  typeof Platform.Version === 'string'
    ? parseInt(Platform.Version, 10)
    : Platform.Version;

const getAndroidStoragePermissions = () => {
  const androidVersion = getAndroidVersion();

  if (androidVersion <= 28) {
    return [
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ];
  }

  if (androidVersion <= 32) {
    return [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
  }

  return [
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
  ];
};

const StoragePermissionGate = ({
  children,
  appName = 'SwipeClean',
  onPermissionGranted,
}: StoragePermissionGateProps) => {
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (permissionState === 'granted') {
      onPermissionGranted?.();
    }
  }, [onPermissionGranted, permissionState]);

  const checkManageExternalStorage = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setPermissionState('granted');
      return;
    }

    const androidVersion = getAndroidVersion();

    if (androidVersion < 30) {
      setPermissionState('idle');
      return;
    }

    if (!storageAccessModule) {
      setPermissionState('denied');
      return;
    }

    const granted = await storageAccessModule.isManageExternalStorageGranted();
    setPermissionState(granted ? 'granted' : 'idle');
  }, []);

  useEffect(() => {
    checkManageExternalStorage().catch(() => setPermissionState('denied'));
  }, [checkManageExternalStorage]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        checkManageExternalStorage().catch(() => setPermissionState('denied'));
      }
    });

    return () => subscription.remove();
  }, [checkManageExternalStorage]);

  const message = useMemo(() => {
    if (permissionState === 'granted') {
      return 'All files access is granted. You can now continue to your file manager.';
    }

    if (permissionState === 'denied') {
      return 'Permission denied. Tap the button to try again.';
    }

    if (permissionState === 'blocked') {
      return 'Access is blocked. Open settings and enable All files access.';
    }

    return `${appName} needs file manager access to read and manage files on this device.`;
  }, [appName, permissionState]);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      setPermissionState('granted');
      return;
    }

    try {
      setIsRequesting(true);

      if (getAndroidVersion() >= 30) {
        if (!storageAccessModule) {
          Alert.alert(
            'Not Available',
            'Native storage module is not available. Rebuild the app and try again.',
          );
          setPermissionState('denied');
          return;
        }

        const opened = await storageAccessModule.openManageExternalStorageSettings();
        if (!opened) {
          await Linking.openSettings();
        }

        setPermissionState('idle');
        return;
      }

      const results = await PermissionsAndroid.requestMultiple(
        getAndroidStoragePermissions(),
      );
      const values = Object.values(results);

      if (values.every(value => value === PermissionsAndroid.RESULTS.GRANTED)) {
        setPermissionState('granted');
        return;
      }

      if (values.some(value => value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
        setPermissionState('blocked');
        return;
      }

      setPermissionState('denied');
    } finally {
      setIsRequesting(false);
    }
  };

  if (permissionState === 'granted') {
    if (children) {
      return <>{children}</>;
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <Text style={styles.title}>Permission granted</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to {appName}</Text>
        <Text style={styles.subtitle}>{message}</Text>

        <TouchableOpacity
          style={[styles.button, isRequesting && styles.buttonDisabled]}
          onPress={requestStoragePermission}
          disabled={isRequesting}>
          <Text style={styles.buttonText}>
            {isRequesting ? 'Requesting...' : 'Grant File Manager Access'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F5F7FB',
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#0E7490',
    minWidth: 220,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#334155',
    lineHeight: 22,
  },
});

export default StoragePermissionGate;
