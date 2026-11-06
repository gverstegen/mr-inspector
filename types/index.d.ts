export type Mr = { url: string; label: string }

declare module 'claude-code' {
  interface PluginState {
    'mr-inspector': { mrs: Mr[] }
  }
}
