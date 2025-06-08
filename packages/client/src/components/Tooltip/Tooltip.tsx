"use client";

import { Tooltip as CommonTooltip } from "@mbao01/common";
import { type TooltipProps } from "./types";

export const Tooltip = ({ trigger, children, triggerProps, ...props }: TooltipProps) => {
  return (
    <CommonTooltip.Provider>
      <CommonTooltip defaultOpen={false}>
        <CommonTooltip.Trigger {...triggerProps}>{trigger}</CommonTooltip.Trigger>
        <CommonTooltip.Portal>
          <CommonTooltip.Content {...props}>{children}</CommonTooltip.Content>
        </CommonTooltip.Portal>
      </CommonTooltip>
    </CommonTooltip.Provider>
  );
};
