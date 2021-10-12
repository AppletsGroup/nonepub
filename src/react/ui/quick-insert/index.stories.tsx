import { Meta } from "@storybook/react";
import QuickInsertCard from "./index";

export default {
  component: QuickInsertCard,
  title: "Components/QuickInsertCard",
} as Meta;

export const Default = () => (
  <QuickInsertCard
    items={[
      {
        icon: "h-1",
        name: "标题1",
        markdown: "# 标题1",
        shortcut: ["command", "shift", "1"],
      },
      {
        icon: "h-2",
        name: "标题2",
        markdown: "## 标题2",
        shortcut: ["command", "shift", "2"],
      },
      {
        icon: "h-3",
        name: "标题3",
        markdown: "### 标题3",
        shortcut: ["command", "shift", "3"],
      },
      {
        icon: "double-quotes-l",
        name: "引用",
        markdown: "> 引用",
        shortcut: ["command", "shift", "."],
      },
    ]}
  />
);
