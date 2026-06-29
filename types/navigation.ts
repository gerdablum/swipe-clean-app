export type RootStackParamList = {
  Permission: undefined;
  Home: undefined;
  Settings: {sourceUri: string; binUri: string;};
  SetupScreen: undefined;
  Preview: {folderUri: string; binUri: string; refreshToken?: number};
  Swipe: {photos: string[]; folderUri: string; binUri: string, rememberedIndex?: number};
};


