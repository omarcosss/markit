import type { ReactNode } from 'react';
import './Section.css';

type SectionProps = {
  children: ReactNode;
  className?: string;
  background?: string;
  id?: string;
};

export default function Section({ children, className = '', background, id }: SectionProps) {
  const sectionClasses = `section ${className}`.trim();

  return (
    <section
      className={sectionClasses}
      id={id}
      style={background ? { background } : undefined}
    >
      <div className="section__content">{children}</div>
    </section>
  );
}
