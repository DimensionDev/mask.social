import type { ImgHTMLAttributes, Ref, SyntheticEvent } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { classNames } from '@/helpers/classNames.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
}

export const Image = forwardRef(function Image({ onError, fallback, ...props }: Props, ref: Ref<HTMLImageElement>) {
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
        // Since next/image requires the domain of the image to be configured in next.cong,
        // But we can't predict the origin of all images.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            {...props}
            src={
                imageLoadFailed || !props.src
                    ? fallback || (isDarkMode ? '/image/fallback-dark.png' : '/image/fallback-light.png')
                    : props.src
            }
            className={classNames(props.className, 'border border-secondaryLine')}
            onError={handleError}
            alt={props.alt || ''}
            ref={ref}
        />
    );
});
