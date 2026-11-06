import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Mr } from '../types'

const mrs = atom({ plugin: 'mr-inspector', key: 'mrs' } as const, [] as Mr[])

const labelOf = (url: string, number: number): string => {
  const segments = new URL(url).pathname.split('/').filter(Boolean)
  const end = segments.findIndex(s => s === '-' || s === 'pull')
  const repo = segments[end === -1 ? segments.length - 1 : end - 1] ?? 'MR'
  const sigil = url.includes('/merge_requests/') ? '!' : '#'
  return `${repo} ${sigil}${number}`
}

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const answer = await next(e)
    const pr = answer.deny === undefined && answer.isError === undefined ? answer.result.gitOperation?.pr : undefined
    if (pr?.action === 'created' && pr.url) {
      const url = pr.url
      const mr: Mr = { url, label: labelOf(url, pr.number) }
      await update($, mrs, list => (list.some(m => m.url === url) ? list : [...list, mr]))
    }
    return answer
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const list = await read($, mrs)
    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text bold>MRs </Text>
        {list.length === 0 ? <Text dimColor>none created in this session</Text> : null}
        {list.map((mr, i) => (
          <Button
            key={mr.url}
            label={mr.label}
            plain
            hotkey={i < 9 ? String(i + 1) : undefined}
            onPress={() => $.process.run(['open', mr.url])}
          />
        ))}
      </Box>
    )
  })
}
