import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  asChild = false,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = `button button--${variant} button--${size} ${className}`.trim();
  const content = loading ? 'Aguarde...' : children;

  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('Button with asChild requires a single valid React element child.');
    }

    const child = children as ReactElement<{ className?: string; 'aria-disabled'?: boolean }>;

    return cloneElement(child, {
      className: `${classes} ${child.props.className ?? ''}`.trim(),
      'aria-disabled': isDisabled,
    });
  }

  return (
    <button {...rest} type={type} disabled={isDisabled} className={classes}>
      {content}
    </button>
  );
}
