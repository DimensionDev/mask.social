import type React from 'react';

interface PostContainerProps {
    children: React.ReactNode;
    ContainerStyle?: React.CSSProperties;
}

export function PostContainer({ children, ContainerStyle }: PostContainerProps) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                fontWeight: 400,
                fontFamily: 'Inter',
                ...ContainerStyle,
            }}
        >
            {children}
        </div>
    );
}
