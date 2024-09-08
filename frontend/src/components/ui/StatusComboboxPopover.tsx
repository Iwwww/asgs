"use client";

import * as React from "react";
import {
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  HelpCircle,
  LucideIcon,
  Plus,
  PlusIcon,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
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

type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const STATUS_CHOICES: { [key: string]: string } = {
  in_processing: "В обработке",
  delivery: "Доставляется",
  delivered: "Доставлен",
};

const statuses: Status[] = [
  {
    value: "in_processing",
    label: STATUS_CHOICES.in_processing,
    icon: Circle,
  },
  {
    value: "delivery",
    label: STATUS_CHOICES.delivery,
    icon: ArrowUpCircle,
  },
  {
    value: "delivered",
    label: STATUS_CHOICES.delivered,
    icon: CheckCircle2,
  },
];

interface ComboboxPopoverProps {
  selectedOrders: number[];
  onStatusChange: (status: string) => void;
}

export function StatusComboboxPopover({
  selectedOrders,
  onStatusChange,
}: ComboboxPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null,
  );

  return (
    <div className="flex items-center space-x-4">
      <p className="text-sm text-muted-foreground">
        Изменить статус для выбранных заказов ({selectedOrders.length})
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-[200px] justify-start"
            disabled={selectedOrders.length === 0}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Установить статус
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Изменить статус..." />
            <CommandList>
              <CommandEmpty>Результатов не найдено.</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      setSelectedStatus(
                        statuses.find((priority) => priority.value === value) ||
                          null,
                      );
                      onStatusChange(value);
                      setOpen(false);
                    }}
                  >
                    <status.icon className={"mr-2 h-4 w-4"} />
                    <span>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
