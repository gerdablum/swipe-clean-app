import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, BackHandler} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import {Alert} from 'react-native';
import {openFolderInFileManager} from '../services/fileManagerService';
import {pickFolder} from '../services/folderPickerService';
import {photoStateService} from '../services/photoStateInstance.ts';

import { DEST_FOLDER_URI_KEY, BIN_FOLDER_URI_KEY } from '../services/constants';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
const settingsItems = [
  {id: 'sourceFolder', label: 'Change source folder'},
  {id: 'binFolder', label: 'Change bin folder'},
];



const SettingsScreen = ({navigation, route}: SettingsScreenProps) => {
  const binFolderUri = useRef<string | null>(route.params.binUri);
  const sourceFolderUri = useRef<string | null>( route.params.sourceUri);
  const refreshToken = useRef<number | undefined>(undefined);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true; // true = we handled it, prevent default behavior
    });

    return () => subscription.remove();
  }, []);
  const openBinFolder = async () => {
    const opened = await openFolderInFileManager(binFolderUri.current ?? "");
    if (!opened) {
      Alert.alert('Unable to open folder', 'The system file manager could not open the bin folder.');
    }
  };

  const handleBack = () => {
    navigation.popTo('Preview', {
      folderUri: sourceFolderUri.current ?? "", 
      binUri: binFolderUri.current ?? "", 
      refreshToken: refreshToken.current,
    });
    refreshToken.current = undefined;
  };
  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.sectionHeader}>Preferences</Text>
            <TouchableOpacity style={styles.backButton} 
              onPress={handleBack}>
                <Icon name="chevron-back" size={28} color="#000000" />
            </TouchableOpacity>
            
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.infoText}>
            Change the folders in which the app looks for photos or puts the photos you want to delete.
          </Text>
          <View style={styles.list}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity key={item.id} style={[styles.item, index === 0 && styles.firstItem]} 
              onPress={() => {
                if (item.id === 'sourceFolder') {
                  pickFolder('Source folder error', DEST_FOLDER_URI_KEY).then((sourceUri) => {
                    sourceFolderUri.current = sourceUri ?? "";
                    refreshToken.current = Date.now();
                  });
                } else if (item.id === 'binFolder') {
                  pickFolder('Bin folder error', BIN_FOLDER_URI_KEY).then((binUri) => {
                    binFolderUri.current = binUri ?? "";
                    refreshToken.current = Date.now();
                  });
                  
                }
              }}>
                <Text style={styles.itemText}>{item.label}</Text>
                <Icon name="chevron-forward" size={20} color="#000000" />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.infoText}>
            The app remembers photos you decided to keep and doesn't present them again. If you press the button below, your 
            choices will be resetted and all photos will be shown again.
          </Text>
          <TouchableOpacity style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                  'Reset choices',
                  'Are you sure you want to reset your choices? This cannot be undone.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => { 
                        photoStateService.deleteAll();
                        refreshToken.current = Date.now();
                      },
                      style: 'destructive',
                    },
                  ],
                );
            }}>
            <Text style={styles.actionText}>Reset "keep" decisions</Text>
          </TouchableOpacity>
          <Text style={styles.infoText}>
            The app never deletes your photos on its own. It just moves them into your specified bin folder.
            You can open this folder in your file system by clicking the button below and delete the photos by yourself.
          </Text>
          <TouchableOpacity style={styles.navigateBinButton}
            onPress={() => {
              void openBinFolder();
            }}
            >
            <Text style={styles.actionText}>Open bin folder</Text>
          </TouchableOpacity>
        </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    marginTop: 52,
   
  },
  contentContainer: {
    flex: 1,
    marginTop: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    minWidth: 32,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  sectionHeader: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
  },
  list: {
    marginTop: 42,
  },
   firstItem: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 18,
    color: '#000',
  },
  
infoText: {
    marginTop: 24, 
    fontSize: 14, 
    color: '#5a5a5a'
  },  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 8,

    marginTop: 16,
  },

  navigateBinButton: {
    backgroundColor: '#0E7490',
    paddingHorizontal: 26,  
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
});

export default SettingsScreen;