import React, {useState, useEffect} from 'react';
import {
  Alert,
  Image,
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
import Icon from 'react-native-vector-icons/Ionicons';


import { DEST_FOLDER_URI_KEY, BIN_FOLDER_URI_KEY } from '../services/constants';


type SetupScreenProps = NativeStackScreenProps<RootStackParamList, 'SetupScreen'>;


const SetupScreen = ({navigation}: SetupScreenProps) => {
  const [sourceFolderUri, setSourceFolderUri] = useState<string | null>(null);
  const [destinationFolderUri, setDestinationFolderUri] = useState<string | null>(null);

  useEffect(() => {
      if (sourceFolderUri && destinationFolderUri) {
        setTimeout(() => {
          startPreview();
        }, 1000);
      }
    }, [sourceFolderUri, destinationFolderUri]);


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
      <Text style={styles.title}>Let's set up your folders</Text>
     
        <Image
          source={require('../assets/folder_teaser.png')}
          style={styles.image}
        />
        <Text style={styles.infoText}>
          First, pick the folder where your photos live.
           We'll bring up photos from it for you to swipe through, one at a time.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Choose photo folder"
          onPress={() => {
            pickFolder('Source folder error', DEST_FOLDER_URI_KEY).then((uri) => { 
              setSourceFolderUri(uri ?? null);
            });
          }
        }
          style={styles.button}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Select source image folder
            </Text>
            {sourceFolderUri && <Icon name="checkmark-circle" size={24} color="#fff" style={styles.checkIcon} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.infoText}>
          Next, pick a bin folder. When you swipe a photo away, it moves here. 
          Nothing gets deleted forever, so you can always double-check or recover it later.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Choose bin folder"
          onPress={() => {
            pickFolder('Bin folder error', BIN_FOLDER_URI_KEY).then((uri) => {
            setDestinationFolderUri(uri ?? null);
            });
          }}
          style={styles.button}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Select bin folder</Text>
            {destinationFolderUri && <Icon name="checkmark-circle" size={20} color="#fff" style={styles.checkIcon} />}
          </View>
        </TouchableOpacity>
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
    marginTop: 12,
    marginBottom: 24,
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pathLabel: {
    fontSize: 13,
    color: '#5a5a5a',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 36,
  },

  buttonContent: {
    flexDirection: 'row', 
    alignItems: 'center'
  },

  infoText: {
    fontSize: 14, 
    color: '#5a5a5a',
    textAlign: 'justify',
    marginTop: 12,
    marginStart: 24,
    marginEnd: 24,
  },

  image: {
    width: '70%', 
    height: 220, 
    alignSelf: 'center',
    resizeMode: 'contain'
  },
  checkIcon: {
    marginLeft: 24,
  },

  
});

export default SetupScreen;
