"use client";

import { cn } from "@/lib/utils";
import {
  ChevronsLeft,
  Dot,
  Search,
  Settings,
  Tags,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { UserItem } from "./user-item";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { Navbar } from "./navbar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LeafyGreen, Sprout, FlaskRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Item } from "./Item";
import { Logo } from "@/app/(marketing)/_components/logo";
import DilutionCalculator from "@/components/dilution-calculator";

export const Navigation = () => {
  const settings = useSettings();
  const search = useSearch();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const isResizingRef = useRef(false);
  const sideBarRef = useRef<ElementRef<"aside">>(null);
  const navBarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleLinkClick = (path: string) => {
    if (isMobile) {
      collapse();
      if (pathname !== path) {
        router.push(path);
      }
    }
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;

    let newWidth = event.clientX;

    if (newWidth < 240) {
      newWidth = 240;
    }

    if (newWidth > 480) {
      newWidth = 480;
    }

    if (sideBarRef.current && navBarRef.current) {
      sideBarRef.current.style.width = `${newWidth}px`;
      navBarRef.current.style.setProperty("left", `${newWidth}px`);
      navBarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sideBarRef.current && navBarRef.current) {
      setIsResetting(true);
      setIsCollapsed(false);

      sideBarRef.current.style.width = isMobile ? "100%" : "240px";
      navBarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );

      navBarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sideBarRef.current && navBarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sideBarRef.current.style.width = "0";
      navBarRef.current.style.setProperty("width", "100%");
      navBarRef.current.style.setProperty("left", "0");

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  return (
    <>
      <aside
        ref={sideBarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999] border-b",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div className="flex h-[60px] items-center border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <Logo />
          </Link>
          <Button
            onClick={collapse}
            role="button"
            size="icon"
            variant="outline"
            className={cn(
              "ml-auto h-8 w-8 text-muted-foreground transition-transform transform hover:scale-110 hover:rounded-md hover:bg-gray-100/40 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
              isMobile && "opacity-100"
            )}
          >
            <ChevronsLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="mt-4">
          <Item label="Search" icon={Search} isSearch onClick={search.onOpen} />
          <Item label="Settings" icon={Settings} onClick={settings.onOpen} />
          <Separator className="mt-4" />
        </div>

        <div>
          <div className="grid items-start px-3 my-4 text-sm font-medium gap-2">
            <Link
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-50",
                {
                  "bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-50":
                    pathname.startsWith("/materials"),
                }
              )}
              href="/materials"
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  handleLinkClick("/materials");
                }
              }}
            >
              <LeafyGreen className="size-4 mr-2" />
              Materials
            </Link>

            <Link
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-50",
                {
                  "bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-50":
                    pathname.startsWith("/accords"),
                }
              )}
              href="/accords"
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  handleLinkClick("/accords");
                }
              }}
            >
              <Sprout className="size-4 mr-2" />
              Accords <Dot /> Bases
            </Link>

            <Link
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-50",
                {
                  "bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-50":
                    pathname.startsWith("/formulas"),
                }
              )}
              href="/formulas"
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  handleLinkClick("/formulas");
                }
              }}
            >
              <FlaskRound className="size-4 mr-2" />
              Formulas
            </Link>
            <Link
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-50",
                {
                  "bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-50":
                    pathname.startsWith("/profiles"),
                }
              )}
              href="/profiles"
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  handleLinkClick("/profiles");
                }
              }}
            >
              <Tags className="size-4 mr-2"/>
              Profiles
            </Link>
          </div>
          <Separator className="m-4" />
          <div className="px-3 flex justify-end">
            <DilutionCalculator />
          </div>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-0.5 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navBarRef}
        className={cn(
          "absolute h-[60px] top-0 z-[99999] left-60 w-[calc(100%-240px)] border-b bg-background flex justify-end items-center",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
          isCollapsed && "justify-between"
        )}
      >
        <Navbar
          isCollapsed={isCollapsed}
          onResetWidth={resetWidth}
          isMobile={isMobile}
        />
      </div>
    </>
  );
};
