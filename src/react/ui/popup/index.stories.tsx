import { Meta, Story } from "@storybook/react";
import Popup, { Props } from "./index";

export default {
  component: Popup,
  title: "Components/Popup",
} as Meta;

const Template: Story<Props> = (args) => {
  return (
    <Popup {...args}>
      <div style={{ width: 100, height: 100, background: "red" }} />
    </Popup>
  );
};

export const Default = Template.bind({});
Default.args = { visible: false };
