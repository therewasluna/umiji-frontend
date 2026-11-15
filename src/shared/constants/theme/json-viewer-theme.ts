import { githubDarkTheme, ThemeInput } from 'json-edit-react'

// Read-only JSON viewers (quick view, raw inbound, host mux...): Github Dark's layout on Umiji's dark-rose palette.
export const JSON_VIEWER_THEME: ThemeInput = [
    githubDarkTheme,
    {
        container: {
            backgroundColor: 'var(--mantine-color-dark-8)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 12,
            color: 'var(--mantine-color-dark-0)',
            padding: '10px 12px'
        },
        property: 'var(--mantine-color-dark-0)',
        bracket: 'var(--mantine-color-dark-2)',
        itemCount: 'var(--mantine-color-dark-3)',
        string: 'var(--mantine-color-rose-3)',
        number: '#F0B37E',
        boolean: { color: '#7FD1B9', fontSize: '90%', fontWeight: 'bold' },
        null: 'var(--mantine-color-dark-2)',
        iconCollection: 'var(--mantine-color-dark-2)',
        iconCopy: 'var(--mantine-color-dark-2)'
    }
]
