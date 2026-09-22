import type { ComponentPropsWithoutRef } from "react";

export default function NativeLink(props: ComponentPropsWithoutRef<"a">) {
  return <a {...props} />;
}
