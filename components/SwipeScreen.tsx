import React from 'react';
import {Alert, StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import PhotoViewer from './PhotoViewer';
import {moveToBin} from '../services/fileManagerService';
import {RootStackParamList} from '../types/navigation';
import {usePhotoViewer} from '../context/PhotoViewerContext';
import {photoStateService} from '../services/photoStateInstance.ts';

type SwipeScreenProps = NativeStackScreenProps<RootStackParamList, 'Swipe'>;

const SwipeScreen = ({navigation, route}: SwipeScreenProps) => {

  const {setRememberedIndex} = usePhotoViewer();

  const returnToPreview = (index: number) => {
    setRememberedIndex(index);
    navigation.goBack();
    //navigation.popTo('Preview', {
    //  folderUri: route.params.folderUri,
    //  binUri: route.params.binUri,
    //  rememberedIndex: index,
    //});
  };

  const returnToPreviewWithFinishedActivity = () => {
    setRememberedIndex(0); // finished the whole set, so reset
    navigation.popTo('Preview', {
      folderUri: route.params.folderUri,
      binUri: route.params.binUri,
      refreshToken: Date.now(),
    });
  };

  const onKeep = async (uri: string, date: string, lat: number | null, lon: number | null) => {
    const result = await photoStateService.saveUri(uri, date, lat, lon, 'kept');
    return result;
  }

  const onDelete = async (uri: string, date: string, lat: number | null, lon: number | null) => {
    await photoStateService.saveUri(uri, date, lat, lon, 'deleted');
    const result = await moveToBin(uri, route.params.binUri);
    return result;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <PhotoViewer
          photos={route.params.photos}
          startIndex={route.params.rememberedIndex ?? 0}
          onKeep={onKeep}
          onDelete={onDelete}
          onClose={returnToPreview}
          onComplete={() => {
            returnToPreviewWithFinishedActivity();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default SwipeScreen;
