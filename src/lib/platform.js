// Keyboard shortcut label for "Jump to": ⌘K on Apple devices, Ctrl K elsewhere.
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

export const JUMP_SHORTCUT = IS_MAC ? '⌘K' : 'Ctrl K'
