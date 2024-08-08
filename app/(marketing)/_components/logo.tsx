import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({ subsets: ["latin"], weight: ["400", "500"] });

export const Logo = () => {
  return (
    <div className="flex items-center">
      <Image
        src="/logo.svg"
        alt="logo"
        width="50"
        height="50"
        className="w-8 h-8 sm:w-8 sm:h-8 dark:hidden"
      />
      <Image
        src="/logo-dark.svg"
        alt="logo"
        width="40"
        height="40"
        className="w-8 h-8 sm:w-8 sm:h-8 hidden dark:block"
      />
      <p className={cn("font-semibold text-sm sm:text-lg", font.className)}>
        PureFumez
      </p>
    </div>
  );
};
