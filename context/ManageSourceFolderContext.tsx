import React, {createContext, useContext, useRef} from 'react';

type ManageSourceFolderContextValue = {
  getSourceFolderUris: () => string[];
  setSourceFolderUris: (uris: string[]) => void;
};

const ManageSourceFolderContext = createContext<ManageSourceFolderContextValue | undefined>(undefined);

export const ManageSourceFolderProvider = ({children}: {children: React.ReactNode}) => {
  const sourceFolderUrisRef = useRef<string[]>([]);

  const value: ManageSourceFolderContextValue = {
    getSourceFolderUris: () => sourceFolderUrisRef.current,
    setSourceFolderUris: (uris) => {
      sourceFolderUrisRef.current = uris;
    },
  };

  return (
    <ManageSourceFolderContext.Provider value={value}>
      {children}
    </ManageSourceFolderContext.Provider>
  );
};

export const useManageSourceFolder = () => {
  const ctx = useContext(ManageSourceFolderContext);
  if (!ctx) {
    throw new Error('useManageSourceFolder must be used within a ManageSourceFolderProvider');
  }
  return ctx;
};