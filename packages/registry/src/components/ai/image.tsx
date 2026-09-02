import { cn } from '@/registry/{engine}/lib/utils';
import * as React from 'react';
import { Image as RNImage, View, type ImageProps as RNImageProps } from 'react-native';

/**
 * Image — a model-generated image.
 *
 * The caller passes the AI SDK result object, not a `src`: the web original builds
 * `data:{mediaType};base64,{base64}` internally, and that prop shape is preserved so
 * callers do not change.
 *
 * `alt` is a real prop, not decoration — it becomes accessibilityLabel.
 *
 * NOTE ON LARGE IMAGES: React Native accepts a data URI, but a multi-megabyte base64
 * string crosses the bridge as a string and is a real memory and jank cost. For anything
 * large, write it to cache with expo-file-system and pass `uri` instead. That is left to
 * the caller rather than pulled in here, so the component stays dependency-free.
 */

type GeneratedImage = { base64?: string; mediaType?: string; uri?: string };

type ImageProps = Omit<RNImageProps, 'source'> & {
  /** AI SDK Experimental_GeneratedImage, or anything with base64 + mediaType, or a uri. */
  image?: GeneratedImage;
  base64?: string;
  mediaType?: string;
  uri?: string;
  alt: string;
  /** width / height. Generated images usually know theirs from the request. */
  aspectRatio?: number;
  className?: string;
};

function Image({
  image,
  base64,
  mediaType = 'image/png',
  uri,
  alt,
  aspectRatio = 1,
  className,
  ...props
}: ImageProps) {
  const src = React.useMemo(() => {
    const u = uri ?? image?.uri;
    if (u) return u;
    const b = base64 ?? image?.base64;
    if (!b) return undefined;
    return `data:${image?.mediaType ?? mediaType};base64,${b}`;
  }, [uri, image, base64, mediaType]);

  if (!src) return null;

  return (
    <View className={cn('overflow-hidden rounded-md bg-muted', className)} style={{ aspectRatio }}>
      <RNImage
        source={{ uri: src }}
        accessibilityLabel={alt}
        accessible
        resizeMode="cover"
        className="h-full w-full"
        {...props}
      />
    </View>
  );
}

export { Image };
