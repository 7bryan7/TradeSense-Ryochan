import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="section theme-dark footer" id="footer">
      <div className="vertical-lines animate-vertical-lines">
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
      </div>
      <div className="corner">
        <img src="/assets/img/square-gradient-01@2x.png" alt="TradeSense Visual Corner" />
      </div>
      <div className="visuals">
        <div className="single-visual">
          <div className="overlay overlay-visual animate-visual">
            <svg fill="none" height="448" viewBox="0 0 388 448" width="388" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="hexagonShape" clipPathUnits="objectBoundingBox">
                  <path d="m0.5,0,0.5,0.25 v0.5 l-0.5,0.25,-0.5,-0.25 v-0.5" fill="#000" />
                </clipPath>
              </defs>
            </svg>
            <img style={{ WebkitClipPath: "url(#hexagonShape)", clipPath: "url(#hexagonShape)" }} className="overlay lazy" src="/assets/img/hero-3@2x.jpg" alt="TradeSense Architecture" />
          </div>
        </div>
        <div className="single-visual">
          <div className="overlay overlay-visual">
            <svg fill="none" height="448" viewBox="0 0 388 448" width="388" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="hexagonShape" clipPathUnits="objectBoundingBox">
                  <path d="m0.5,0,0.5,0.25 v0.5 l-0.5,0.25,-0.5,-0.25 v-0.5" fill="#000" />
                </clipPath>
              </defs>
            </svg>
            <img style={{ WebkitClipPath: "url(#hexagonShape)", clipPath: "url(#hexagonShape)" }} className="overlay lazy" src="/assets/img/row1-3@2x.jpg" alt="TradeSense Ecosystem" />
          </div>
        </div>
      </div>
      <div className="content">
        <div className="container large top-footer">
          <div className="row">
            <div className="flex-col">
              <div className="logo logo-light">
                <Link to="/" className="inline-flex items-center gap-2">
                  <svg fill="none" height="48" viewBox="0 0 170 48" width="170" xmlns="http://www.w3.org/2000/svg">
                    <path className="path-dark turn-left" d="m26.1715 48.0001h-15.3143l-10.8572-10.8571v-15.3143l10.8572-10.8572h15.3143l10.8571 10.8572v15.3143zm-7.7143-4.5714h5.7713l8.2287-8.1714v-11.5429l-8.1715-8.2286h-11.5428l-8.22862 8.2286v11.5429l8.17142 8.1714z" fill="#000" />
                    <path className="path-primary turn-right" d="m37.1429 37.0286h-15.3143l-10.8572-10.8572v-15.3143l10.8572-10.8571h15.3143l10.8572 10.8571v15.3143zm-7.6572-4.5715h5.7715l8.1714-8.1714v-11.5428l-8.1714-8.22861h-11.5429l-8.2285 8.17141v11.5429l8.1713 8.1714z" fill="#38f997" />
                    <text x="48" y="32" fill="#fff" fontFamily="'Neue Montreal', sans-serif" fontSize="19" fontWeight="700" letterSpacing="0.5">
                      TRADE<tspan fill="#38f997">SENSE</tspan>
                    </text>
                  </svg>
                </Link>
              </div>
              <p style={{ marginTop: '1.5rem', maxWidth: '320px', color: '#8A9BB0', fontSize: '0.9rem' }}>
                Autonomous AI crypto market analyst combining explainable multi-source reasoning with deterministic simulation.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/dashboard" className="btn btn-normal" style={{ display: 'inline-block' }}>
                  <div className="btn-click btn-typewriter">
                    <div className="btn-fill" />
                    <div className="btn-text split-chars">
                      <span>Launch App</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="flex-col">
              <div className="sub-col">
                <h4>
                  <span>Application</span>
                </h4>
                <ul>
                  <li><Link to="/dashboard">Terminal Dashboard</Link></li>
                  <li><Link to="/markets">Markets Intelligence</Link></li>
                  <li><Link to="/analysis">AI Reasoning Thesis</Link></li>
                  <li><Link to="/portfolio">Paper Portfolio</Link></li>
                  <li><Link to="/history">Deterministic Trace</Link></li>
                  <li><Link to="/watchlist">Token Watchlist</Link></li>
                  <li><Link to="/settings">Agent Configuration</Link></li>
                </ul>
              </div>
              <div className="sub-col">
                <h4>
                  <span>Intelligence</span>
                </h4>
                <ul>
                  <li><a href="#vision">Binance Orderbooks</a></li>
                  <li><a href="#vision">CryptoPanic Sentiment</a></li>
                  <li><a href="#vision">CoinGecko Fundamentals</a></li>
                  <li><a href="#vision">Fear & Greed Index</a></li>
                  <li><a href="#vision">10 bps Slippage Model</a></li>
                </ul>
              </div>
              <div className="sub-col">
                <h4>
                  <span>Architecture</span>
                </h4>
                <ul>
                  <li><span style={{ color: '#38f997' }}>Track 01: Autonomous Agents</span></li>
                  <li><span style={{ color: '#00d2ff' }}>Track 02: Trading Dashboards</span></li>
                  <li><span>Deterministic Replay Audit</span></li>
                  <li><span>Dual FIXTURE / LIVE Modes</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-footer">
          <div className="container large">
            <div className="row">
              <div className="flex-col absolute">
                <p className="small">
                  © 2026 TradeSense. Built for Ryochan Hackathon 2026. All rights reserved.
                </p>
              </div>
              <div className="flex-col">
                <div className="social-icons">
                  <Link to="/dashboard" className="s-icon" title="Launch Terminal">
                    <div className="s-icon-wrap" style={{ color: '#38F997', fontWeight: 'bold' }}>
                      TS
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
