export type RootStackParamList = {
  Permission: undefined;
  Home: undefined;
  Settings: {sourceUris: string[]; binUri: string;};
  SetupScreen: {sourceFolderSelected?: boolean} | undefined;
    ManageSourceFolderScreen: {origin: 'setup' | 'settings'};
  Preview: {sourceUris: string[]; binUri: string; refreshToken?: number};
  Swipe: {photos: string[]; soureUris: string[]; binUri: string, rememberedIndex?: number};
};


