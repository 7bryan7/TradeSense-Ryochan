export default function HomeSliderHistory() {
  return (
    <section className="section theme-dark home-slider-history">
      <div className="vertical-lines animate-vertical-lines">
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
        <div className="vertical-line" />
      </div>
      <div className="container large">
        <div className="row swiper-slider slider-timeline">
          <div className="flex-col">
            <div className="swiper-container swiper-container-timeline">
              <div className="overlay overlay-visual">
                <img className="overlay lazy" src="/assets/img/noise-background-02@2x.jpg" alt="" />
              </div>
              <ul className="swiper-wrapper">
                <li className="swiper-slide" data-year="2018">
                  <div className="content">
                    <h3 className="animate-split-lines">
                      <span className="alt split-lines">
                        2018
                      </span>
                    </h3>
                    <h3 className="animate-split-lines">
                      <span className="normal split-lines">
                        A staking community based on a collateralized derivative token
                      </span>
                    </h3>
                  </div>
                </li>
                <li className="swiper-slide" data-year="2019">
                  <div className="content">
                    <h3>
                      <span className="alt split-lines">
                        2019
                      </span>
                    </h3>
                    <h3>
                      <span className="normal split-lines">
                        Deployed a bridge and dex to support our multi-chain staking token
                      </span>
                    </h3>
                  </div>
                </li>
                <li className="swiper-slide" data-year="2020">
                  <div className="content">
                    <h3>
                      <span className="alt split-lines">
                        2020
                      </span>
                    </h3>
                    <h3>
                      <span className="normal split-lines">
                        Unifi Protocol launches AMM with sustainable UP rewards
                      </span>
                    </h3>
                  </div>
                </li>
                <li className="swiper-slide" data-year="2021">
                  <div className="content">
                    <h3>
                      <span className="alt split-lines">
                        2021
                      </span>
                    </h3>
                    <h3>
                      <span className="normal split-lines">
                        More blockchain partners and UNFI DAO participates in governance
                      </span>
                    </h3>
                  </div>
                </li>
                <li className="swiper-slide" data-year="2022">
                  <div className="content">
                    <h3>
                      <span className="alt split-lines">
                        2022
                      </span>
                    </h3>
                    <h3>
                      <span className="normal split-lines">
                        Advanced DeFi strategies and decentralized arbitrage solutions
                      </span>
                    </h3>
                  </div>
                </li>
              </ul>
              <div className="swiper-pagination" />
              <div className="swiper-scrollbar" />
            </div>
          </div>
        </div>
      </div>
      <div className="container large lottie-timeline-text">
        <div className="row">
          <div className="flex-col">
            <h4 className="animate-typewriter">
              <span className="split-chars">
                Our future vision
              </span>
            </h4>
            <h2 className="animate-split-lines">
              <span className="normal split-lines">
                We’re making blockchain adoption the future of finance.
              </span>
            </h2>
            <div className="lottie-wrapper-1 lottie-gradientbars animate-lottie-gradientbars" data-lottie-json="underline-03">
              <div className="lottie-window" />
            </div>
          </div>
        </div>
        <div className="lottie-wrapper-2 lottie-gradientbars animate-lottie-gradientbars" data-lottie-json="gradientbars-02">
          <div className="lottie-window" />
        </div>
      </div>
    </section>
  );
}
