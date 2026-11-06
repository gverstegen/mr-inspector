import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'mr-inspector',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

test('the band says no MR was created while none is', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  const row = await ui.find({ type: 'Text', text: /none created/ })
  expect(row?.text).toBe('none created in this session')
  await ui.unmount()
})

const YMIR = 'https://gitlab.com/acme/platform/widgets/-/merge_requests/34'

const created = (number: number, url: string) => ({
  result: {
    stdout: url,
    stderr: '',
    interrupted: false,
    gitOperation: { pr: { number, url, action: 'created' as const } },
  },
})

test('a created MR gets a digit hotkey that opens it in the browser', async ($, on) => {
  const opened: string[][] = []
  on('tool.call', () => created(34, YMIR))
  on('process.run', (_, e) => {
    opened.push([...e.argv])
    return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })

  await $.tool.call({ tool: 'Bash', command: 'glab mr create --fill' })
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  const button = await ui.find({ type: 'Button', text: /widgets/ })
  expect(button?.props.hotkey).toBe('1')
  expect(button?.props.label).toBe('widgets !34')
  expect(await ui.find({ type: 'Text', text: /none created/ })).toBeUndefined()

  await ui.press({ key: YMIR })
  expect(opened).toEqual([['open', YMIR]])
  await ui.unmount()
})

test('the same MR URL is listed once', async ($, on) => {
  let stored: unknown
  on('tool.call', () => created(34, YMIR))
  on('state.set', (_, e, next) => {
    stored = e.value
    return next(e)
  })
  await $.tool.call({ tool: 'Bash', command: 'glab mr create --fill' })
  await $.tool.call({ tool: 'Bash', command: 'glab mr create --fill' })

  expect(stored).toEqual([{ url: YMIR, label: 'widgets !34' }])
})

test('a GitHub PR is labelled with its repo and # number, as the second hotkey', async ($, on) => {
  const GH = 'https://github.com/acme/gadgets/pull/12'
  let calls = 0
  on('tool.call', () => (calls++ === 0 ? created(34, YMIR) : created(12, GH)))
  await $.tool.call({ tool: 'Bash', command: 'glab mr create --fill' })
  await $.tool.call({ tool: 'Bash', command: 'gh pr create --fill' })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const button = await ui.find({ type: 'Button', key: GH })
  expect(button?.props.label).toBe('gadgets #12')
  expect(button?.props.hotkey).toBe('2')
  await ui.unmount()
})
