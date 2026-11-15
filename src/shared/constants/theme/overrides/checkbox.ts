import { Checkbox, CheckboxIndicator, Radio, RadioCard, RadioIndicator } from '@mantine/core'

import classes from './checkbox.module.css'

export default {
    Checkbox: Checkbox.extend({
        classNames: { input: classes.input }
    }),
    CheckboxIndicator: CheckboxIndicator.extend({
        classNames: { indicator: classes.indicator }
    }),
    Radio: Radio.extend({
        classNames: { radio: classes.radio }
    }),
    RadioIndicator: RadioIndicator.extend({
        classNames: { indicator: classes.radioIndicator }
    }),
    RadioCard: RadioCard.extend({
        classNames: { card: classes.radioCard }
    })
}
