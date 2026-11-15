import { Group, Modal, ModalProps, useProps } from '@mantine/core'
import { ReactNode } from 'react'

interface IProps {
    modalProps: Omit<ModalProps, 'children' | 'title'>
    children: ReactNode
    title: ReactNode
    buttons?: ReactNode
}

export const CompoundModalShared = (props: IProps) => {
    const { modalProps, children, title, buttons } = props

    const rootProps = useProps('Modal', {}, modalProps)

    return (
        <Modal.Root {...rootProps}>
            <Modal.Overlay />
            <Modal.Content>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                        {buttons}
                        <Modal.CloseButton iconSize={18} size="lg" />
                    </Group>
                </Modal.Header>
                <Modal.Body>{children}</Modal.Body>
            </Modal.Content>
        </Modal.Root>
    )
}
