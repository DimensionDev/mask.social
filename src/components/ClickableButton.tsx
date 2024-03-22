import type React from 'react';

interface ClickableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onClick?: () => void;
}

export function ClickableButton({ children, onClick, ...props }: ClickableButtonProps) {
    return (
        <ClickableButton
            {...props}
            onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                onClick?.();
            }}
        >
            {children}
        </ClickableButton>
    );
}
