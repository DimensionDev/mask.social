import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

interface PayloadContainerProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    children: React.ReactNode;
    ContainerStyle?: React.CSSProperties;
}

export function PayloadContainer({ theme, children, ...props }: PayloadContainerProps) {
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
                backgroundSize: '100% 100%',
                backgroundImage: theme.cover.bg_image ? `url("${theme.cover.bg_image}")` : '',
                backgroundColor: theme.cover.bg_color ?? 'transparent',
                backgroundRepeat: 'no-repeat',
                ...props.ContainerStyle,
            }}
        >
            {children}
        </div>
    );
}
