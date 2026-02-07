import React from "react";
import { Text } from "@ui-kitten/components";
import type { TextProps } from "@ui-kitten/components";

import { text } from "@/lib/ui/type";

type Variant = keyof typeof text;

type Props = TextProps & {
  variant?: Variant;
};

export function AppText({ variant = "body", style, children, ...rest }: Props) {
  return (
    <Text {...rest} style={[text[variant], style]}>
      {children}
    </Text>
  );
}
