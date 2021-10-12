import { Meta } from '@storybook/react'
import BubbleMenu from './index'

export default {
  component: BubbleMenu,
  title: 'Components/BubbleMenu',
} as Meta

export const Default = () => <BubbleMenu items={[]} />
