'use client';

import React from 'react';
import { Transaction } from '../data/mockData';

// ----------------------------------------------------
// 1. Smooth Line Chart for Portfolio Performance
// ----------------------------------------------------
interface LineChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}

export const PortfolioTrendChart: React.FC<LineChartProps> = ({
  data,
  labels,
  color = '#2563EB',
  height = 160,
}) => {
  if (data.length === 0) return null;

  const min = Math.min(...data) * 0.999;
  const max = Math.max(...data) * 1.001;
  const range = max - min === 0 ? 1 : max - min;

  // SVG dimensions
  const width = 500;
  const paddingX = 10;
  const paddingY = 20;

  const points = data.map((val, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - min) / range) * (height - 2 * paddingY);
    return { x, y };
  });

  // Build SVG path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Control points for bezier curves
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
  }

  // Build Area path underneath the line
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* Subtle grid lines */}
        <line
          x1={0}
          y1={paddingY}
          x2={width}
          y2={paddingY}
          stroke="#F1F5F9"
          strokeWidth={1}
        />
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#F1F5F9"
          strokeWidth={1}
        />
        <line
          x1={0}
          y1={height - paddingY}
          x2={width}
          y2={height - paddingY}
          stroke="#E2E8F0"
          strokeWidth={1.5}
        />

        {/* Fill Area (opacity) */}
        {areaD && (
          <path
            d={areaD}
            fill={`${color}12`}
          />
        )}

        {/* Line Path */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Interactive Dots on extremities and end */}
        {points.map((pt, i) => {
          if (i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)) {
            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={6}
                  fill="#FFFFFF"
                  stroke={color}
                  strokeWidth={2}
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={2}
                  fill={color}
                />
              </g>
            );
          }
          return null;
        })}
      </svg>

      {/* X Axis Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#94A3B8',
          marginTop: '6px',
          padding: '0 4px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. Horizontal Category Spending Breakdown
// ----------------------------------------------------
interface CategorySpendProps {
  transactions: Transaction[];
}

export const CategorySpendChart: React.FC<CategorySpendProps> = ({ transactions }) => {
  // Aggregate outlays by category
  const categories: Record<string, number> = {};
  let totalSpend = 0;

  transactions
    .filter(tx => tx.type === 'outflow' && tx.status !== 'Flagged')
    .forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + tx.amountUsd;
      totalSpend += tx.amountUsd;
    });

  const sortedCategories = Object.entries(categories)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Trading': return '#2563EB'; // Blue
      case 'Gas Fees': return '#F59E0B'; // Amber
      case 'Subscriptions': return '#8B5CF6'; // Purple
      case 'Security Risk': return '#EF4444'; // Red
      case 'Food & Ent': return '#EC4899'; // Pink
      case 'Transfers': return '#64748B'; // Slate
      default: return '#94A3B8';
    }
  };

  if (sortedCategories.length === 0) {
    return (
      <div style={{ color: '#64748B', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
        No outflows recorded this cycle.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-sans)' }}>
      {sortedCategories.map(cat => {
        const percentage = totalSpend > 0 ? (cat.amount / totalSpend) * 100 : 0;
        const color = getCategoryColor(cat.name);

        return (
          <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontWeight: 500, color: '#0B192C' }}>{cat.name}</span>
              <span style={{ color: '#64748B' }}>
                ${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px' }}>
                  ({percentage.toFixed(0)}%)
                </span>
              </span>
            </div>
            {/* Custom progress bar */}
            <div style={{ height: '8px', width: '100%', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: color,
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ----------------------------------------------------
// 3. Mini Inflow / Outflow Comparison Chart
// ----------------------------------------------------
interface ComparisonProps {
  inflow: number;
  outflow: number;
}

export const InflowOutflowComparison: React.FC<ComparisonProps> = ({ inflow, outflow }) => {
  const max = Math.max(inflow, outflow, 1);
  const inflowPercent = (inflow / max) * 100;
  const outflowPercent = (outflow / max) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0', fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span style={{ fontSize: '13px', color: '#64748B' }}>Inflow</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>
            +${inflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div style={{ height: '12px', width: '100%', backgroundColor: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${inflowPercent}%`, backgroundColor: '#10B981', borderRadius: '6px' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ fontSize: '13px', color: '#64748B' }}>Outflow</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>
            -${outflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div style={{ height: '12px', width: '100%', backgroundColor: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${outflowPercent}%`, backgroundColor: '#EF4444', borderRadius: '6px' }} />
        </div>
      </div>
    </div>
  );
};
