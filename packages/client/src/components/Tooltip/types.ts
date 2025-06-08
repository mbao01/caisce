import type { ComponentProps, ReactNode } from "react";
import { Tooltip } from "@mbao01/common";

export type TooltipProps = React.ComponentProps<typeof Tooltip.Content> & {
  trigger: ReactNode;
  triggerProps?: ComponentProps<typeof Tooltip.Trigger>;
};
