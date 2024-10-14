import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { COLLECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Collection } from "@/types/site";

export default function CollectionSelector() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(COLLECTIONS[0].value);

  const selected = COLLECTIONS.find((collection) => collection.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 sm:flex-none px-3 flex sm:w-52 justify-between bg-content-foreground border-border"
        >
          {selected ? (
            <CollectionItem coll={selected} />
          ) : (
            "Select Collection..."
          )}
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-border" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0">
        <Command className="bg-content-foreground">
          <CommandInput placeholder="Search collection..." />
          <CommandList>
            <CommandEmpty>No collection found.</CommandEmpty>
            <CommandGroup>
              {COLLECTIONS.map((collection) => (
                <CommandItem
                  key={collection.value}
                  value={collection.value}
                  onSelect={(currentValue: string) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === collection.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <CollectionItem coll={collection} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CollectionItem({ coll }: { coll: Collection }) {
  return (
    <div className="flex flex-1 items-center gap-1 overflow-hidden">
      <Avatar className="w-6 h-6 shadow-md shrink-0">
        <AvatarImage src={coll.logo} alt={`${coll.label} logo`} />
        <AvatarFallback>{coll.label.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="flex-1 truncate text-start">{coll.label}</span>
    </div>
  );
}
