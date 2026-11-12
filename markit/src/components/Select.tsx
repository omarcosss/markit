import { useState, type ReactNode } from "react";
import {
  Button as AriaButton,
  Label,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover as AriaPopover,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
} from "react-aria-components";
import { Check, NavArrowDown } from "iconoir-react";

/*
 * Select built on React Aria Components, styled like markit's inputs and the
 * Menu popover. Keys are strings (the option's id).
 *
 * Usage:
 *   <Select label="Sort by" value={sort} onChange={(key) => setSort(String(key))}>
 *     <SelectItem id="newest">Newest saved</SelectItem>
 *     <SelectItem id="oldest">Oldest saved</SelectItem>
 *   </Select>
 */

type SelectSize = "sm" | "md" | "lg";

const sizeClass: Record<SelectSize, string> = {
  sm: "rounded-xl px-3 py-1.5 ",
  md: "rounded-2xl px-4 py-3 ",
  lg: "rounded-2xl px-4 py-3 text-lg",
};

const triggerBase =
  "flex w-full min-w-0 cursor-pointer items-center gap-2 border border-stone-200 bg-white " +
  "text-left text-stone-900 outline-none transition-colors " +
  "hover:border-stone-300 data-[pressed]:scale-[0.99] " +
  "data-[focus-visible]:ring-2 data-[focus-visible]:ring-teal-500 " +
  "data-[disabled]:cursor-default data-[disabled]:opacity-50";

// z-index keeps the popover above modals and the drawer it may open inside.
const panelClass =
  "z-[70] min-w-(--trigger-width) rounded-2xl border border-stone-200 bg-white p-1 shadow-lg outline-none " +
  "data-[entering]:animate-[menu-in_180ms_ease-out_both] " +
  "data-[exiting]:animate-[menu-out_140ms_ease-in_both]";

export interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children" | "className"> {
  label?: string;
  children: ReactNode;
  className?: string;
  size?: SelectSize;
}

export function Select<T extends object>({
  label,
  children,
  className = "",
  size = "md",
  isOpen: isOpenProp,
  onOpenChange,
  ...props
}: SelectProps<T>) {
  const [isOpenState, setIsOpenState] = useState(false);
  const isOpen = isOpenProp ?? isOpenState;
  const setOpen = (open: boolean) => {
    setIsOpenState(open);
    onOpenChange?.(open);
  };

  return (
    // Escape must close only this list. The drawer and modals close on Escape from
    // a document listener, and React Aria's own handling doesn't reliably stop the
    // event before it gets there. So while the list is open, this wrapper handles
    // Escape in the capture phase, before the list sees it, and stops it.
    <div
      className={`flex flex-col gap-2 ${className}`}
      onKeyDownCapture={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <AriaSelect {...props} isOpen={isOpen} onOpenChange={setOpen} className="flex flex-col gap-2">
        {label && <Label className="px-1 text-sm text-stone-500">{label}</Label>}
        <AriaButton className={`${triggerBase} ${sizeClass[size]}`}>
          <SelectValue className="min-w-0 flex-1 truncate data-[placeholder]:text-stone-400" />
          <NavArrowDown width={16} height={16} className="shrink-0 text-stone-500" aria-hidden />
        </AriaButton>
        <AriaPopover placement="bottom start" offset={6} className={panelClass}>
          <ListBox className="max-h-80 overflow-auto outline-none">{children}</ListBox>
        </AriaPopover>
      </AriaSelect>
    </div>
  );
}

export function SelectItem({
  children,
  textValue,
  ...props
}: Omit<ListBoxItemProps<object>, "children"> & { children?: ReactNode }) {
  const label = textValue ?? (typeof children === "string" ? children : undefined);
  return (
    <ListBoxItem
      {...props}
      textValue={label}
      className={
        "flex w-full cursor-default select-none items-center gap-2 rounded-xl px-3 py-2   " +
        "text-stone-900 outline-none " +
        "data-[focused]:bg-teal-500/20 " +
        "data-[disabled]:opacity-50"
      }
    >
      {({ isSelected }) => (
        <>
          <span className="min-w-0 flex-1 truncate">{children}</span>
          {isSelected && <Check width={16} height={16} strokeWidth={1.5} className="shrink-0" aria-hidden />}
        </>
      )}
    </ListBoxItem>
  );
}
