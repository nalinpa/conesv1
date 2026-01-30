import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { Text as KText } from "@ui-kitten/components";

type Variant = "default" | "h1" | "h2" | "h3" | "h4" | "muted" | "small";

type Props = RNTextProps & {
  variant?: Variant;
};

const mapVariantToCategory: Record<Variant, string> = {
  default: "p1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  muted: "c1",
  small: "c2",
};

export function Text({ variant = "default", style, ...props }: Props) {
  const category = mapVariantToCategory[variant] as any;

  return <KText category={category} style={style as any} {...(props as any)} />;
}
