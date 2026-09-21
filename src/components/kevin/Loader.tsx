import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="loading-container theme-dark">
      <div className="loading-screen">
        <div className="top-bar">
          <div className="logo logo-light">
            <svg fill="none" height="48" viewBox="0 0 160 48" width="160" xmlns="http://www.w3.org/2000/svg">
              <path className="path-dark turn-left" d="m26.1715 48.0001h-15.3143l-10.8572-10.8571v-15.3143l10.8572-10.8572h15.3143l10.8571 10.8572v15.3143zm-7.7143-4.5714h5.7713l8.2287-8.1714v-11.5429l-8.1715-8.2286h-11.5428l-8.22862 8.2286v11.5429l8.17142 8.1714z" fill="#000" />
              <path className="path-primary turn-right" d="m37.1429 37.0286h-15.3143l-10.8572-10.8572v-15.3143l10.8572-10.8571h15.3143l10.8572 10.8571v15.3143zm-7.6572-4.5715h5.7715l8.1714-8.1714v-11.5428l-8.1714-8.22861h-11.5429l-8.2285 8.17141v11.5429l8.1713 8.1714z" fill="#38f997" />
              <text x="46" y="32" fill="#fff" fontFamily="'Neue Montreal', sans-serif" fontSize="18" fontWeight="700" letterSpacing="0.5">
                TRADE<tspan fill="#38f997">SENSE</tspan>
              </text>
            </svg>
          </div>
          <div className="h4-wrap">
            <h4>
              <span className="split-chars">
                Initializing TradeSense Autonomous Agent
              </span>
            </h4>
          </div>
        </div>
        <div className="progress" />
      </div>
    </div>
  );
};

export default Loader;
