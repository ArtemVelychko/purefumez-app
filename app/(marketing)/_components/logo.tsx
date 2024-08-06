import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({ subsets: ["latin"], weight: ["400", "500"] });

export const Logo = () => {
  return (
    <div className="flex items-center gap-x-2">
      <Image 
        src="/favicon.svg" 
        alt="logo" 
        width="30" 
        height="30" 
        className="w-6 h-6 sm:w-8 sm:h-8 dark:hidden"
      />
      <Image 
        src="/favicon-dark.svg" 
        alt="logo" 
        width="30" 
        height="30" 
        className="w-6 h-6 sm:w-8 sm:h-8 hidden dark:block"
      />
      <p className={cn("font-semibold text-sm sm:text-lg", font.className)}>
        PureFumez
      </p>
    </div>
  );
};
