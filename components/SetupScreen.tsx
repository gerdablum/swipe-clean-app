import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {folderPickerService} from '../services/folderPickerInstance';
import {RootStackParamList} from '../types/navigation';

type SetupScreenProps = NativeStackScreenProps<RootStackParamList, 'SetupScreen'>;

const SetupScreen = ({navigation, route}: SetupScreenProps) => {
  const [sourceFolderUris, setSourceFolderUris] = useState<string[] | null>(null);
  const [destinationFolderUri, setDestinationFolderUri] = useState<string | null>(null);
  const sourceCheckAnimation = useRef(new Animated.Value(0)).current;
  const binCheckAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadSelectedSourceFolder = async () => {
      if (route.params?.sourceFolderSelected) {
        setSourceFolderUris(await folderPickerService.getSourceFolders());
      }
    };

    void loadSelectedSourceFolder();
  }, [route.params?.sourceFolderSelected]);

  useEffect(() => {
    Animated.timing(sourceCheckAnimation, {
      toValue: sourceFolderUris && sourceFolderUris.length > 0 ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [sourceCheckAnimation, sourceFolderUris]);

  useEffect(() => {
    Animated.timing(binCheckAnimation, {
      toValue: destinationFolderUri ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [binCheckAnimation, destinationFolderUri]);

  useEffect(() => {
    if (!sourceFolderUris || sourceFolderUris.length === 0 || !destinationFolderUri) {
      return;
    }

    const timeoutId = setTimeout(() => {
      navigation.replace('Preview', {
        sourceUris: sourceFolderUris,
        binUri: destinationFolderUri,
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [destinationFolderUri, navigation, sourceFolderUris]);

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
        {sourceFolderUris && sourceFolderUris.length > 0 ? (
          <View style={styles.successRow}>
            <Text style={styles.successText}>Source folders picked successfully!</Text>
            <Animated.View
              style={[
                styles.successIconWrapper,
                {
                  opacity: sourceCheckAnimation,
                  transform: [
                    {
                      scale: sourceCheckAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                  ],
                },
              ]}>
              <Icon name="checkmark-circle" size={24} color="#fff" />
            </Animated.View>
          </View>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Choose photo folder"
            onPress={() => {
              navigation.navigate('ManageSourceFolderScreen', {origin: 'setup'});
            }}
            style={styles.button}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Select source image folder</Text>
            </View>
          </TouchableOpacity>
        )}
        <Text style={styles.infoText}>
          Next, pick a bin folder. When you swipe a photo away, it moves here.
          {' '}Nothing gets deleted forever, so you can always double-check or recover it later.
        </Text>
        {destinationFolderUri ? (
          <View style={styles.successRow}>
            <Text style={styles.successText}>Bin folder picked successfully!</Text>
            <Animated.View
              style={[
                styles.successIconWrapper,
                {
                  opacity: binCheckAnimation,
                  transform: [
                    {
                      scale: binCheckAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                  ],
                },
              ]}>
              <Icon name="checkmark-circle" size={24} color="#fff" />
            </Animated.View>
          </View>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Choose bin folder"
            onPress={() => {
              folderPickerService.changeBinFolder().then((uri) => {
                setDestinationFolderUri(uri ?? null);
              });
            }}
            style={styles.button}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Select bin folder</Text>
            </View>
          </TouchableOpacity>
        )}
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E7490',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successIconWrapper: {
    marginLeft: 16,
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
    width: '50%',
    height: 200,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});

export default SetupScreen;
