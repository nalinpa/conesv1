import React from "react";
import { Card, CardProps } from "@ui-kitten/components";

export function CardShell({
  style,
  ...props
}: CardProps) {
  return (
    <Card
      {...props}
      style={[
        {
          padding: 16,
          borderRadius: 18,
        },
        style,
      ]}
    />
  );
}
