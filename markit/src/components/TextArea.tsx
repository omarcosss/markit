import { useState, type ChangeEvent, type FocusEvent, type TextareaHTMLAttributes } from 'react';
import './TextArea.css';

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  textAreaClassName?: string;
};

export default function TextArea({
  label,
  id,
  name,
  error,
  helperText,
  required,
  disabled,
  className = '',
  containerClassName = '',
  textAreaClassName = '',
  onBlur,
  onChange,
  ...rest
}: TextAreaProps) {
  const [isTouched, setIsTouched] = useState(false);
  const [hasNativeInvalid, setHasNativeInvalid] = useState(false);

  const textAreaId = id ?? name;
  const errorId = textAreaId && error ? `${textAreaId}-error` : undefined;
  const nativeErrorId =
    textAreaId && !error && hasNativeInvalid ? `${textAreaId}-native-error` : undefined;
  const helperId =
    textAreaId && !error && !hasNativeInvalid && helperText ? `${textAreaId}-helper` : undefined;

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    setIsTouched(true);
    setHasNativeInvalid(!event.currentTarget.validity.valid);
    onBlur?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (isTouched) {
      setHasNativeInvalid(!event.currentTarget.validity.valid);
    }
    onChange?.(event);
  };

  const hasError = !!error;
  const isInvalid = hasError || hasNativeInvalid;

  const containerClasses = [
    'textarea',
    isInvalid ? 'textarea--error' : '',
    disabled ? 'textarea--disabled' : '',
    required ? 'textarea--required' : '',
    label ? 'textarea--with-label' : '',
    helperText ? 'textarea--with-helper' : '',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const textAreaClasses = ['textarea__field', className, textAreaClassName].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="textarea__control">
        <textarea
          {...rest}
          id={textAreaId}
          name={name}
          required={required}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={errorId ?? nativeErrorId ?? helperId}
          className={textAreaClasses}
          placeholder={rest.placeholder ?? (label ? ' ' : rest.placeholder)}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        {label ? (
          <label htmlFor={textAreaId} className="textarea__label">
            <span className="textarea__label-text">{label}</span>
            {required ? <span className="textarea__required-mark">*</span> : null}
          </label>
        ) : null}
      </div>

      {error ? (
        <small id={errorId} className="textarea__message textarea__message--error">
          {error}
        </small>
      ) : null}

      {!error && hasNativeInvalid ? (
        <small id={nativeErrorId} className="textarea__message textarea__message--error">
          Formato invalido.
        </small>
      ) : null}

      {!error && !hasNativeInvalid && helperText ? (
        <small id={helperId} className="textarea__message textarea__message--helper">
          {helperText}
        </small>
      ) : null}
    </div>
  );
}
