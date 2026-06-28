import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  Alert, 
  FlatList, 
  Image, 
  Pressable, 
  StatusBar, 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getAllImageUrisInFolder} from '../services/fileManagerService';
import {pick16RandomItems} from '../services/utils';
import {RootStackParamList} from '../types/navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import {usePhotoViewer} from '../context/PhotoViewerContext';
import {photoStateService} from '../services/photoStateInstance.ts';

type PreviewScreenProps = NativeStackScreenProps<RootStackParamList, 'Preview'>;

const PreviewScreen = ({navigation, route}: PreviewScreenProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loadingText, setLoadingText] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {getRememberedIndex, setRememberedIndex} = usePhotoViewer();

  const loadPreview = useCallback(async () => {
    setLoadingText(true);
    setRefreshing(true);
    try {
      const allFiles = await getAllImageUrisInFolder(route.params.folderUri);
      if (!allFiles) {
        Alert.alert('Preview error', 'Unable to load image preview.');
        return;
      }
     
      const unseen = await photoStateService.getUnseenUris(allFiles);
      const files = pick16RandomItems(unseen);
      setPhotos(files);
    } catch (error) {
      Alert.alert('Preview error', 'Unable to load image preview.');
    } finally {
      setRefreshing(false);
      setLoadingText(false);
      setRememberedIndex(0); // reset remembered index when loading new set of photos
    }
  }, [route.params.folderUri]);

  // loads on mount
  useEffect(() => {
    void loadPreview();
  }, []);

  useEffect(() => {
    if (route.params.refreshToken) {
      void loadPreview();
    }
  }, [loadPreview, route.params.refreshToken]);



  const startSwiping = () => {
    navigation.navigate('Swipe', {
      photos,
      folderUri: route.params.folderUri,
      binUri: route.params.binUri,
      rememberedIndex: getRememberedIndex(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => navigation.navigate('Settings', {
            sourceUri: route.params.folderUri,
            binUri: route.params.binUri,
          })}
          style={styles.settingsButton}>
          <Icon name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadPreview()} />
        }>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start swiping"
          onPress={startSwiping}
          style={({pressed}) => [styles.button, pressed && styles.buttonPressed, !photos.length && styles.buttonDisabled]}
          disabled={!photos.length}>
          <Text style={styles.buttonText}>Start swiping</Text>
        </Pressable>

        <Text style={styles.subtitle}>
          {loadingText ? 'Loading...' : `Pull down to refresh.`}
        </Text>

        <FlatList
          data={photos}
          keyExtractor={(item) => item}
          numColumns={4}
          style={styles.list}
          renderItem={({item}) => <Image source={{uri: item}} style={styles.thumbnail} />}
          contentContainerStyle={styles.grid}
          scrollEnabled={false}
        />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
   topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginLeft: 30,
  },
  settingsButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  settingsIcon: {
    color: '#0F172A',
    fontSize: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#0E7490',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 12,
    textAlign: 'center',
  },
  grid: {
    paddingBottom: 24,
  },
  list: {
    flexGrow: 0,
  },
  reviewButton: {
    backgroundColor: '#860000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  reviewButtonPressed: {
    opacity: 0.9,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'none',
  },
  thumbnail: {
    width: '24%',
    aspectRatio: 1,
    margin: '0.5%',
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
});

export default PreviewScreen;
