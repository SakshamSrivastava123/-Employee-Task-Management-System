export default function FormField({ label, htmlFor, error, hint, required, className = '', children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="field__req"> *</span>}
      </label>
      {children}
      {hint && !error && <small className="field__hint">{hint}</small>}
      {error && (
        <small className="field__error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
