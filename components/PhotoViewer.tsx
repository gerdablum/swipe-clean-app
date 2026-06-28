import React, {useMemo, useRef, useState, useEffect} from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';

import { getImageMetadata } from '../services/fileManagerService';
import Icon from 'react-native-vector-icons/Ionicons';
import { ExifNativeResult } from '../services/fileManagerService';


type Props = {
  photos: string[];
  startIndex: number | undefined;
  onKeep?: (uri: string, date: string, lat: number | null, lon: number | null) => Promise<boolean> | boolean;
  onDelete?: (uri: string, date: string, lat: number | null, lon: number | null) => Promise<boolean> | boolean;
  onComplete?: () => void;
  onClose?: (index: number) => void;
};

const SWIPE_THRESHOLD = 120;

const PhotoViewer = ({photos, startIndex, onKeep, onDelete, onComplete, onClose}: Props) => {

  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [index, setIndex] = useState<number>(startIndex ?? 0);
  const pan = useRef(new Animated.ValueXY()).current;
  const exifPromiseRef = useRef<Promise<ExifNativeResult | null> | null>(null);

  useEffect(() => {
    setDate('');
    setLocation('');
  }, [index]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose?.(index);
      return true;
    });

    return () => subscription.remove();
  }, [index, onClose]);

  const setIndexAndAnimationFrame = (idx: number) => {
    setIndex(idx);
    requestAnimationFrame(() => {
      pan.setValue({ x: 0, y: 0 });
    });
  };
  
  const handleAction = async (action: 'keep' | 'delete') => {
    const uri = photos[index];
    const exif = await exifPromiseRef.current;
    if (action === 'keep') {
      const kept = await onKeep?.(uri, exif?.dateTime ?? "", exif?.lat ?? null, exif?.lon ?? null);
      if (kept === false) {
        console.error('Failed to save status kept: ', uri);
        return;
      }
    } else if (action === 'delete') {
      const moved = await onDelete?.(uri, exif?.dateTime ?? "", exif?.lat ?? null, exif?.lon ?? null);
      if (moved === false) {
        console.error('Failed to delete photo: ', uri);
        return;
      }
    }
    const next = index + 1;
    if (next >= photos.length) {
      onComplete?.();
      return;
    }
    setIndexAndAnimationFrame(next);
  };

  const navigateWithoutAction = (isForward: boolean) => {
    if (isForward) {
      const next = index + 1;
      if (next >= photos.length) return;
      setIndexAndAnimationFrame(next);
    } else {
      const previous = index - 1;
      if (previous < 0) return;
      setIndexAndAnimationFrame(previous);
    }
  };

  const handleImageLoad = async (uri: string) => {
      exifPromiseRef.current  = getImageMetadata(uri);
      exifPromiseRef.current.then((exif) => {
        if (exif?.dateTime) {
          setDate(formatExifDate(exif.dateTime));
        } else {
          setDate('');
        }
        if (exif?.lat != null && exif?.lon != null) {
          setLocation(`${exif.lat}, ${exif.lon}`);
        } else {
          setLocation('');
        }
    });
  };

  function formatExifDate(exifDate: string) {
    if (!exifDate) return "";

    const [date] = exifDate.split(' ');
    const [year, month, day] = date.split(':');

    return `${day}.${month}.${year}`;
  };
  

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_evt, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: {x: 500, y: 0},
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              void handleAction('keep');
            });
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: {x: -500, y: 0},
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              void handleAction('delete');
            });
          } else {
            Animated.spring(pan, {toValue: {x: 0, y: 0}, useNativeDriver: false}).start();
          }
        },
      }),
    [handleAction, index, pan, photos.length],
  );

  if (!photos || photos.length === 0) return null;

  const uri = photos[index];

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Close and return to preview"
        onPress={() => onClose?.(index)}
        style={styles.closeButton}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.dateLocationText}>{date}</Text>
        <Text style={styles.dateLocationText}>{location}</Text>
      </View>
      <Animated.View
        style={[styles.card, {transform: [{translateX: pan.x}, {translateY: pan.y}]}]}
        {...panResponder.panHandlers}>
        <Image source={{uri}} style={styles.image} resizeMode="cover" onLoad={() => handleImageLoad(uri)} />
      </Animated.View>

      <View style={styles.actions}>
       
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            void handleAction('delete');
          }}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
         <TouchableOpacity
          style={[styles.actionButton, styles.keepButton]}
          onPress={() => {
            void handleAction('keep');
          }}>
          <Text style={styles.actionText}>Keep</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.counter}>
        <TouchableOpacity
        onPress={() => {navigateWithoutAction(false)}}>
          <Icon name="chevron-back" size={48} color="#fff" style={styles.arrowIcon} />
        </TouchableOpacity>
        <Text style={styles.counterText}>{index + 1} / {photos.length}</Text>
        <TouchableOpacity
        onPress={() => {navigateWithoutAction(true)}}>
          <Icon name="chevron-forward" size={48} color="#fff" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  card: {
    width: '92%',
    height: '72%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  keepButton: {
    backgroundColor: '#0E7490',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  counter: {
    position: 'absolute',
    top: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  textContainer: {
    flexDirection: 'row',
    width: '92%',

  },
  dateLocationText: {
    color: '#fff',
    fontSize: 16,
    marginEnd: 12,
    marginBottom: 8,
  }, 
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  arrowIcon: {
    marginHorizontal: 12,
  },
});

export default PhotoViewer;
