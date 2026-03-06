import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleSheet,
  View,
} from 'react-native';
import imageCacheService from '../services/imageCacheService';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  showPlaceholder?: boolean;
}

export default function CachedImage({
  uri,
  showPlaceholder = true,
  style,
  ...props
}: CachedImageProps) {
  const [imageUri, setImageUri] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!uri) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const cachedUri = await imageCacheService.getImageUri(uri);
        if (!cancelled) setImageUri(cachedUri);
        if (cachedUri === uri) {
          imageCacheService.cacheImage(uri);
        }
      } catch (error) {
        if (!cancelled) setImageUri(uri);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [uri]);

  if (!uri) return null;

  return (
    <View style={[styles.container, style]}>
      {imageUri ? (
        <Image
          {...props}
          source={{ uri: imageUri }}
          style={[StyleSheet.absoluteFillObject, props.style]}
          onLoadEnd={() => setLoading(false)}
        />
      ) : null}
      {loading && showPlaceholder && (
        <View style={styles.placeholder}>
          <ActivityIndicator size="small" color="#D97706" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
});
