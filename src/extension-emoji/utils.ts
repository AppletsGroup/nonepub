import data from 'unicode-emoji-json'

export interface Emoji {
  name: string
  slug: string
  group: string
  emoji: string
}

const emojiList: Emoji[] = Object.entries(data).map(([emoji, desc]) => {
  return {
    ...desc,
    emoji,
  }
})

export function searchEmoji(keyword: string) {
  if (!keyword) return emojiList.slice(0, 50)

  // TODO: search full, and optimize render
  return emojiList.filter((item) => item.slug.startsWith(keyword)).slice(0, 50)
}
