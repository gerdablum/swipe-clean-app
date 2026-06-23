import React from 'react';
import {Alert, StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import PhotoViewer from './PhotoViewer';
import {moveToBin, saveUri} from '../services/photoSession';
import {RootStackParamList} from '../types/navigation';
import {usePhotoViewer} from '../context/PhotoViewerContext';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <PhotoViewer
          photos={route.params.photos}
          startIndex={route.params.rememberedIndex ?? 0}
          onKeep={(uri) => {saveUri(uri, route.params.folderUri)}}
          onDelete={(uri) => moveToBin(uri, route.params.binUri)}
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
