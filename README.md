# mr-inspector

A Claude Code mod: a band above the prompt that lists the merge requests and
pull requests Claude created in the current session, each behind one key.

```
MRs  1: widgets !34   2: gadgets #12
```

- Each entry carries a digit hotkey (`1` to `9`). Press the digit in an empty
  prompt, or after `ctrl+x tab` focuses the band, and the MR opens in your
  browser via `open` (macOS).
- Detection reads the git operation Claude Code attaches to a Bash result, so
  `glab mr create` and `gh pr create` both count. The same URL is listed once.
- With no MR yet, the band reads `MRs  none created in this session`.
- The list lives in session state: a reload of the mod keeps it, a new session
  starts empty.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install mr-inspector --marketplace gverstegen/mr-inspector
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in
every session).

From a shell:

```
claude plugin install mr-inspector --marketplace gverstegen/mr-inspector
```

In the desktop app: click `+` next to the prompt box, then Plugins, Add
marketplace with `gverstegen/mr-inspector`, then Add plugin.

## Develop

```
claude plugin test .       # runs tests/band.test.tsx against the engine
claude plugin validate .   # checks the manifest and the hooks module
claude --plugin-dir .      # starts a session with the mod loaded from disk
```

## License

MIT
