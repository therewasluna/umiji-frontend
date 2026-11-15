import { Badge } from '@mantine/core'

export default {
    Badge: Badge.extend({
        defaultProps: {
            radius: 'md',
            variant: 'outline'
        },
        // Sentence-case labels; the all-caps micro badges were part of the inherited look.
        styles: {
            root: {
                textTransform: 'none',
                letterSpacing: 0
            }
        }
    })
}
