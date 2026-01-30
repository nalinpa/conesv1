import React from "react";
import { Input as KInput } from "@ui-kitten/components";

type Props = React.ComponentProps<typeof KInput> & {
  className?: string; // ignored (compat)
};

export function Input({ style, textStyle, ...props }: Props) {
  return (
    <KInput
      size="large" // thicker
      style={[{ borderRadius: 14 }, style as any]}
      textStyle={[{ fontSize: 16 }, textStyle as any]}
      {...props}
    />
  );
}
