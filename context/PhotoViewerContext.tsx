import React, {createContext, useContext, useRef} from 'react';

type PhotoViewerContextValue = {
  getRememberedIndex: () => number;
  setRememberedIndex: (index: number) => void;
};

const PhotoViewerContext = createContext<PhotoViewerContextValue | undefined>(undefined);

export const PhotoViewerProvider = ({children}: {children: React.ReactNode}) => {
  const indexRef = useRef(0);

  const value: PhotoViewerContextValue = {
    getRememberedIndex: () => indexRef.current,
    setRememberedIndex: (index) => {
      indexRef.current = index;
    },
  };

  return <PhotoViewerContext.Provider value={value}>{children}</PhotoViewerContext.Provider>;
};

export const usePhotoViewer = () => {
  const ctx = useContext(PhotoViewerContext);
  if (!ctx) {
    throw new Error('usePhotoViewer must be used within a PhotoViewerProvider');
  }
  return ctx;
};