import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

export const Footer = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full p-4 sm:p-6 bg-background z-50">
      <div className="mb-4 sm:mb-0">
        <Logo />
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-y-2 sm:gap-x-2 text-muted-foreground">
        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
          Privacy Policy
        </Button>
        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
          Terms & Conditions
        </Button>
      </div>
    </div>
  );
};
