import { Children, type ComponentProps, type ReactElement, type ReactNode } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Header,
  Keyboard,
  Menu as AriaMenu,
  type MenuProps as AriaMenuProps,
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
  MenuSection as AriaMenuSection,
  type MenuSectionProps as AriaMenuSectionProps,
  MenuTrigger as AriaMenuTrigger,
  type MenuTriggerProps as AriaMenuTriggerProps,
  Popover as AriaPopover,
  type PopoverProps,
  Separator,
  SubmenuTrigger as AriaSubmenuTrigger,
  type SubmenuTriggerProps as AriaSubmenuTriggerProps,
} from "react-aria-components";
import { Check, NavArrowRight } from "iconoir-react";

/*
 * Menu built on React Aria Components, styled to match markit's buttons and
 * cards: rounded-3xl white panels, pill-shaped items with the teal ghost hover.
 *
 * Usage:
 *   <MenuTrigger>
 *     <MenuButton aria-label="Options"><MoreHoriz /></MenuButton>
 *     <Menu aria-label="Options">
 *       <MenuItem id="rename" textValue="Rename" onAction={rename}><EditPencil />Rename</MenuItem>
 *       <MenuSeparator />
 *       <MenuItem id="delete" textValue="Delete" variant="danger" onAction={remove}>Delete</MenuItem>
 *     </Menu>
 *   </MenuTrigger>
 */

const panelClass =
  "min-w-48 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl outline-none " +
  "data-[entering]:animate-[menu-in_180ms_ease-out_both] " +
  "data-[exiting]:animate-[menu-out_140ms_ease-in_both]";

// Colours carry "!" because index.css sets `a { color }` without a layer, which
// would otherwise override the utility on items rendered as links (href).
const itemClass =
  "group flex w-full cursor-default select-none items-center gap-2 rounded-xl px-4 py-2.5 " +
  "text-sm font-medium outline-none [&>svg]:shrink-0 " +
  "data-[focused]:bg-teal-500/20 " +
  "data-[disabled]:cursor-default data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent";

const toneClass = {
  default: "text-stone-900!",
  danger: "text-red-600! data-[focused]:bg-red-600/10! data-[pressed]:bg-red-100!",
} as const;

export function MenuTrigger({
  children,
  placement = "bottom end",
  ...props
}: AriaMenuTriggerProps & { placement?: PopoverProps["placement"] }) {
  const [trigger, menu] = Children.toArray(children) as [ReactElement, ReactElement];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <AriaPopover placement={placement} offset={8} className={panelClass}>
        {menu}
      </AriaPopover>
    </AriaMenuTrigger>
  );
}

/** Icon-style trigger matching the app's ghost small button. */
export function MenuButton({ className = "", ...props }: AriaButtonProps) {
  return (
    <AriaButton
      {...props}
      className={
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full px-3 py-2 " +
        "text-stone-700 outline-none transition-[background-color,transform] duration-200 " +
        "hover:bg-stone-600/10 data-[open]:bg-teal-600/10 data-[pressed]:scale-95 " +
        "data-[focus-visible]:ring-2 data-[focus-visible]:ring-teal-500 " +
        className
      }
    />
  );
}

export function Menu<T extends object>(props: AriaMenuProps<T>) {
  return (
    <AriaMenu
      {...props}
      className="flex max-h-[inherit] flex-col gap-0.5 overflow-auto outline-none"
    />
  );
}

export interface MenuItemProps extends Omit<AriaMenuItemProps, "children" | "className" | "style"> {
  children?: ReactNode;
  variant?: "default" | "danger";
}

export function MenuItem({ children, variant = "default", textValue, ...props }: MenuItemProps) {
  const label = textValue ?? (typeof children === "string" ? children : undefined);
  return (
    <AriaMenuItem
      {...props}
      textValue={label}
      className={`${itemClass} ${toneClass[variant]}`}
    >
      {({ hasSubmenu, isSelected, selectionMode }) => (
        <>
          {selectionMode !== "none" && isSelected && (
            <Check width={16} height={16} strokeWidth={2.5} aria-hidden />
          )}
          {children}
          {hasSubmenu && (
            <NavArrowRight width={16} height={16} className="ml-auto" aria-hidden />
          )}
        </>
      )}
    </AriaMenuItem>
  );
}

export function MenuSeparator() {
  return <Separator className="mx-2 my-1 h-px border-0 bg-stone-100" />;
}

/** Section heading. Sections without a heading need an aria-label. */
export function MenuHeader({ className = "", ...props }: ComponentProps<typeof Header>) {
  return (
    <Header
      {...props}
      className={`px-3 pt-2 pb-1 text-xs font-semibold text-stone-500 ${className}`}
    />
  );
}

export function MenuSection<T extends object>(props: AriaMenuSectionProps<T>) {
  return <AriaMenuSection {...props} className="flex flex-col gap-0.5" />;
}

/** Keyboard shortcut hint, placed at the end of an item. */
export function MenuShortcut(props: ComponentProps<typeof Keyboard>) {
  return (
    <Keyboard
      {...props}
      className="ml-auto pl-4 font-sans text-xs text-stone-400 group-data-[focused]:text-stone-500"
    />
  );
}

export function SubmenuTrigger({ children, ...props }: AriaSubmenuTriggerProps) {
  const [trigger, menu] = Children.toArray(children) as [ReactElement, ReactElement];
  return (
    <AriaSubmenuTrigger {...props}>
      {trigger}
      <AriaPopover offset={-2} crossOffset={-4} className={panelClass}>
        {menu}
      </AriaPopover>
    </AriaSubmenuTrigger>
  );
}
