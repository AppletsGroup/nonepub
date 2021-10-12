import React from "react";
import { animated, useTransition } from "react-spring";

export type Props = React.PropsWithChildren<{
  visible: boolean;
  left: string | number;
  top: string | number;
}>;

export default function Popup(props: Props) {
  const transitions = useTransition(props.visible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return transitions(({ opacity }, item) => {
    return (
      item && (
        <animated.div
          style={{
            position: "fixed",
            left: props.left,
            top: props.top,
            opacity: opacity,
          }}
        >
          {props.children}
        </animated.div>
      )
    );
  });
}
