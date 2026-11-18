import type { ComponentProps } from 'react';

import { Icon } from '../icons';

interface FormFieldProps extends ComponentProps<'input'> {
  id: string;
  label: string;
  hint?: string;
  /** Solo se muestra cuando no es undefined. */
  error?: string;
}

export function FormField({ id, label, hint, error, ...inputProps }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="form-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="field-error">
          <Icon name="warning" size={13} />
          <span>{error}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
