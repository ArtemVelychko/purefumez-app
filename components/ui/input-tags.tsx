"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type InputProps } from "./input";

type InputTagsProps = Omit<InputProps, "value" | "onChange"> & {
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean; // Add disabled prop
};

const InputTags = React.forwardRef<HTMLInputElement, InputTagsProps>(
  ({ className, value, onChange, disabled, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState("");

    React.useEffect(() => {
      if (pendingDataPoint.includes(",")) {
        const newDataPoints = new Set([
          ...value,
          ...pendingDataPoint.split(",").map((chunk) => chunk.trim()),
        ]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint("");
      }
    }, [pendingDataPoint, onChange, value]);

    const addPendingDataPoint = () => {
      if (pendingDataPoint) {
        const newDataPoints = new Set([...value, pendingDataPoint]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint("");
      }
    };

    const handleTagDelete = (item: string) => {
      if (!disabled) {
        onChange(value.filter((i) => i !== item));
      }
    };

    return (
      <div
        className={cn(
          "has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neutral-950 has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-neutral-300 min-h-10 flex w-full flex-wrap gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950",
          disabled && "opacity-50 cursor-not-allowed", // Disable styles
          className
        )}
      >
        {value &&
          value.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-3 w-3"
                onClick={() => handleTagDelete(item)}
                disabled={disabled} // Disable button if disabled
              >
                <XIcon className="w-3" />
              </Button>
            </Badge>
          ))}
        <input
          className="flex-1 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
          value={pendingDataPoint}
          onChange={(e) => setPendingDataPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addPendingDataPoint();
            } else if (
              e.key === "Backspace" &&
              pendingDataPoint.length === 0 &&
              value.length > 0
            ) {
              e.preventDefault();
              onChange(value.slice(0, -1));
            }
          }}
          placeholder={value.length > 0 ? "" : "Add tags, comma separated..."}
          disabled={disabled} // Disable input if disabled
          {...props}
          ref={ref}
        />
      </div>
    );
  }
);

InputTags.displayName = "InputTags";

export { InputTags };