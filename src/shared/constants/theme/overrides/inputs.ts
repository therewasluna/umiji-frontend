import { InputBase, InputWrapper, PasswordInput, Select, TextInput } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'

import classes from './inputs.module.css'

export default {
    // Reaches every labelled field in the app: all input types and standalone Input.Label.
    InputWrapper: InputWrapper.extend({
        classNames: {
            description: classes.description,
            label: classes.label
        }
    }),
    InputBase: InputBase.extend({
        defaultProps: {
            radius: 'md'
        }
    }),
    PasswordInput: PasswordInput.extend({
        defaultProps: {
            radius: 'md'
        }
    }),
    TextInput: TextInput.extend({
        defaultProps: {
            radius: 'md'
        }
    }),
    Select: Select.extend({
        defaultProps: {
            radius: 'md'
        }
    }),
    DateTimePicker: DateTimePicker.extend({
        defaultProps: {
            radius: 'md'
        }
    })
}
