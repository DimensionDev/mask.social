import type { ImageProps as NextImageProps } from 'next/image.js';
import type { Ref, SyntheticEvent } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { Image as NextImage } from '@/esm/Image.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

export interface ImageProps extends NextImageProps {
    fallback?: string;
}

export const Image = forwardRef(function Image(
    { onError, fallback, ...props }: ImageProps,
    ref: Ref<HTMLImageElement>,
) {
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const { isDarkMode } = useDarkMode();

    const handleError = useCallback(
        (e: SyntheticEvent<HTMLImageElement>) => {
            if (imageLoadFailed) {
                return;
            }
            setImageLoadFailed(true);
            if (onError) {
                onError(e);
            }
        },
        [imageLoadFailed, setImageLoadFailed, onError],
    );

    useEffect(() => {
        setImageLoadFailed(!props.src);
    }, [props.src]);

    // TODO: replace failed fallback image
    return (
        // Since next/image requires the domain of the image to be configured in next.config,
        // But we can't predict the origin of all images.
        // eslint-disable-next-line @next/next/no-img-element
        <NextImage
            {...props}
            unoptimized
            loading="lazy"
            priority={false}
            src={
                imageLoadFailed || !props.src
                    ? fallback || (isDarkMode ? '/image/fallback-dark.png' : '/image/fallback-light.png')
                    : props.src
            }
            className={props.className}
            onError={handleError}
            alt={props.alt || ''}
            ref={ref}
        />
    );
});
