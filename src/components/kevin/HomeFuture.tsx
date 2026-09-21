import React from 'react';

export const HomeFuture: React.FC = () => {
  return (
    <section className="section theme-white home-future">
      <div className="vertical-lines animate-vertical-lines">
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
      </div>
      <div className="container medium lottie-timeline-text">
        <div className="row">
          <div className="flex-col">
            <h4 className="animate-typewriter">
              <span className="split-chars">
                Autonomous Agent Architecture
              </span>
            </h4>
            <h2 className="animate-split-lines">
              <span className="normal split-lines">
                Formulating rigorous theses, stress-testing contrary evidence, and enforcing deterministic risk guardrails.
              </span>
            </h2>
            <div className="lottie-wrapper-1 lottie-gradientbars animate-lottie-gradientbars" data-lottie-json="underline-03">
              <div className="lottie-window" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFuture;
