import React, {useState, useEffect, useCallback} from 'react';
import {StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import permissionModule from '../services/permissionService';
import {RootStackParamList} from '../types/navigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import { DEST_FOLDER_URI_KEY, BIN_FOLDER_URI_KEY } from '../services/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PermissionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Permission'
>;

type PermissionState = 'idle' | 'requesting' | 'failed' | 'blocked' | 'granted' | 'nothing';

const PermissionScreen = ({navigation}: PermissionScreenProps) => {
  const [permissionState, setPermissionState] = useState<PermissionState>('nothing');
  

  const handleNextAction = useCallback(() => {
    const checkSavedFolder = async () => {
            const destUri = await AsyncStorage.getItem(DEST_FOLDER_URI_KEY);
            const binUri = await AsyncStorage.getItem(BIN_FOLDER_URI_KEY);
            if (destUri && binUri) {
              navigation.replace('Preview', {folderUri: destUri, binUri: binUri});
            } else {
              navigation.replace('SetupScreen1');
            }
          };
          permissionModule.setPermisionMadeFlag();
          checkSavedFolder();
    
  }, [navigation]);


  useEffect(() => {
    permissionModule.checkMediaLocationPermission().then((responseStatus) => {
      if (responseStatus === 'granted' || responseStatus === 'blocked') {
        handleNextAction();
      } else {
        setPermissionState('idle');
      }
    });
  }, []);

  const requestPermission = async () => {
    setPermissionState('requesting');

    const result = await permissionModule.requestMediaLocationPermission();
    if (result === 'granted') {
      handleNextAction();
    } else if (result === 'blocked') {
      setPermissionState('blocked');
    } else {
      setPermissionState('failed');
    }
  };
  
  const renderMessage = () => {
    if (permissionState === 'idle' || permissionState === 'requesting') {
      return `SwipeCleanApp needs access to your photo location data to show where photos were taken.`;
    }

    if (permissionState === 'failed') {
      return 'Permission denied. You can try again, or continue without photo location data.';
    }

    if (permissionState === 'blocked') {
      return "Access is blocked. You'll need to enable it manually in system settings later if you change your mind. For now, you can continue without it.";
    }

    return '';
};
  const renderButtons = () => {
    if (permissionState === 'idle' || permissionState === 'requesting') {
      return (
        <TouchableOpacity
          style={[styles.button, permissionState === 'requesting' && styles.buttonDisabled]}
          onPress={requestPermission}
          disabled={permissionState === 'requesting'}>
          <Text style={styles.buttonText}>
            {permissionState === 'requesting' ? 'Requesting...' : 'Grant Location Access'}
          </Text>
        </TouchableOpacity>
      );
    }

    if (permissionState === 'failed') {
      return (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.buttonSmaller]} onPress={requestPermission}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSmaller]} onPress={handleNextAction}>
            <Text style={styles.buttonText}>Continue anyway</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (permissionState === 'blocked') {
      return (
        <TouchableOpacity style={styles.button} onPress={handleNextAction}>
          <Text style={styles.buttonText}>Continue anyway</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  if (permissionState === 'idle' || permissionState === 'requesting' || permissionState === 'blocked' || permissionState === 'failed') return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to SwipeCleanApp</Text>
        <Text style={styles.subtitle}>
          {renderMessage()}
        </Text>

        {renderButtons()}
      </View>
    </SafeAreaView>
  );

  else return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F5F7FB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#0E7490',
    width: '100%',
    alignItems: 'center',
  },
  buttonSmaller: {
    width: '45%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
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

export default PermissionScreen;