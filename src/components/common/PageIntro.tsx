import React from 'react';

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const PageIntro: React.FC<PageIntroProps> = ({ eyebrow, title, description, children }) => (
  <header className="studio-page-intro">
    <div className="studio-page-intro-copy">
      <span className="studio-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {children && <div className="studio-page-actions">{children}</div>}
  </header>
);
