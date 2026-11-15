import { NumberInput, Stack, TextInput } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateUserCommand, UpdateUserCommand } from '@umiji/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { PiEnvelopeDuotone, PiTelegramLogoDuotone } from 'react-icons/pi'
import { TbMail } from 'react-icons/tb'

import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'

interface IProps<T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody> {
    cardVariants: Variants
    form: UseFormReturnType<T>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export function ContactInformationCard<
    T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody
>(props: IProps<T>) {
    const { t } = useTranslation()

    const { cardVariants, motionWrapper, form } = props

    const MotionWrapper = motionWrapper

    return (
        <MotionWrapper variants={cardVariants}>
            <SectionCard.Root>
                <SectionCard.Section>
                    <BaseOverlayHeader
                        IconComponent={TbMail}
                        iconSize={20}
                        title={t('contact-information-card.contact-information')}
                        titleOrder={5}
                    />
                </SectionCard.Section>

                <SectionCard.Section>
                    <Stack gap="md">
                        <NumberInput
                            allowDecimal={false}
                            allowNegative={false}
                            hideControls
                            key={form.key('telegramId')}
                            label={t('contact-information-card.telegram-id')}
                            leftSection={<PiTelegramLogoDuotone size="16px" />}
                            placeholder={t(
                                'contact-information-card.enter-user-s-telegram-id-optional'
                            )}
                            {...form.getInputProps('telegramId')}
                            styles={{
                                label: { fontWeight: 500 }
                            }}
                        />

                        <TextInput
                            key={form.key('email')}
                            label={t('contact-information-card.email')}
                            leftSection={<PiEnvelopeDuotone size="16px" />}
                            placeholder={t('contact-information-card.enter-user-s-email-optional')}
                            {...form.getInputProps('email')}
                            styles={{
                                label: { fontWeight: 500 }
                            }}
                        />
                    </Stack>
                </SectionCard.Section>
            </SectionCard.Root>
        </MotionWrapper>
    )
}
