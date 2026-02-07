import React from "react";
import { Button } from "@ui-kitten/components";
import type { ButtonProps } from "@ui-kitten/components";

import { space, radius, tap } from "@/lib/ui/tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

type Props = Omit<ButtonProps, "children"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
  loadingLabel?: string;
};

export function AppButton({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Loading…",
  disabled,
  style,
  children,
  ...rest
}: Props) {
  const appearance: ButtonProps["appearance"] =
    variant === "ghost" ? "ghost" : "filled";

  const status: ButtonProps["status"] =
    variant === "danger"
      ? "danger"
      : variant === "secondary"
        ? "basic"
        : "primary";

  const minHeight = size === "sm" ? tap.min : tap.primary;

  return (
    <Button
      {...rest}
      appearance={appearance}
      status={status}
      disabled={disabled || loading}
      style={[
        {
          minHeight,
          paddingHorizontal: space.lg,
          borderRadius: radius.md,
        },
        style,
      ]}
    >
      {loading ? loadingLabel : children}
    </Button>
  );
}
