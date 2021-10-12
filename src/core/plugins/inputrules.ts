import { InputRule } from 'prosemirror-inputrules'
import { MarkType } from 'prosemirror-model'

// 扩展了官方 inputrules 没有的功能
export const markInputRule = (
  regexp: RegExp,
  markType: MarkType,
  getAttrs?: (match: string[]) => { [k: string]: any } | undefined,
) => {
  return new InputRule(regexp, (state, match, start, end) => {
    let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    let tr = state.tr
    let lastMatchIdx = match.length - 1
    if (match[lastMatchIdx]) {
      let textStart = start + match[0].indexOf(match[lastMatchIdx])
      let textEnd = textStart + match[lastMatchIdx].length
      start = start + match[0].indexOf(match[lastMatchIdx - 1])
      if (textEnd < end) tr.delete(textEnd, end)
      if (textStart > start) tr.delete(start, textStart)
      end = start + match[lastMatchIdx].length
    }
    tr.addMark(start, end, markType.create(attrs))
    tr.removeStoredMark(markType)
    return tr
  })
}
