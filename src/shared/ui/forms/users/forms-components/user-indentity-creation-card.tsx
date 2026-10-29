import { TextInput } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateUserCommand } from '@umiji/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { HiIdentification } from 'react-icons/hi'
import { PiUserDuotone } from 'react-icons/pi'

import { useGetBrokerMe } from '@shared/api/hooks'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'

import { useIsBroker } from '@entities/auth/session-store'

interface IProps {
    cardVariants: Variants
    form: UseFormReturnType<CreateUserCommand.RequestBody>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export const UserIdentityCreationCard = (props: IProps) => {
    const { t } = useTranslation()
    const isBroker = useIsBroker()
    const { data: brokerMe } = useGetBrokerMe({ rQueryParams: { enabled: isBroker } })

    const { cardVariants, motionWrapper, form } = props

    const MotionWrapper = motionWrapper

    return (
        <MotionWrapper variants={cardVariants}>
            <SectionCard.Root>
                <SectionCard.Section>
                    <BaseOverlayHeader
                        iconColor="blue"
                        IconComponent={HiIdentification}
                        iconSize={20}
                        iconVariant="soft"
                        title={t('user-identity-creation-card.user-identity')}
                        titleOrder={5}
                    />
                </SectionCard.Section>
                <SectionCard.Section>
                    <TextInput
                        description={
                            isBroker && brokerMe
                                ? t('user-identity-creation-card.broker-username-prefix', {
                                      prefix: `${brokerMe.username}_`
                                  })
                                : t('create-user-modal.widget.username-cannot-be-changed-later')
                        }
                        key={form.key('username')}
                        label={t('common.field.username')}
                        required
                        {...form.getInputProps('username')}
                        leftSection={<PiUserDuotone size="16px" />}
                    />
                </SectionCard.Section>
            </SectionCard.Root>
        </MotionWrapper>
    )
}
