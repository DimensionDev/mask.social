import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import React, { forwardRef, useState } from 'react';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Modal } from '@/components/Modal.js';
import { Tooltip } from '@/components/Tooltip.js';

export interface ConfirmModalOpenProps {
    title?: string;
    content: React.ReactNode;
}

export type ConfirmModalCloseProps = boolean;

export const ConfirmModal = forwardRef<SingletonModalRefCreator<ConfirmModalOpenProps, ConfirmModalCloseProps>>(
    function ConfirmModal(_, ref) {
        const [title, setTitle] = useState<string>();
        const [content, setContent] = useState<React.ReactNode>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setTitle(props.title);
                setContent(props.content);
            },
        });

        return (
            <Modal open={open} onClose={() => dispatch?.close(false)}>
                <div className="relative w-[355px] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950">
                    <div className="inline-flex h-[56px] w-[355px] items-center justify-center gap-2 rounded-t-[12px] p-4">
                        <ClickableButton onClick={() => dispatch?.close(false)}>
                            <Tooltip content={t`Close`} placement="top">
                                <CloseIcon className=" relative text-main" width={24} height={24} />
                            </Tooltip>
                        </ClickableButton>
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            {title ? title : <Trans>Confirmation</Trans>}
                        </div>
                        <div className="relative h-6 w-6" />
                    </div>

                    <div className="flex flex-col gap-3 p-6">
                        {content}
                        <ClickableButton
                            className=" flex items-center justify-center rounded-full bg-commonDanger py-[11px] font-bold text-lightBottom"
                            onClick={() => dispatch?.close(true)}
                        >
                            {t`Confirm`}
                        </ClickableButton>
                    </div>
                </div>
            </Modal>
        );
    },
);
