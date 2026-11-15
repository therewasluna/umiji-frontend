// oxlint-disable
import { Drawer, DrawerOverlay } from '@mantine/core'

import { scrollLockShards } from '@shared/utils/scroll-lock-shards'

import classes from './drawer.module.css'

export default {
    Drawer: Drawer.extend({
        classNames: {
            root: classes.drawerRoot,
            content: classes.drawerContent,
            header: classes.drawerHeader,
            title: classes.drawerTitle,
            close: classes.drawerClose,
            body: classes.drawerBody
        },
        defaultProps: {
            removeScrollProps: { shards: scrollLockShards },
            closeButtonProps: { size: 'lg', iconSize: 18 },
            padding: 'lg',
            // Floats off the screen edges with round corners; the phone layout resets both in CSS.
            offset: 12,
            radius: 18
        }
    }),
    DrawerOverlay: DrawerOverlay.extend({
        defaultProps: {
            color: '#0A0609',
            backgroundOpacity: 0.72,
            blur: 2
        }
    })
}
