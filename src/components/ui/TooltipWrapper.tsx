"use client";

import type { ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface TooltipWrapperProps {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
  className?: string;
}

export function TooltipWrapper({ content, side = "top", children, className }: TooltipWrapperProps) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild className={className}>
          <span>{children}</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={4}
            className="z-[2000] rounded bg-talis-stone-900 px-2.5 py-1.5 font-sans text-xs text-talis-stone-50 shadow-md max-w-xs"
          >
            {content}
            <Tooltip.Arrow className="fill-talis-stone-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default TooltipWrapper;
