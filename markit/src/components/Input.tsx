import { useId, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes } from 'react';
import './Input.css';

// Used by the login and signup forms only. Everything else uses TextField.
type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function Input({
  label,
  id,
  name,
  type = 'text',
  error,
  helperText,
  required,
  disabled,
  className = '',
  onBlur,
  onChange,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const [isTouched, setIsTouched] = useState(false);
  const [hasNativeInvalid, setHasNativeInvalid] = useState(false);

  const inputId = id ?? name ?? generatedId;
  const messageId = `${inputId}-message`;

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length > 0) {
      setIsTouched(true);
      setHasNativeInvalid(!event.currentTarget.validity.valid);
    }
    onBlur?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isTouched) {
      setHasNativeInvalid(!event.currentTarget.validity.valid);
    }
    onChange?.(event);
  };

  const hasError = !!error;
  const isInvalid = hasError || hasNativeInvalid;

  const containerClasses = [
    'input',
    isInvalid ? 'input--error' : '',
    disabled ? 'input--disabled' : '',
    required ? 'input--required' : '',
    label ? 'input--with-label' : '',
    helperText ? 'input--with-helper' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = ['input__field', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <label className="input__control" htmlFor={inputId}>
        <input
          {...rest}
          id={inputId}
          name={name}
          type={type}
          required={required}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={messageId}
          className={inputClasses}
          placeholder={rest.placeholder ?? (label ? ' ' : rest.placeholder)}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        {label ? (
          <span className="input__label">
            <span className="input__label-text">{label}</span>
          </span>
        ) : null}
      </label>

      <small
        id={messageId}
        aria-live="polite"
        className={`input__message${error || hasNativeInvalid ? " input__message--error" : ""}`}
      >
        {error || (hasNativeInvalid ? "Invalid format." : helperText)}
      </small>
    </div>
  );
}
