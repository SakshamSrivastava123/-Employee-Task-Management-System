import { useState } from 'react';

// Type a skill and press Enter or comma to add it as a chip.
export default function SkillsInput({ id, value, onChange }) {
  const [draft, setDraft] = useState('');

  const addSkill = (raw) => {
    const skill = raw.trim();
    if (!skill) return;
    if (!value.some((s) => s.toLowerCase() === skill.toLowerCase()) && value.length < 15) {
      onChange([...value, skill.slice(0, 40)]);
    }
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="chips-input">
      {value.map((skill) => (
        <span key={skill} className="chip">
          {skill}
          <button type="button" aria-label={`Remove ${skill}`} onClick={() => onChange(value.filter((s) => s !== skill))}>
            &times;
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={value.length ? '' : 'Type a skill, press Enter'}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => addSkill(draft)}
      />
    </div>
  );
}
