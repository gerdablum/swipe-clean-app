import React, {useCallback} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import HomeScreen from './components/HomeScreen';
import SetupScreen1 from './components/SetupScreen1';
import PreviewScreen from './components/PreviewScreen.tsx';
import SwipeScreen from './components/SwipeScreen.tsx';
import SettingsScreen from './components/SettingsScreen.tsx';
import StoragePermissionGate from './components/StoragePermissionGate';
import {RootStackParamList} from './types/navigation';
import {PhotoViewerProvider} from './context/PhotoViewerContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

type PermissionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Permission'
>;

const PermissionScreen = ({navigation}: PermissionScreenProps) => {
  const handlePermissionGranted = useCallback(() => {
    navigation.replace('Home');
  }, [navigation]);

  return (
    <StoragePermissionGate
      appName="SwipeClean"
      onPermissionGranted={handlePermissionGranted}
    />
  );
};

const App = () => {
  return (
    <PhotoViewerProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Permission"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Permission" component={PermissionScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SetupScreen1" component={SetupScreen1} />
          <Stack.Screen name="Preview" component={PreviewScreen} />
          <Stack.Screen name="Swipe" component={SwipeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PhotoViewerProvider>
  );
};

export default App;