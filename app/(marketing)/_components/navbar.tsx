"use client";

import { useConvexAuth } from "convex/react";
import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const scrolled = useScrollTop();

  return (
    <div
      className={cn(
        "z-50 bg-background fixed top-0 w-full p-4 sm:p-6",
        scrolled && "border-b shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-x-1 sm:gap-x-2">
          {isLoading && <Spinner />}
          {!isAuthenticated && !isLoading && (
            <>
              <SignInButton mode="modal" forceRedirectUrl="/materials">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/materials">
                <Button size="sm" className="text-xs sm:text-sm">
                  Sign up
                </Button>
              </SignUpButton>
            </>
          )}
          {isAuthenticated && !isLoading && (
            <UserButton afterSignOutUrl="/" />
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};
