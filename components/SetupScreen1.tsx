import React, {useState, useEffect} from 'react';
import {
  Alert,
  NativeModules,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {pickFolder} from '../services/folderPickerService';

import { DEST_FOLDER_URI_KEY, BIN_FOLDER_URI_KEY } from '../services/constants';


type SetupScreen1Props = NativeStackScreenProps<RootStackParamList, 'SetupScreen1'>;


const SetupScreen1 = ({navigation}: SetupScreen1Props) => {
  const [sourceFolderUri, setSourceFolderUri] = useState<string | null>(null);
  const [destinationFolderUri, setDestinationFolderUri] = useState<string | null>(null);

  useEffect(() => {
      
    }, []);
  const startPreview = () => {
    if (!sourceFolderUri || !destinationFolderUri) {
      Alert.alert('Missing folder', 'Select both a source folder and a bin folder first.');
      return;
    }

    navigation.replace('Preview', {
      folderUri: sourceFolderUri,
      binUri: destinationFolderUri,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Pick a source image folder</Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Pick source image folder"
          onPress={() => {
            pickFolder('Source folder error', DEST_FOLDER_URI_KEY).then((uri) => { 
              setSourceFolderUri(uri ?? null);
            });
          }
        }
          style={styles.button}>
          <Text style={styles.buttonText}>Select source image folder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Pick bin folder"
          onPress={() => {
            pickFolder('Bin folder error', BIN_FOLDER_URI_KEY).then((uri) => {
            setDestinationFolderUri(uri ?? null);
            });
          }}
          style={styles.buttonSecondary}>
          <Text style={styles.buttonText}>Select bin folder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Start preview"
          onPress={startPreview}
          style={styles.button}>
          <Text style={styles.buttonText}>Start preview</Text>
        </TouchableOpacity>

        <Text style={styles.pathLabel} numberOfLines={2}>
          {sourceFolderUri ?? 'No source folder selected'}
        </Text>

        <Text style={styles.pathLabel} numberOfLines={2}>
          {destinationFolderUri ?? 'No bin folder selected'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 24,
    backgroundColor: '#F5F7FB',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 22,
    textAlign: 'center',
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#0E7490',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#155E75',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pathLabel: {
    fontSize: 13,
    color: '#334155',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 36,
  },
});

export default SetupScreen1;
