
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator}  from '@react-navigation/native-stack';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen.tsx';
import ManageSourceFolderScreen from './components/ManageSourceFolderScreen.tsx';
import PreviewScreen from './components/PreviewScreen.tsx';
import SwipeScreen from './components/SwipeScreen.tsx';
import SettingsScreen from './components/SettingsScreen.tsx';
import PermissionScreen from './components/StoragePermissionGate';
import {RootStackParamList} from './types/navigation';
import {PhotoViewerProvider} from './context/PhotoViewerContext';
import {ManageSourceFolderProvider} from './context/ManageSourceFolderContext';
const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <PhotoViewerProvider>
      <ManageSourceFolderProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName='Permission'
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="Permission" component={PermissionScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="SetupScreen" component={SetupScreen} />
            <Stack.Screen name="ManageSourceFolderScreen" component={ManageSourceFolderScreen} />
            <Stack.Screen name="Preview" component={PreviewScreen} />
            <Stack.Screen name="Swipe" component={SwipeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ManageSourceFolderProvider>
    </PhotoViewerProvider>
  );
};

export default App;