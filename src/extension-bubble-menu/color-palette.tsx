import { useEditorContext } from '@/react/hooks/use-editor-context'
import { chunk } from 'lodash-es'

interface ColorPaletteProps {
  mode: 'default' | 'light'
}

const defaultColors = [
  '#9CA3AF',
  '#DC2626',
  '#FBBF24',
  '#059669',
  '#2563EB',
  '#4F46E5',
  '#7C3AED',
  '#DB2777',
]

const lightColors = [
  '#D1D5DB',
  '#F87171',
  '#FCD34D',
  '#6EE7B7',
  '#93C5FD',
  '#A5B4FC',
  '#C4B5FD',
  '#F9A8D4',
]

export default function ColorPalette(props: ColorPaletteProps) {
  const { editor } = useEditorContext()
  const colorChunks =
    props.mode === 'default' ? chunk(defaultColors, 4) : chunk(lightColors, 4)

  const handleColorSelect = (color: string) => {
    if (props.mode === 'default') {
      editor.commandChain.setFontColor(color).focus().run()
    } else {
      editor.commandChain.setBackgroundColor(color).focus().run()
    }
  }

  return (
    <div className="bg-white rounded shadow p-2">
      {colorChunks.map((colors, idx) => {
        return (
          <div
            key={idx}
            className="flex mb-2"
            style={{
              marginBottom: idx === colorChunks.length - 1 ? 0 : undefined,
            }}
          >
            {colors.map((color, idx) => {
              return (
                <div
                  key={color}
                  className="w-6 h-6 rounded mr-2"
                  style={{
                    backgroundColor: color,
                    marginRight: idx === colors.length - 1 ? 0 : undefined,
                  }}
                  onClick={() => handleColorSelect(color)}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
