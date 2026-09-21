import React from 'react';
import { Link } from 'react-router-dom';

export const HomeOnline: React.FC = () => {
  return (
    <section className="section theme-white home-online">
      <div className="vertical-lines">
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
      </div>
      <div className="container medium">
        <div className="row">
          <div className="flex-col">
            <div className="content">
              <div className="overlay overlay-visual">
                <img className="overlay lazy" src="/assets/img/noise-background-04@2x.jpg" alt="Background noise" />
              </div>
              <div className="content-inner" id="target-connect">
                <h4 className="animate-typewriter">
                  <span className="split-chars">
                    Ready to Trade with Clarity
                  </span>
                </h4>
                <h2 className="animate-split-lines">
                  <span className="normal split-lines">
                    Experience TradeSense Live Terminal
                  </span>
                </h2>
                <p className="animate-p" style={{ margin: '1.5rem 0', maxWidth: '500px' }}>
                  Explore live multi-token candle charts, AI hypothesis breakdown, contrary evidence pills, and deterministic portfolio simulation.
                </p>
                <div className="btn btn-normal">
                  <Link to="/dashboard" className="btn-click btn-typewriter">
                    <div className="btn-fill" />
                    <div className="btn-text split-chars">
                      <span>Launch App Now</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lottie-wrapper-2 lottie-gradientbars animate-lottie-gradientbars" data-lottie-json="gradientbars-01">
        <div className="lottie-window" />
      </div>
    </section>
  );
};

export default HomeOnline;
