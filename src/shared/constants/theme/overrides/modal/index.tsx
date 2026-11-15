// oxlint-disable
import { Modal, ModalOverlay } from '@mantine/core'

import { scrollLockShards } from '@shared/utils/scroll-lock-shards'

import classes from './modal.module.css'

export default {
    Modal: Modal.extend({
        classNames: {
            root: classes.modalRoot,
            header: classes.modalHeader,
            title: classes.modalTitle,
            close: classes.modalClose,
            body: classes.modalBody,
            content: classes.modalContent
        },
        defaultProps: {
            removeScrollProps: { shards: scrollLockShards },
            transitionProps: { transition: 'pop', duration: 180 },
            closeButtonProps: { size: 'lg', iconSize: 18 },
            padding: 'lg',
            radius: 18,
            centered: true
        }
    }),
    ModalOverlay: ModalOverlay.extend({
        defaultProps: {
            color: '#0A0609',
            backgroundOpacity: 0.72,
            blur: 2
        }
    })
}
