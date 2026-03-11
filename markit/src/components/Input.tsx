import { useId, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes } from 'react';
import './Input.css';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
  mask?: (value: string) => string;
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
  containerClassName = '',
  inputClassName = '',
  mask,
  onBlur,
  onChange,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const [isTouched, setIsTouched] = useState(false);
  const [hasNativeInvalid, setHasNativeInvalid] = useState(false);

  const inputId = id ?? name ?? generatedId;
  const errorId = inputId && error ? `${inputId}-error` : undefined;
  const nativeErrorId = inputId && !error && hasNativeInvalid ? `${inputId}-native-error` : undefined;
  const helperId = inputId && !error && !hasNativeInvalid && helperText ? `${inputId}-helper` : undefined;

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);
    setHasNativeInvalid(!event.currentTarget.validity.valid);
    onBlur?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (mask) {
      event.currentTarget.value = mask(event.currentTarget.value);
    }

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
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = ['input__field', className, inputClassName].filter(Boolean).join(' ');

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
          aria-describedby={errorId ?? nativeErrorId ?? helperId}
          className={inputClasses}
          placeholder={rest.placeholder ?? (label ? ' ' : rest.placeholder)}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        {label ? (
          <span className="input__label">
            <span className="input__label-text">{label}</span>
            {required ? <span className="input__required-mark">*</span> : null}
          </span>
        ) : null}
      </label>

      {error ? (
        <small id={errorId} className="input__message input__message--error">
          {error}
        </small>
      ) : null}

      {!error && hasNativeInvalid ? (
        <small id={nativeErrorId} className="input__message input__message--error">
          Formato inválido.
        </small>
      ) : null}

      {!error && !hasNativeInvalid && helperText ? (
        <small id={helperId} className="input__message input__message--helper">
          {helperText}
        </small>
      ) : null}
    </div>
  );
}
