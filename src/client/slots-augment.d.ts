/**
 * Client slot/locale type augmentations for this plugin's review UI.
 */
import type { zh } from './index.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The diff-review header action and overlay's dictionary namespace. */
    'diff-review': keyof typeof zh
  }
}

export {}
