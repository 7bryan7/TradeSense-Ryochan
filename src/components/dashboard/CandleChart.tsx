import React, { useState, useMemo } from 'react';
import { Candle, Timeframe } from '../../types/market';
import { Layers } from 'lucide-react';

interface CandleChartProps {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  pairName?: string;
  simulatedFillPrice?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  pairName = 'BTC / USD',
  simulatedFillPrice,
  takeProfitPrice,
  stopLossPrice,
}) => {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [showIndicators, setShowIndicators] = useState<boolean>(true);

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

  // Calculate chart boundaries
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (!candles.length) return { minPrice: 0, maxPrice: 100, maxVolume: 100 };
    let min = Math.min(...candles.map(c => c.low));
    let max = Math.max(...candles.map(c => c.high));
    
    // Include simulation levels in view bounds if present
    if (stopLossPrice) min = Math.min(min, stopLossPrice * 0.998);
    if (takeProfitPrice) max = Math.max(max, takeProfitPrice * 1.002);
    
    const padding = (max - min) * 0.08;
    const vol = Math.max(...candles.map(c => c.volume));
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: vol,
    };
  }, [candles, takeProfitPrice, stopLossPrice]);

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 360;
  const candleAreaHeight = 270;
  const volumeAreaHeight = 70;
  const volumeTop = 290;

  const priceRange = maxPrice - minPrice || 1;
  const candleWidth = Math.max(8, (svgWidth - 60) / (candles.length || 1));

  // Helper coordinate converter
  const getY = (price: number) => {
    return candleAreaHeight - ((price - minPrice) / priceRange) * candleAreaHeight;
  };

  const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : 0;
  const currentY = getY(currentPrice);

  return (
    <div className="dashboard-glass-card rounded-2xl p-4 sm:p-5 flex flex-col relative overflow-hidden">
      {/* Top Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="dashboard-chart-controls flex flex-wrap items-center gap-3">
          {/* Pair Selector Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#15171C]/75 backdrop-blur-md border border-white/[0.06] text-xs font-bold text-white font-mono tracking-wide">
            <span>{pairName}</span>
          </div>

          {/* Timeframe Buttons (matching reference template) */}
          <div className="flex items-center bg-[#15171C]/75 backdrop-blur-md border border-white/[0.06] rounded-xl p-0.5">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  timeframe === tf
                    ? 'bg-[#4ce07a] text-[#050806] font-bold shadow-xs'
                    : 'text-[#8F9CAE] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators Toggle */}
          <button
            type="button"
            onClick={() => setShowIndicators(!showIndicators)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border transition-all ${
              showIndicators
                ? 'bg-[#4ce07a]/15 text-[#4ce07a] border-[#4ce07a]/40 font-bold'
                : 'text-[#8F9CAE] border-white/[0.06] hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Indicators</span>
          </button>
        </div>

        {/* Live Hover Metrics Display */}
        {activeCandle && (
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#8F9CAE]">
            <span>
              O: <strong className="text-white">${activeCandle.open.toLocaleString()}</strong>
            </span>
            <span>
              H: <strong className="text-[#4ce07a]">${activeCandle.high.toLocaleString()}</strong>
            </span>
            <span>
              L: <strong className="text-[#EF4444]">${activeCandle.low.toLocaleString()}</strong>
            </span>
            <span>
              C: <strong className={activeCandle.close >= activeCandle.open ? 'text-[#4ce07a]' : 'text-[#EF4444]'}>
                ${activeCandle.close.toLocaleString()}
              </strong>
            </span>
            <span>
              Vol: <strong className="text-white">{activeCandle.volume.toLocaleString()}</strong>
            </span>
          </div>
        )}
      </div>

      {/* SVG Interactive Candlestick Area */}
      <div className="relative w-full h-[360px] select-none pt-2 overflow-hidden">
        {candles.length === 0 && <div role="status" className="absolute inset-0 z-10 flex items-center justify-center bg-[#11191f] text-sm text-slate-400">Chart data is not available yet.</div>}
        <svg
          aria-hidden={candles.length === 0}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          {/* Background Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map(ratio => {
            const y = candleAreaHeight * ratio;
            const priceLevel = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line
                  x1="0"
                  y1={y}
                  x2={svgWidth - 65}
                  y2={y}
                  stroke="rgba(251, 237, 224, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - 60}
                  y={y + 4}
                  fill="rgba(251, 237, 224, 0.4)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ${Math.round(priceLevel).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Volume separator line */}
          <line
            x1="0"
            y1={volumeTop - 10}
            x2={svgWidth}
            y2={volumeTop - 10}
            stroke="rgba(255, 255, 255, 0.06)"
          />

          {/* Take Profit Target Level (Dashed Green) */}
          {takeProfitPrice && (
            <g>
              <line
                x1="0"
                y1={getY(takeProfitPrice)}
                x2={svgWidth - 65}
                y2={getY(takeProfitPrice)}
                stroke="#4ce07a"
                strokeWidth="1.5"
                strokeDasharray="6 3"
                opacity="0.8"
              />
              <rect
                x={svgWidth - 65}
                y={getY(takeProfitPrice) - 9}
                width="65"
                height="18"
                fill="#064e3b"
                rx="3"
              />
              <text
                x={svgWidth - 60}
                y={getY(takeProfitPrice) + 3}
                fill="#4ce07a"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                TP ${Math.round(takeProfitPrice)}
              </text>
            </g>
          )}

          {/* Stop Loss Level (Dashed Red) */}
          {stopLossPrice && (
            <g>
              <line
                x1="0"
                y1={getY(stopLossPrice)}
                x2={svgWidth - 65}
                y2={getY(stopLossPrice)}
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeDasharray="6 3"
                opacity="0.8"
              />
              <rect
                x={svgWidth - 65}
                y={getY(stopLossPrice) - 9}
                width="65"
                height="18"
                fill="#7f1d1d"
                rx="3"
              />
              <text
                x={svgWidth - 60}
                y={getY(stopLossPrice) + 3}
                fill="#EF4444"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                SL ${Math.round(stopLossPrice)}
              </text>
            </g>
          )}

          {/* Current Spot Price Line */}
          <line
            x1="0"
            y1={currentY}
            x2={svgWidth - 65}
            y2={currentY}
            stroke="#4ce07a"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <rect
            x={svgWidth - 65}
            y={currentY - 9}
            width="65"
            height="18"
            fill="#052e16"
            rx="3"
          />
          <text
            x={svgWidth - 60}
            y={currentY + 3}
            fill="#4ce07a"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ${Math.round(currentPrice)}
          </text>

          {/* Candlesticks & Volume Bars */}
          {candles.map((candle, idx) => {
            const isBullish = candle.close >= candle.open;
            const x = idx * candleWidth + 10;
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));
            const barWidth = Math.max(3, candleWidth * 0.72);

            // Volume bar
            const volHeight = (candle.volume / (maxVolume || 1)) * volumeAreaHeight;
            const volY = svgHeight - volHeight;

            return (
              <g
                key={candle.timestamp}
                className="cursor-crosshair group"
                onMouseEnter={() => setHoveredCandle(candle)}
              >
                {/* Wick */}
                <line
                  x1={x + barWidth / 2}
                  y1={highY}
                  x2={x + barWidth / 2}
                  y2={lowY}
                  stroke={isBullish ? '#4ce07a' : '#EF4444'}
                  strokeWidth="1.2"
                />

                {/* Candle Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={barWidth}
                  height={bodyHeight}
                  fill={isBullish ? '#4ce07a' : '#EF4444'}
                  rx="1"
                />

                {/* Volume Bar */}
                <rect
                  x={x}
                  y={volY}
                  width={barWidth}
                  height={volHeight}
                  fill={isBullish ? 'rgba(76, 224, 122, 0.45)' : 'rgba(239, 68, 68, 0.45)'}
                  rx="1"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend / Overlay Note */}
        <div className="absolute bottom-2 left-3 flex items-center gap-4 text-[10px] font-mono text-[#8F9CAE] bg-[#15171C]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.08]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#4ce07a]" /> Bull Candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#EF4444]" /> Bear Candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#4ce07a]" /> Spot Mark
          </span>
          {takeProfitPrice && (
            <span className="flex items-center gap-1.5 text-[#4ce07a]">
              <span className="w-3 h-0.5 bg-[#4ce07a] border-dashed" /> Sim TP
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandleChart;
