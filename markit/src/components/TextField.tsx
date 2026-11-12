import {
  FieldError,
  Input,
  Label,
  Text,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

/*
 * Text field built on React Aria Components, styled like markit's Select
 * trigger. The input text is 16px on purpose: iOS Safari zooms into any field
 * whose font size is below 16px. The root html size is 14px, so this can't be
 * a rem value.
 *
 * Usage:
 *   <TextField label="Title" value={title} onChange={setTitle} />
 *   <TextField label="Description" multiline rows={4} description="Optional" />
 */

const fieldClass =
  "w-full min-w-0 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[16px] text-stone-900 " +
  "placeholder:text-stone-400 outline-none transition-colors " +
  "hover:border-stone-300 focus:border-stone-300 focus:ring-2 focus:ring-teal-500 " +
  "data-[invalid]:border-red-500 " +
  "data-[disabled]:cursor-default data-[disabled]:opacity-50";

export interface TextFieldProps
  extends Omit<AriaTextFieldProps, "className" | "children"> {
  label?: string;
  /** Helper text shown under the field. Hidden while an error is shown. */
  description?: string;
  errorMessage?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  multiline = false,
  rows = 4,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      isInvalid={props.isInvalid || !!errorMessage}
      className={`flex flex-col gap-2 ${className}`}
    >
      {label && <Label className="px-1 text-sm text-stone-500">{label}</Label>}
      {multiline ? (
        <AriaTextArea
          rows={rows}
          placeholder={placeholder}
          className={`${fieldClass} resize-y`}
        />
      ) : (
        <Input placeholder={placeholder} className={fieldClass} />
      )}
      {description && !errorMessage && (
        <Text slot="description" className="px-1 text-xs text-stone-500">
          {description}
        </Text>
      )}
      {errorMessage && (
        <FieldError className="px-1 text-sm text-red-600">{errorMessage}</FieldError>
      )}
    </AriaTextField>
  );
}
