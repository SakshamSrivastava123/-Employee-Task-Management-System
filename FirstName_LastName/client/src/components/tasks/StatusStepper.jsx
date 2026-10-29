const FLOW = ['Todo', 'In Progress', 'Completed'];

// Visual progress of a task through Todo -> In Progress -> Completed (or Cancelled).
export default function StatusStepper({ status }) {
  if (status === 'Cancelled') {
    return <p className="stepper stepper--cancelled">This task was cancelled.</p>;
  }
  const current = FLOW.indexOf(status);
  return (
    <ol className="stepper" aria-label="Task progress">
      {FLOW.map((step, i) => (
        <li key={step} className={i < current ? 'step step--done' : i === current ? 'step step--current' : 'step'} aria-current={i === current ? 'step' : undefined}>
          <span className="step__dot" aria-hidden="true" />
          {step}
        </li>
      ))}
    </ol>
  );
}
