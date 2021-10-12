import styled from "styled-components";

const Wrapper = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(32, 36, 38, 0.45);
  cursor: default;
`;

const KEYBOARD_SYMBOL: { [k: string]: string } = {
  command: "⌘",
  option: "⌥",
  shift: "⇧",
  capsLock: "⇪",
  control: "⌃",
  return: "↩",
  enter: "⌅",
};

type Props = {
  keyName: string;
};

export default function KeyboardButton(props: Props) {
  const text = KEYBOARD_SYMBOL[props.keyName] ?? props.keyName;
  return <Wrapper>{text}</Wrapper>;
}
