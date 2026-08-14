/**
 * Cordis context augmentation for services this plugin consumes that live in
 * packages outside this project's typecheck graph (the profile composes them).
 * The webServer surface is provided by @deepseek-ai/dsh-host-webserver.
 * `ctx.llm` is typed by @deepseek-ai/dsh-llm's own augmentation; `ctx.sessions`
 * resolves to the client-runtime ISessions in this type graph, so the review
 * route reads the host session store through a local structural cast.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Provided by @deepseek-ai/dsh-host-webserver when composed. */
    webServer?: {
      register(route: {
        kind: 'exact' | 'prefix'
        /** Absolute pathname, no trailing slash. */
        path: string
        handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
      }): () => void
    }
  }
}

export {}
