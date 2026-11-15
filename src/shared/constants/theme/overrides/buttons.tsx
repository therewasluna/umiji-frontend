// oxlint-disable
import { ActionIcon, Button, CloseButton, Switch } from '@mantine/core'

// Teal and green buttons are the app's positive actions (create, save, confirm). A labelled Button
// becomes the screen's filled rose control; an icon-only ActionIcon in a toolbar goes quiet, so a row
// of tools never carries a lone loud square. Teal stays for success states (badges, text, icons).
const PRIMARY_ACTION_COLORS = ['teal', 'green']
const isPrimaryAction = (color: unknown, variant: unknown) =>
    PRIMARY_ACTION_COLORS.includes(color as string) &&
    (variant === undefined || ['filled', 'light', 'soft'].includes(variant as string))

const ROSE_FILLED = {
    bg: 'var(--mantine-color-rose-filled)',
    hover: 'var(--mantine-color-rose-filled-hover)'
}

export default {
    ActionIcon: ActionIcon.extend({
        defaultProps: {
            radius: 'md',
            variant: 'outline'
        },
        vars: (_theme, props) =>
            isPrimaryAction(props.color, props.variant)
                ? {
                      root: {
                          '--ai-bg': 'var(--mantine-color-dark-6)',
                          '--ai-hover': 'var(--mantine-color-dark-5)',
                          '--ai-color': 'var(--mantine-color-dark-1)',
                          '--ai-bd': '1px solid rgba(255, 255, 255, 0.07)'
                      }
                  }
                : { root: {} }
    }),
    Button: Button.extend({
        defaultProps: {
            radius: 'md',
            variant: 'light'
        },
        vars: (_theme, props) =>
            isPrimaryAction(props.color, props.variant)
                ? {
                      root: {
                          '--button-bg': ROSE_FILLED.bg,
                          '--button-hover': ROSE_FILLED.hover,
                          '--button-color': 'var(--mantine-color-white)',
                          '--button-bd': '1px solid transparent'
                      }
                  }
                : { root: {} },
        styles: {
            root: {
                transition: 'all 0.2s ease'
            }
        }
    }),
    CloseButton: CloseButton.extend({
        defaultProps: {
            size: 'lg'
        }
    }),
    Switch: Switch.extend({
        defaultProps: {
            radius: 'md'
        }
    })
}
