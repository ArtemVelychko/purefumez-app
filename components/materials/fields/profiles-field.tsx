import React, { useState, useCallback } from "react";
import { CheckIcon, PlusCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface Profile {
  _id: Id<"profiles">;
  title: string;
  color: string;
}

interface ProfilesFieldProps {
  selectedProfiles: Profile[];
  onChange: (profiles: Profile[]) => void;
  disabled?: boolean;
}

export const ProfilesField: React.FC<ProfilesFieldProps> = ({
  selectedProfiles,
  onChange,
  disabled,
}) => {
  const profiles = useQuery(api.profiles.get) || [];
  const [open, setOpen] = useState(false);

  const handleToggleProfile = useCallback(
    (profile: Profile) => {
      const isSelected = selectedProfiles.some((p) => p._id === profile._id);
      if (isSelected) {
        onChange(selectedProfiles.filter((p) => p._id !== profile._id));
      } else {
        onChange([...selectedProfiles, profile]);
      }
    },
    [selectedProfiles, onChange]
  );

  const handleRemoveProfile = useCallback(
    (event: React.MouseEvent, profileId: Id<"profiles">) => {
      event.stopPropagation();
      onChange(selectedProfiles.filter((p) => p._id !== profileId));
    },
    [selectedProfiles, onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed h-auto min-h-[2rem] py-1 px-2 flex items-center justify-start w-auto max-w-[90vw]"
          disabled={disabled}
        >
          <div className="flex items-center mr-2 flex-shrink-0">
            <PlusCircledIcon className="h-4 w-4 mr-2" />
            Profiles
          </div>
          {selectedProfiles.length > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 h-4 flex-shrink-0"
              />
              <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                {selectedProfiles.map((profile) => (
                  <Badge
                    key={profile._id}
                    className="group relative px-2 py-0.5 transition-all duration-200 ease-in-out hover:pr-6 text-xs"
                    style={{ backgroundColor: profile.color }}
                  >
                    <span className="truncate max-w-[100px]">
                      {profile.title}
                    </span>
                    <span
                      className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 cursor-pointer",
                        "opacity-0 invisible group-hover:visible transition-all duration-200 ease-in-out",
                        "group-hover:opacity-100 hover:bg-black/10"
                      )}
                      onClick={(e) => handleRemoveProfile(e, profile._id)}
                    >
                      <Cross2Icon className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search profiles..." />
          <CommandList>
            <CommandEmpty>No profiles found.</CommandEmpty>
            <CommandGroup>
              {profiles.map((profile) => {
                const isSelected = selectedProfiles.some(
                  (p) => p._id === profile._id
                );
                return (
                  <CommandItem
                    key={profile._id}
                    onSelect={() => handleToggleProfile(profile)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <Badge style={{ backgroundColor: profile.color }}>
                      {profile.title}
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
