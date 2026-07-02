import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  BackHandler,
  FlatList,
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
import { useManageSourceFolder } from '../context/ManageSourceFolderContext';

const MAX_SOURCE_FOLDERS = 5;

const formatFolderLabel = (uri: string): string => {
  const decodedUri = decodeURIComponent(uri);
  const treeIndex = decodedUri.indexOf('/tree/');
  const documentIndex = decodedUri.indexOf('/document/');
  const startIndex = treeIndex >= 0 ? treeIndex + '/tree/'.length : documentIndex >= 0 ? documentIndex + '/document/'.length : -1;
  const displayValue = startIndex >= 0 ? decodedUri.slice(startIndex) : decodedUri;
  const folderPath = displayValue.includes(':') ? displayValue.split(':').slice(1).join(':') : displayValue;
  return folderPath.replace(/^\/+/, '') || decodedUri;
};

type ManageSourceFolderScreenProps = NativeStackScreenProps<RootStackParamList, 'ManageSourceFolderScreen'>;

const ManageSourceFolderScreen = ({navigation, route}: ManageSourceFolderScreenProps) => {

  const {setSourceFolderUris} = useManageSourceFolder();
  
  const [sourceFolders, setSourceFolders] = useState<string[]>([]);
  const folderAnimations = useRef<Record<string, Animated.Value>>({});

  const getFolderAnimation = (uri: string) => {
    if (!folderAnimations.current[uri]) {
      folderAnimations.current[uri] = new Animated.Value(1);
    }

    return folderAnimations.current[uri];
  };

  const handleBack = () => {
    if (route.params.origin === 'settings') {
      navigation.goBack();
      return;
    }

    if (sourceFolders.length > 0) {
      navigation.popTo('SetupScreen', {sourceFolderSelected: true});
      return;
    }

    navigation.popTo('SetupScreen');
  };

  useEffect(() => {
    const loadSourceFolders = async () => {
      const sourceFolders = await folderPickerService.getSourceFolders()
      setSourceFolderUris(sourceFolders);
      setSourceFolders(sourceFolders);
    };

    void loadSourceFolders();
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      handleBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => subscription.remove();
  }, [navigation, route.params.origin, sourceFolders.length]);

  const handleAddFolder = async () => {
    if (sourceFolders.length >= MAX_SOURCE_FOLDERS) {
      return;
    }

    const uri = await folderPickerService.addSourceFolder();
    if (uri && !sourceFolders.includes(uri)) {
      const uris = [...sourceFolders, uri];
      setSourceFolderUris(uris)
      setSourceFolders(uris);
    }
  };

  const handleRemoveFolder = (uri: string) => {
    const animation = getFolderAnimation(uri);

    Animated.timing(animation, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (!finished) {
        return;
      }

      void folderPickerService.removeSourceFolder(uri);
      const updatedFolders = sourceFolders.filter((folderUri) => folderUri !== uri);
      setSourceFolderUris(updatedFolders);
      setSourceFolders(updatedFolders);
      delete folderAnimations.current[uri];
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage source folders</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            style={styles.backButton}>
            <Icon name="chevron-back" size={28} color="#000000" />
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          You can add folders containing images or photos with the "+" button below. You can add up to 5 folders.
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add source folder"
          onPress={() => {
            void handleAddFolder();
          }}
          style={[styles.addButton, sourceFolders.length >= MAX_SOURCE_FOLDERS && styles.addButtonDisabled]}>
          <Icon name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <FlatList
          data={sourceFolders}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyState}>No source folders added yet.</Text>}
          renderItem={({item}) => {
            const animation = getFolderAnimation(item);

            return (
              <Animated.View
                style={[
                  styles.listItem,
                  {
                    opacity: animation,
                    transform: [
                      {
                        scale: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.88, 1],
                        }),
                      },
                    ],
                  },
                ]}>
                <Text style={styles.listItemText} numberOfLines={2}>
                  {formatFolderLabel(item)}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Delete source folder"
                  onPress={() => {
                    handleRemoveFolder(item);
                  }}
                  style={styles.deleteButton}>
                  <Icon name="trash-outline" size={22} color="#B91C1C" />
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
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
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    minWidth: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    marginBottom: 20,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0E7490',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonDisabled: {
    opacity: 0.45,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyState: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  listItemText: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
  },
});

export default ManageSourceFolderScreen;
