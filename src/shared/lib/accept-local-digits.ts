const LOCAL_DIGIT = /[٠-٩۰-۹]/

const toLatinDigits = (text: string) =>
    text.replace(/[٠-٩۰-۹]/g, (digit) => {
        const code = digit.charCodeAt(0)
        return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660))
    })

/**
 * Persian and Arabic keyboards type their own digits, which number fields silently drop, leaving them
 * empty. This turns those keystrokes and pastes into 0-9 before the field sees them.
 * shortcut: Android keyboards that compose text send non-cancelable events and skip this; if one is
 * reported, convert in the field's onChange instead.
 */
export const acceptLocalDigits = () => {
    document.addEventListener(
        'beforeinput',
        (event) => {
            const { target } = event
            const isNumberField =
                target instanceof HTMLInputElement &&
                (target.inputMode === 'decimal' || target.inputMode === 'numeric')

            if (isNumberField && event.cancelable && event.data && LOCAL_DIGIT.test(event.data)) {
                event.preventDefault()
                // The one way to insert text that keeps the caret, undo history and React's onChange working.
                document.execCommand('insertText', false, toLatinDigits(event.data))
            }
        },
        true
    )
}
