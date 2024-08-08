"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Check, Copy, Share } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import {
  PopoverTrigger,
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useOrigin } from "@/hooks/use-origin";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";

interface ShareFormulaProps {
  initialData: Doc<"formulas">;
}

export const ShareFormula = ({ initialData }: ShareFormulaProps) => {
  const origin = useOrigin();
  const update = useMutation(api.formulas.updateFormula);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(initialData.isPublished);

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);

  const VisuallyHidden = ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={cn("sr-only", className)} {...props}>
      {children}
    </span>
  );

  const url = `${origin}/preview/formula/${initialData._id}`;

  useEffect(() => {
    return () => clearTimeout(feedbackTimeoutRef.current);
  }, []);

  const onPublish = useCallback(() => {
    setIsSubmitting(true);

    const promise = update({
      id: initialData._id,
      isPublished: true,
    }).then(() => {
      setIsPublished(true);
    }).finally(() => setIsSubmitting(false));

    toast.promise(promise, {
      loading: "Sharing...",
      success: "Formula shared",
      error: "Failed to share formula.",
    });
  }, [update, initialData._id]);

  const onUnpublish = useCallback(() => {
    setIsSubmitting(true);

    const promise = update({
      id: initialData._id,
      isPublished: false,
    }).then(() => {
      setIsPublished(false);
    }).finally(() => setIsSubmitting(false));

    toast.promise(promise, {
      loading: "Unsharing...",
      success: "Formula unpublished",
      error: "Failed to unpublish formula.",
    });
  }, [update, initialData._id]);

  const onCopy = useCallback(() => {
    const input = inputRef.current;
    if (input) {
      input.value = url;
      input.select();
      input.setSelectionRange(0, input.value.length);

      try {
        if (!document.execCommand("copy")) {
          throw new Error(`failed to execute copy command`);
        }
        setCopied(true);
        toast.success("Link copied to clipboard");
      } catch (e) {
        console.log("Warning! Could not copy to clipboard.", e);
        toast.error("Failed to copy link");
      }

      input.value = url;
      input.select();

      feedbackTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(0, 0);
        }
      }, 2000);
    }
  }, [url]);

  const shareContent = (
    <div className="space-y-4">
      {isPublished ? (
        <>
          <div className="flex items-center gap-x-2">
            <Share className="text-sky-500 animate-pulse h-4 w-4" />
            <p className="text-xs font-medium text-sky-500">
              This formula is live on web.
            </p>
          </div>
          <div className="flex items-center">
            <input
              ref={inputRef}
              className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
              value={url}
              readOnly
            />
            <Button
              onClick={onCopy}
              className={cn(
                "h-8 rounded-l-none transition-all duration-200 ease-in-out dark:bg-slate-500",
                copied
                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-700"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {copied ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <Copy className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
          <Button
            size="sm"
            className="w-full text-xs"
            disabled={isSubmitting}
            onClick={onUnpublish}
          >
            Unshare
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Share className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-2">Share this formula</p>
          <span className="text-xs text-muted-foreground mb-4">
            Share your formula with others.
          </span>
          <Button
            disabled={isSubmitting}
            onClick={onPublish}
            className="w-full text-xs"
            size="sm"
          >
            Share
          </Button>
        </div>
      )}
    </div>
  );

  const triggerButton = (
    <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
      <Share className="h-4 w-4" />
    </Button>
  );

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle asChild>
            <VisuallyHidden>Share Formula</VisuallyHidden>
          </DialogTitle>
          {shareContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-72" align="end" alignOffset={8} forceMount>
        {shareContent}
      </PopoverContent>
    </Popover>
  );
};
