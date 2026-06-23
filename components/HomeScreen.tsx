import React, {useState, useEffect} from 'react';
import {StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEST_FOLDER_URI_KEY, BIN_FOLDER_URI_KEY } from '../services/constants';

type HomeStackParamList = {
  Home: undefined;
  Settings: undefined;
  SetupScreen1: undefined;
  Preview: { folderUri: string; binUri: string; refreshToken?: number };
};

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const HomeScreen = ({navigation}: HomeScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkSavedFolder = async () => {
      const destUri = await AsyncStorage.getItem(DEST_FOLDER_URI_KEY);
      const binUri = await AsyncStorage.getItem(BIN_FOLDER_URI_KEY);
      if (destUri && binUri) {
        navigation.replace('Preview', {folderUri: destUri, binUri: binUri});
      } else {
        setIsLoading(false);
      }
    };
    checkSavedFolder();
  }, []);
  if (isLoading) return null; // or a splash/loading spinner
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <View style={styles.upperHalf}>
          <Text style={styles.title}>Let's get ready to swipe clean your phone!</Text>
        </View>

        <View style={styles.middleZone}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Start setup"
            onPress={() => navigation.replace('SetupScreen1')}
            style={styles.setupCard}>
            <Text style={styles.subtitle}>Start setup</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    backgroundColor: '#F5F7FB',
  },
  upperHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleZone: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  setupCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#0E7490',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '600',
  },
});

export default HomeScreen;
