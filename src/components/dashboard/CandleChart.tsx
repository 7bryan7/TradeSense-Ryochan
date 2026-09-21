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
  simulatedFillPrice = 112482.31,
  takeProfitPrice = 116200.00,
  stopLossPrice = 108500.00,
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
    <div className="bg-[#161926]/90 backdrop-blur-xl border border-[rgba(251,237,224,0.12)] rounded-2xl p-4.5 shadow-xl flex flex-col">
      {/* Top Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(251,237,224,0.08)]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#FBEDE0] font-mono tracking-wider">
            {pairName}
          </span>

          {/* Timeframe Buttons (ethonline-main style) */}
          <div className="flex items-center bg-[#10131F] border border-[rgba(251,237,224,0.10)] rounded-xl p-0.5">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  timeframe === tf
                    ? 'bg-[#FBEDE0] text-[#0C0E17] shadow-xs'
                    : 'text-[rgba(251,237,224,0.6)] hover:text-[#FBEDE0]'
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
                ? 'bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/30'
                : 'text-[rgba(251,237,224,0.5)] border-[rgba(251,237,224,0.10)] hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Indicators</span>
          </button>
        </div>

        {/* Live Hover Metrics Display */}
        {activeCandle && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-[rgba(251,237,224,0.6)] overflow-x-auto">
            <span>
              O: <strong className="text-[#FBEDE0]">${activeCandle.open.toLocaleString()}</strong>
            </span>
            <span>
              H: <strong className="text-[#38F997]">${activeCandle.high.toLocaleString()}</strong>
            </span>
            <span>
              L: <strong className="text-[#F87171]">${activeCandle.low.toLocaleString()}</strong>
            </span>
            <span>
              C: <strong className={activeCandle.close >= activeCandle.open ? 'text-[#38F997]' : 'text-[#F87171]'}>
                ${activeCandle.close.toLocaleString()}
              </strong>
            </span>
            <span>
              Vol: <strong className="text-[#FBEDE0]">{activeCandle.volume.toLocaleString()}</strong>
            </span>
          </div>
        )}
      </div>

      {/* SVG Interactive Candlestick Area */}
      <div className="relative w-full h-[360px] select-none pt-2 overflow-hidden">
        <svg
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
            stroke="rgba(251, 237, 224, 0.08)"
          />

          {/* Take Profit Target Level (Dashed Green) */}
          {takeProfitPrice && (
            <g>
              <line
                x1="0"
                y1={getY(takeProfitPrice)}
                x2={svgWidth - 65}
                y2={getY(takeProfitPrice)}
                stroke="#38F997"
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
                fill="#38F997"
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
                stroke="#F87171"
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
                fill="#F87171"
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
            stroke="#00D2FF"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <rect
            x={svgWidth - 65}
            y={currentY - 9}
            width="65"
            height="18"
            fill="#083344"
            rx="3"
          />
          <text
            x={svgWidth - 60}
            y={currentY + 3}
            fill="#38BDF8"
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
                  stroke={isBullish ? '#38F997' : '#F87171'}
                  strokeWidth="1.2"
                />

                {/* Candle Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={barWidth}
                  height={bodyHeight}
                  fill={isBullish ? '#38F997' : '#F87171'}
                  rx="1"
                />

                {/* Volume Bar */}
                <rect
                  x={x}
                  y={volY}
                  width={barWidth}
                  height={volHeight}
                  fill={isBullish ? 'rgba(56, 249, 151, 0.40)' : 'rgba(248, 113, 113, 0.40)'}
                  rx="1"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend / Overlay Note */}
        <div className="absolute bottom-2 left-3 flex items-center gap-4 text-[10px] font-mono text-[rgba(251,237,224,0.6)] bg-[#10131F]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[rgba(251,237,224,0.10)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#38F997]" /> Bull Candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#F87171]" /> Bear Candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#00D2FF]" /> Spot Mark
          </span>
          {takeProfitPrice && (
            <span className="flex items-center gap-1.5 text-[#38F997]">
              <span className="w-3 h-0.5 bg-[#38F997] border-dashed" /> Sim TP
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandleChart;
