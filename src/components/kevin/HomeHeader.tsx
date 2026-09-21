import React from 'react';
import { Link } from 'react-router-dom';

export const HomeHeader: React.FC = () => {
  return (
    <header className="section theme-lightgray home-header full-height" id="hero">
      <div className="top-bar">
        <div className="logo logo-dark">
          <Link to="/" className="inline-flex items-center gap-2">
            <svg fill="none" height="48" viewBox="0 0 170 48" width="170" xmlns="http://www.w3.org/2000/svg">
              <path className="path-dark turn-left" d="m26.1715 48.0001h-15.3143l-10.8572-10.8571v-15.3143l10.8572-10.8572h15.3143l10.8571 10.8572v15.3143zm-7.7143-4.5714h5.7713l8.2287-8.1714v-11.5429l-8.1715-8.2286h-11.5428l-8.22862 8.2286v11.5429l8.17142 8.1714z" fill="#000" />
              <path className="path-primary turn-right" d="m37.1429 37.0286h-15.3143l-10.8572-10.8572v-15.3143l10.8572-10.8571h15.3143l10.8572 10.8571v15.3143zm-7.6572-4.5715h5.7715l8.1714-8.1714v-11.5428l-8.1714-8.22861h-11.5429l-8.2285 8.17141v11.5429l8.1713 8.1714z" fill="#38f997" />
              <text x="48" y="32" fill="#000" fontFamily="'Neue Montreal', sans-serif" fontSize="19" fontWeight="700" letterSpacing="0.5">
                TRADE<tspan fill="#38f997">SENSE</tspan>
              </text>
            </svg>
          </Link>
        </div>

        {/* Live System Status & Launch Button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/20 border border-emerald-500/30 text-emerald-900 text-xs font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI AGENT ONLINE</span>
          </div>

          <div className="btn btn-normal">
            <Link to="/dashboard" className="btn-click btn-typewriter">
              <div className="btn-fill" />
              <div className="btn-text split-chars">
                <span>Enter App</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="vertical-lines">
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
      </div>

      <div className="visuals">
        <div className="single-visual">
          <div className="overlay overlay-visual" style={{ WebkitClipPath: "url(#hexagonShape)", clipPath: "url(#hexagonShape)" }}>
            <svg fill="none" height="448" viewBox="0 0 388 448" width="388" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="hexagonShape" clipPathUnits="objectBoundingBox">
                  <path d="m0.5,0,0.5,0.25 v0.5 l-0.5,0.25,-0.5,-0.25 v-0.5" fill="#000" />
                </clipPath>
              </defs>
            </svg>
            <img className="overlay lazy" src="/assets/img/row1-3@2x.jpg" alt="TradeSense Visual" />
          </div>
        </div>
        <div className="single-visual">
          <div className="overlay overlay-visual animate-visual" style={{ WebkitClipPath: "url(#hexagonShape)", clipPath: "url(#hexagonShape)" }}>
            <svg fill="none" height="448" viewBox="0 0 388 448" width="388" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="hexagonShape" clipPathUnits="objectBoundingBox">
                  <path d="m0.5,0,0.5,0.25 v0.5 l-0.5,0.25,-0.5,-0.25 v-0.5" fill="#000" />
                </clipPath>
              </defs>
            </svg>
            <img className="overlay lazy" src="/assets/img/hero-1@2x.jpg" alt="TradeSense Visual" />
          </div>
        </div>
        <div className="single-visual">
          <div className="overlay overlay-visual animate-visual" style={{ WebkitClipPath: "url(#hexagonShape)", clipPath: "url(#hexagonShape)" }}>
            <svg fill="none" height="448" viewBox="0 0 388 448" width="388" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="hexagonShape" clipPathUnits="objectBoundingBox">
                  <path d="m0.5,0,0.5,0.25 v0.5 l-0.5,0.25,-0.5,-0.25 v-0.5" fill="#000" />
                </clipPath>
              </defs>
            </svg>
            <img className="overlay lazy" src="/assets/img/hero-3@2x.jpg" alt="TradeSense Visual" />
          </div>
        </div>
        <div className="single-visual">
          <div className="overlay overlay-visual animate-visual-moon">
            <img className="overlay lazy" src="/assets/img/matte-black@2x.png" alt="TradeSense Hologram" />
          </div>
        </div>
        <div className="single-visual">
          <div className="overlay overlay-visual animate-visual-moon">
            <img className="overlay lazy" src="/assets/img/moon@2x.png" alt="Moon Texture" />
          </div>
        </div>
        <div className="single-visual">
          <div className="overlay overlay-visual playpauze" style={{ WebkitClipPath: "url(#hexagonShape)", clipPath: "url(#hexagonShape)" }}>
            <svg fill="none" height="448" viewBox="0 0 388 448" width="388" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="hexagonShape" clipPathUnits="objectBoundingBox">
                  <path d="m0.5,0,0.5,0.25 v0.5 l-0.5,0.25,-0.5,-0.25 v-0.5" fill="#000" />
                </clipPath>
              </defs>
            </svg>
            <video className="overlay" src="/assets/video/hexagon-1-short-edit.mp4" loop muted playsInline autoPlay />
            <svg width="388px" height="448px" viewBox="0 0 388 448" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Group">
                  <polygon id="Path" fillRule="nonzero" points="194 0 388 112 388 336 194 448 0 336 0 112" />
                  <path d="M194,111 L194,337 L96,280.5 L96,167.5 L194,111 Z" id="Combined-Shape" fill="#E7E6E4" />
                  <path d="M388,112.654 L388,336 L194,448 L194,337 L292,280.5 L292,168 L388,112.654 Z" id="Combined-Shape" fill="#171818" fillRule="nonzero" />
                  <path d="M194,111 L292,167.5 L194,224 L96,167.5 L194,111 Z" id="Combined-Shape" fill="#38F997" fillRule="nonzero" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="container large">
        <div className="row">
          <div className="flex-col">
            <h4>
              <span className="split-chars">
                Autonomous AI Crypto-Market Analyst
              </span>
            </h4>
            <div className="lottie-wrapper-1 lottie-gradientbars" data-lottie-json="underline-01">
              <div className="lottie-window" />
            </div>
            <h1>
              <span className="normal split-lines">
                Analyse. Reason. Predict.
              </span>
              <span className="alt split-lines">
                Simulate. Visualize.
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="btn-row">
        <div className="btn btn-normal">
          <Link to="/dashboard" className="btn-click btn-typewriter">
            <div className="btn-fill" />
            <div className="btn-text split-chars">
              <span>Launch TradeSense</span>
            </div>
          </Link>
        </div>
        <div className="btn btn-secondary">
          <a href="#vision" className="btn-click btn-typewriter">
            <div className="btn-fill" />
            <div className="btn-text split-chars">
              <span>Explore Architecture</span>
            </div>
          </a>
        </div>
      </div>

      {/* Floating Track Pills */}
      <div className="container large" style={{ marginTop: '2rem' }}>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/10">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            Track 01: Autonomous Reasoning Agents
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Track 02: Responsive Trading Dashboards
          </span>
        </div>
      </div>

      <div className="lottie-wrapper-2 lottie-gradientbars animate-lottie-gradientbars-reverse" data-lottie-json="gradientbars-01">
        <div className="lottie-window" />
      </div>
    </header>
  );
};

export default HomeHeader;
