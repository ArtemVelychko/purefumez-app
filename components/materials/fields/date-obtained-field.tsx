import React, { useState, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useMediaQuery } from "usehooks-ts";

interface DateObtainedFieldProps {
  value: string | undefined;
  onChange: (date: Date | undefined) => void;
}

export const DateObtainedField: React.FC<DateObtainedFieldProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      onChange(date);
      setOpen(false);
    },
    [onChange]
  );

  const calendarContent = useMemo(
    () => (
      <Calendar
        mode="single"
        selected={value ? new Date(value) : undefined}
        onSelect={handleSelect}
        initialFocus
      />
    ),
    [value, handleSelect]
  );

  const triggerButton = useMemo(
    () => (
      <Button
        variant="outline"
        className={cn(
          "w-full pl-3 text-left font-normal",
          !value && "text-muted-foreground"
        )}
        onClick={handleToggle}
      >
        {value ? format(new Date(value), "PPP") : "Pick a date"}
        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
      </Button>
    ),
    [value, handleToggle]
  );

  return (
    <div>
      <Label className="mb-1 block text-sm font-medium">Date Obtained</Label>
      {isMobile ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{triggerButton}</DialogTrigger>
          <DialogContent className="p-0 flex items-center justify-center">
            <div className="p-4">{calendarContent}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {calendarContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
