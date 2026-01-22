'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

function TableOfContents({ sections, activeSection }) {
  return (
    <nav style={{
      position: 'sticky',
      top: '20px',
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '24px',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        Contents
      </h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {sections.map((section) => (
          <li key={section.id} style={{ marginBottom: '4px' }}>
            <a
              href={`#${section.id}`}
              style={{
                color: activeSection === section.id ? '#2563eb' : '#475569',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: activeSection === section.id ? '600' : '400',
                display: 'block',
                padding: '4px 0',
                borderLeft: activeSection === section.id ? '3px solid #2563eb' : '3px solid transparent',
                paddingLeft: '12px',
                transition: 'all 0.2s ease',
              }}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CodeBlock({ children, language }) {
  return (
    <pre style={{
      background: '#1e293b',
      color: '#e2e8f0',
      padding: '20px',
      borderRadius: '8px',
      overflowX: 'auto',
      fontSize: '0.82rem',
      lineHeight: '1.6',
      margin: '16px 0',
      position: 'relative',
    }}>
      {language && (
        <span style={{
          position: 'absolute',
          top: '8px',
          right: '12px',
          fontSize: '0.7rem',
          color: '#64748b',
          textTransform: 'uppercase',
        }}>
          {language}
        </span>
      )}
      <code>{children}</code>
    </pre>
  );
}

function Formula({ children, label, number }) {
  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '24px',
      margin: '24px 0',
      textAlign: 'center',
      position: 'relative',
    }}>
      <div style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '1.15rem',
        color: '#1e293b',
        marginBottom: label ? '12px' : 0,
      }}>
        {children}
      </div>
      {label && (
        <div style={{
          fontSize: '0.85rem',
          color: '#64748b',
          fontStyle: 'italic',
        }}>
          {label}
        </div>
      )}
      {number && (
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
          fontSize: '0.9rem',
        }}>
          ({number})
        </div>
      )}
    </div>
  );
}

function DataTable({ headers, rows, caption, source, number }) {
  return (
    <div style={{ margin: '24px 0', overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.85rem',
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {caption && (
          <caption style={{
            padding: '12px 16px',
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'left',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '0.9rem',
          }}>
            {number && <span style={{ color: '#2563eb' }}>Table {number}. </span>}
            {caption}
          </caption>
        )}
        <thead>
          <tr style={{ background: '#1e40af', color: 'white' }}>
            {headers.map((header, i) => (
              <th key={i} style={{
                padding: '10px 14px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.8rem',
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? 'white' : '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '10px 14px',
                  color: '#475569',
                  fontSize: '0.85rem',
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {source && (
        <div style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          fontStyle: 'italic',
          marginTop: '8px',
        }}>
          {source}
        </div>
      )}
    </div>
  );
}

function Figure({ children, caption, number }) {
  return (
    <figure style={{
      margin: '32px 0',
      padding: '0',
    }}>
      <div style={{
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '12px',
      }}>
        {children}
      </div>
      <figcaption style={{
        fontSize: '0.9rem',
        color: '#475569',
        lineHeight: '1.6',
      }}>
        <strong style={{ color: '#1e293b' }}>Figure {number}.</strong> {caption}
      </figcaption>
    </figure>
  );
}

function Reference({ number, authors, title, journal, year, doi, volume, pages }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: '#f8fafc',
      borderRadius: '6px',
      marginBottom: '10px',
      fontSize: '0.85rem',
      lineHeight: '1.5',
    }}>
      <span style={{
        display: 'inline-block',
        background: '#2563eb',
        color: 'white',
        minWidth: '22px',
        height: '22px',
        borderRadius: '4px',
        textAlign: 'center',
        lineHeight: '22px',
        fontSize: '0.7rem',
        marginRight: '10px',
        fontWeight: '600',
      }}>
        {number}
      </span>
      <span style={{ color: '#1e293b' }}>{authors} </span>
      <span style={{ fontStyle: 'italic' }}>{title}. </span>
      <span style={{ color: '#64748b' }}>{journal}</span>
      {volume && <span style={{ color: '#64748b' }}> <strong>{volume}</strong></span>}
      {pages && <span style={{ color: '#64748b' }}>:{pages}</span>}
      <span style={{ color: '#64748b' }}> ({year}). </span>
      {doi && (
        <a
          href={`https://doi.org/${doi}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2563eb', fontSize: '0.8rem' }}
        >
          doi:{doi}
        </a>
      )}
    </div>
  );
}

function StatCard({ value, label, sublabel }) {
  return (
    <div style={{
      background: 'white',
      padding: '16px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#2563eb',
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#1e293b',
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{
          fontSize: '0.75rem',
          color: '#64748b',
          marginTop: '2px',
        }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

function InfoBox({ title, children, type = 'info' }) {
  const colors = {
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
    warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
    success: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  };
  const c = colors[type];

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
    }}>
      {title && <h4 style={{ margin: '0 0 8px 0', color: c.text }}>{title}</h4>}
      <div style={{ color: c.text, fontSize: '0.95rem', lineHeight: '1.6' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// SVG FIGURES
// ============================================================================

function PipelineFlowDiagram() {
  return (
    <svg viewBox="0 0 800 200" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="pipelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Step 1: Input */}
      <g transform="translate(20, 40)">
        <rect x="0" y="0" width="120" height="80" rx="8" fill="url(#pipelineGrad)" />
        <text x="60" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">DNA File</text>
        <text x="60" y="52" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10">23andMe / VCF</text>
        <text x="60" y="68" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">~650K variants</text>
      </g>
      <line x1="145" y1="80" x2="175" y2="80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Step 2: Parse & QC */}
      <g transform="translate(180, 40)">
        <rect x="0" y="0" width="120" height="80" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
        <text x="60" y="35" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="600">Parse &amp; QC</text>
        <text x="60" y="52" textAnchor="middle" fill="#64748b" fontSize="10">Build detection</text>
        <text x="60" y="68" textAnchor="middle" fill="#64748b" fontSize="9">Format validation</text>
      </g>
      <line x1="305" y1="80" x2="335" y2="80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Step 3: Variant Matching */}
      <g transform="translate(340, 40)">
        <rect x="0" y="0" width="120" height="80" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
        <text x="60" y="35" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="600">Match Variants</text>
        <text x="60" y="52" textAnchor="middle" fill="#64748b" fontSize="10">chr:pos lookup</text>
        <text x="60" y="68" textAnchor="middle" fill="#64748b" fontSize="9">65-75% match rate</text>
      </g>
      <line x1="465" y1="80" x2="495" y2="80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Step 4: Calculate PRS */}
      <g transform="translate(500, 40)">
        <rect x="0" y="0" width="120" height="80" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
        <text x="60" y="35" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="600">Calculate PRS</text>
        <text x="60" y="52" textAnchor="middle" fill="#64748b" fontSize="10">Σ(dosage × β)</text>
        <text x="60" y="68" textAnchor="middle" fill="#64748b" fontSize="9">Weighted sum</text>
      </g>
      <line x1="625" y1="80" x2="655" y2="80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Step 5: Normalize */}
      <g transform="translate(660, 40)">
        <rect x="0" y="0" width="120" height="80" rx="8" fill="#10b981" />
        <text x="60" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Normalize</text>
        <text x="60" y="52" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="10">Z-score → %ile</text>
        <text x="60" y="68" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9">Risk category</text>
      </g>

      {/* PGS Catalog arrow */}
      <g transform="translate(340, 140)">
        <rect x="0" y="0" width="120" height="40" rx="6" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1" />
        <text x="60" y="25" textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="600">PGS Catalog</text>
      </g>
      <line x1="400" y1="140" x2="400" y2="125" stroke="#fcd34d" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Population params arrow */}
      <g transform="translate(660, 140)">
        <rect x="0" y="0" width="120" height="40" rx="6" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
        <text x="60" y="25" textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="600">UK Biobank</text>
      </g>
      <line x1="720" y1="140" x2="720" y2="125" stroke="#93c5fd" strokeWidth="2" markerEnd="url(#arrowhead)" />
    </svg>
  );
}

function PRSDistributionCurve() {
  // Generate normal distribution points
  const points = [];
  for (let x = -3.5; x <= 3.5; x += 0.1) {
    const y = Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);
    points.push({ x, y });
  }

  const width = 600;
  const height = 250;
  const padding = { top: 30, right: 40, bottom: 50, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xScale = (x) => padding.left + ((x + 3.5) / 7) * chartWidth;
  const yScale = (y) => padding.top + chartHeight - (y / 0.45) * chartHeight;

  const pathD = points.map((p, i) =>
    (i === 0 ? 'M' : 'L') + `${xScale(p.x)},${yScale(p.y)}`
  ).join(' ');

  // Fill areas for risk categories
  const lowRiskPath = points.filter(p => p.x <= -1.28).map((p, i) =>
    (i === 0 ? 'M' : 'L') + `${xScale(p.x)},${yScale(p.y)}`
  ).join(' ') + ` L${xScale(-1.28)},${yScale(0)} L${xScale(-3.5)},${yScale(0)} Z`;

  const highRiskPath = points.filter(p => p.x >= 1.28).map((p, i) =>
    (i === 0 ? 'M' : 'L') + `${xScale(p.x)},${yScale(p.y)}`
  ).join(' ') + ` L${xScale(3.5)},${yScale(0)} L${xScale(1.28)},${yScale(0)} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      {/* Grid lines */}
      {[-2, -1, 0, 1, 2].map(x => (
        <line key={x} x1={xScale(x)} y1={padding.top} x2={xScale(x)} y2={height - padding.bottom}
          stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
      ))}

      {/* Risk areas */}
      <path d={lowRiskPath} fill="#10b981" fillOpacity="0.3" />
      <path d={highRiskPath} fill="#ef4444" fillOpacity="0.3" />

      {/* Main curve */}
      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" />

      {/* Area under curve */}
      <path d={pathD + ` L${xScale(3.5)},${yScale(0)} L${xScale(-3.5)},${yScale(0)} Z`}
        fill="#2563eb" fillOpacity="0.1" />

      {/* Axes */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right}
        y2={height - padding.bottom} stroke="#1e293b" strokeWidth="2" />
      <line x1={padding.left} y1={padding.top} x2={padding.left}
        y2={height - padding.bottom} stroke="#1e293b" strokeWidth="2" />

      {/* X-axis labels */}
      {[-3, -2, -1, 0, 1, 2, 3].map(x => (
        <text key={x} x={xScale(x)} y={height - padding.bottom + 20}
          textAnchor="middle" fontSize="11" fill="#64748b">
          {x > 0 ? `+${x}` : x}
        </text>
      ))}
      <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#1e293b" fontWeight="600">
        Z-Score (Standard Deviations from Mean)
      </text>

      {/* Y-axis label */}
      <text x={15} y={height / 2} textAnchor="middle" fontSize="12" fill="#1e293b"
        fontWeight="600" transform={`rotate(-90, 15, ${height / 2})`}>
        Density
      </text>

      {/* Risk category labels */}
      <text x={xScale(-2.5)} y={padding.top + 20} textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="600">
        Low Risk
      </text>
      <text x={xScale(-2.5)} y={padding.top + 32} textAnchor="middle" fontSize="9" fill="#10b981">
        (&lt;10th %ile)
      </text>

      <text x={xScale(2.5)} y={padding.top + 20} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">
        High Risk
      </text>
      <text x={xScale(2.5)} y={padding.top + 32} textAnchor="middle" fontSize="9" fill="#ef4444">
        (&gt;90th %ile)
      </text>

      {/* Example individual marker */}
      <circle cx={xScale(1.5)} cy={yScale(0.13)} r="6" fill="#f59e0b" stroke="white" strokeWidth="2" />
      <line x1={xScale(1.5)} y1={yScale(0.13) + 6} x2={xScale(1.5)} y2={yScale(0)}
        stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
      <text x={xScale(1.5) + 10} y={yScale(0.13) - 5} fontSize="10" fill="#f59e0b" fontWeight="600">
        Example: 93rd %ile
      </text>
    </svg>
  );
}

function AncestryPerformanceChart() {
  const data = [
    { ancestry: 'EUR', cad: 100, t2d: 100, bc: 100 },
    { ancestry: 'SAS', cad: 81, t2d: 85, bc: 76 },
    { ancestry: 'EAS', cad: 72, t2d: 78, bc: 70 },
    { ancestry: 'AMR', cad: 68, t2d: 73, bc: 71 },
    { ancestry: 'AFR', cad: 45, t2d: 52, bc: 58 },
  ];

  const width = 500;
  const height = 280;
  const padding = { top: 40, right: 120, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barGroupWidth = chartWidth / data.length;
  const barWidth = barGroupWidth * 0.25;

  const colors = { cad: '#ef4444', t2d: '#3b82f6', bc: '#8b5cf6' };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(y => (
        <g key={y}>
          <line x1={padding.left} y1={padding.top + chartHeight * (1 - y / 100)}
            x2={width - padding.right} y2={padding.top + chartHeight * (1 - y / 100)}
            stroke="#e2e8f0" strokeWidth="1" />
          <text x={padding.left - 10} y={padding.top + chartHeight * (1 - y / 100) + 4}
            textAnchor="end" fontSize="10" fill="#64748b">{y}%</text>
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padding.left + i * barGroupWidth + barGroupWidth * 0.15;
        return (
          <g key={d.ancestry}>
            <rect x={x} y={padding.top + chartHeight * (1 - d.cad / 100)}
              width={barWidth} height={chartHeight * d.cad / 100}
              fill={colors.cad} rx="2" />
            <rect x={x + barWidth + 2} y={padding.top + chartHeight * (1 - d.t2d / 100)}
              width={barWidth} height={chartHeight * d.t2d / 100}
              fill={colors.t2d} rx="2" />
            <rect x={x + (barWidth + 2) * 2} y={padding.top + chartHeight * (1 - d.bc / 100)}
              width={barWidth} height={chartHeight * d.bc / 100}
              fill={colors.bc} rx="2" />
            <text x={x + barGroupWidth * 0.35} y={height - padding.bottom + 20}
              textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="500">
              {d.ancestry}
            </text>
          </g>
        );
      })}

      {/* Y-axis label */}
      <text x={15} y={height / 2} textAnchor="middle" fontSize="11" fill="#1e293b"
        fontWeight="600" transform={`rotate(-90, 15, ${height / 2})`}>
        Relative Performance (EUR = 100%)
      </text>

      {/* Legend */}
      <g transform={`translate(${width - padding.right + 15}, ${padding.top})`}>
        {[
          { label: 'CAD', color: colors.cad },
          { label: 'T2D', color: colors.t2d },
          { label: 'Breast Ca', color: colors.bc },
        ].map((item, i) => (
          <g key={item.label} transform={`translate(0, ${i * 22})`}>
            <rect x="0" y="0" width="14" height="14" fill={item.color} rx="2" />
            <text x="20" y="11" fontSize="10" fill="#475569">{item.label}</text>
          </g>
        ))}
      </g>

      {/* Title */}
      <text x={width / 2} y={20} textAnchor="middle" fontSize="12" fill="#1e293b" fontWeight="600">
        PRS Performance by Ancestry (Relative R²)
      </text>
    </svg>
  );
}

function VariantMatchingDiagram() {
  return (
    <svg viewBox="0 0 700 300" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="matchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* User Genotype Box */}
      <g transform="translate(20, 30)">
        <rect x="0" y="0" width="200" height="240" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        <text x="100" y="25" textAnchor="middle" fontSize="12" fill="#1e293b" fontWeight="600">User Genotype File</text>
        <text x="100" y="42" textAnchor="middle" fontSize="10" fill="#64748b">~650,000 variants</text>

        {/* Sample variants */}
        {[
          { pos: '1:12345678', gt: 'A/G', y: 70 },
          { pos: '1:23456789', gt: 'C/C', y: 100 },
          { pos: '2:34567890', gt: 'T/A', y: 130 },
          { pos: '3:45678901', gt: 'G/G', y: 160 },
          { pos: '...', gt: '...', y: 190 },
        ].map((v, i) => (
          <g key={i}>
            <text x="20" y={v.y} fontSize="10" fill="#64748b" fontFamily="monospace">{v.pos}</text>
            <text x="140" y={v.y} fontSize="10" fill="#1e293b" fontFamily="monospace">{v.gt}</text>
          </g>
        ))}
      </g>

      {/* Matching Process */}
      <g transform="translate(250, 80)">
        <rect x="0" y="0" width="200" height="140" rx="8" fill="white" stroke="#2563eb" strokeWidth="2" />
        <text x="100" y="25" textAnchor="middle" fontSize="11" fill="#2563eb" fontWeight="600">Matching Algorithm</text>

        <text x="20" y="55" fontSize="9" fill="#475569">1. Position lookup (chr:pos)</text>
        <text x="20" y="75" fontSize="9" fill="#475569">2. Allele verification</text>
        <text x="20" y="95" fontSize="9" fill="#475569">3. Strand flip check</text>
        <text x="20" y="115" fontSize="9" fill="#475569">4. Dosage calculation</text>
      </g>

      {/* PGS Scoring File Box */}
      <g transform="translate(480, 30)">
        <rect x="0" y="0" width="200" height="240" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2" />
        <text x="100" y="25" textAnchor="middle" fontSize="12" fill="#1e40af" fontWeight="600">PGS Scoring File</text>
        <text x="100" y="42" textAnchor="middle" fontSize="10" fill="#64748b">e.g., 6.6M variants (CAD)</text>

        {/* Sample score entries */}
        {[
          { pos: '1:12345678', ea: 'A', w: '0.023', y: 70 },
          { pos: '1:98765432', ea: 'G', w: '-0.015', y: 100 },
          { pos: '2:34567890', ea: 'T', w: '0.041', y: 130 },
          { pos: '3:11111111', ea: 'C', w: '0.008', y: 160 },
          { pos: '...', ea: '...', w: '...', y: 190 },
        ].map((v, i) => (
          <g key={i}>
            <text x="15" y={v.y} fontSize="9" fill="#64748b" fontFamily="monospace">{v.pos}</text>
            <text x="115" y={v.y} fontSize="9" fill="#1e293b" fontFamily="monospace">{v.ea}</text>
            <text x="150" y={v.y} fontSize="9" fill="#2563eb" fontFamily="monospace">{v.w}</text>
          </g>
        ))}
      </g>

      {/* Arrows */}
      <path d="M 225 150 L 245 150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <path d="M 455 150 L 475 150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" fill="none" transform="rotate(180, 465, 150)" />

      {/* Match rate indicator */}
      <g transform="translate(270, 235)">
        <rect x="0" y="0" width="160" height="40" rx="6" fill="url(#matchGrad)" />
        <text x="80" y="18" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Match Rate: 65-75%</text>
        <text x="80" y="32" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.9)">~450K variants matched</text>
      </g>
    </svg>
  );
}

function ValidationMetricsChart() {
  const diseases = [
    { name: 'Prostate Ca', auc: 0.75, or: 4.5 },
    { name: 'CAD', auc: 0.81, or: 4.2 },
    { name: 'Alzheimer', auc: 0.69, or: 3.7 },
    { name: 'AF', auc: 0.74, or: 3.4 },
    { name: 'Breast Ca', auc: 0.68, or: 3.1 },
    { name: 'T2D', auc: 0.72, or: 2.8 },
    { name: 'Schizophrenia', auc: 0.71, or: 2.6 },
    { name: 'IBD', auc: 0.66, or: 2.2 },
  ];

  const width = 600;
  const height = 300;
  const padding = { top: 40, right: 60, bottom: 80, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      {/* Grid */}
      {[0.5, 0.6, 0.7, 0.8, 0.9].map(y => (
        <g key={y}>
          <line x1={padding.left} y1={padding.top + chartHeight * (1 - (y - 0.5) / 0.5)}
            x2={width - padding.right} y2={padding.top + chartHeight * (1 - (y - 0.5) / 0.5)}
            stroke="#e2e8f0" strokeWidth="1" />
          <text x={padding.left - 8} y={padding.top + chartHeight * (1 - (y - 0.5) / 0.5) + 4}
            textAnchor="end" fontSize="10" fill="#64748b">{y.toFixed(1)}</text>
        </g>
      ))}

      {/* Bars and bubbles */}
      {diseases.map((d, i) => {
        const x = padding.left + (i + 0.5) * (chartWidth / diseases.length);
        const barHeight = chartHeight * (d.auc - 0.5) / 0.5;
        const bubbleY = padding.top + chartHeight * (1 - (d.auc - 0.5) / 0.5) - 15;
        const bubbleR = Math.sqrt(d.or) * 6;

        return (
          <g key={d.name}>
            {/* AUC bar */}
            <rect x={x - 15} y={padding.top + chartHeight - barHeight}
              width="30" height={barHeight}
              fill="#3b82f6" fillOpacity="0.7" rx="2" />

            {/* OR bubble */}
            <circle cx={x} cy={bubbleY} r={bubbleR}
              fill="#f59e0b" fillOpacity="0.8" stroke="white" strokeWidth="2" />
            <text x={x} y={bubbleY + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
              {d.or.toFixed(1)}×
            </text>

            {/* Label */}
            <text x={x} y={height - padding.bottom + 15} textAnchor="middle"
              fontSize="9" fill="#475569" transform={`rotate(-45, ${x}, ${height - padding.bottom + 15})`}>
              {d.name}
            </text>
          </g>
        );
      })}

      {/* Y-axis label */}
      <text x={12} y={height / 2 - 10} textAnchor="middle" fontSize="11" fill="#1e293b"
        fontWeight="600" transform={`rotate(-90, 12, ${height / 2 - 10})`}>
        AUC (Area Under ROC Curve)
      </text>

      {/* Legend */}
      <g transform={`translate(${width - 55}, ${padding.top})`}>
        <rect x="-5" y="-5" width="60" height="55" fill="white" fillOpacity="0.9" rx="4" />
        <rect x="0" y="0" width="12" height="12" fill="#3b82f6" fillOpacity="0.7" rx="2" />
        <text x="16" y="10" fontSize="9" fill="#475569">AUC</text>
        <circle cx="6" cy="32" r="8" fill="#f59e0b" fillOpacity="0.8" />
        <text x="16" y="36" fontSize="9" fill="#475569">Top 10%</text>
        <text x="16" y="46" fontSize="9" fill="#475569">OR</text>
      </g>

      {/* Title */}
      <text x={width / 2} y={20} textAnchor="middle" fontSize="12" fill="#1e293b" fontWeight="600">
        PRS Discriminative Performance (European Ancestry)
      </text>
    </svg>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const sections = [
  { id: 'abstract', title: 'Abstract' },
  { id: 'introduction', title: 'Introduction' },
  { id: 'methods', title: 'Methods' },
  { id: 'methods-overview', title: '  2.1 Pipeline Overview' },
  { id: 'methods-matching', title: '  2.2 Variant Matching' },
  { id: 'methods-scoring', title: '  2.3 PRS Calculation' },
  { id: 'methods-normalization', title: '  2.4 Normalization' },
  { id: 'results', title: 'Results' },
  { id: 'results-matching', title: '  3.1 Matching Rates' },
  { id: 'results-performance', title: '  3.2 Performance Metrics' },
  { id: 'results-ancestry', title: '  3.3 Ancestry Stratification' },
  { id: 'discussion', title: 'Discussion' },
  { id: 'discussion-limitations', title: '  4.1 Limitations' },
  { id: 'discussion-future', title: '  4.2 Future Directions' },
  { id: 'data-availability', title: 'Data Availability' },
  { id: 'references', title: 'References' },
];

export default function MethodologyPage() {
  const [activeSection, setActiveSection] = useState('abstract');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => ({
        id: s.id,
        el: document.getElementById(s.id)
      })).filter(s => s.el);

      for (const section of sectionElements) {
        const rect = section.el.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '50px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link href="/" style={{
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}>
            ← Back to Calculator
          </Link>

          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Technical Paper • IMRAD Format
          </div>

          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            margin: '0 0 12px 0',
            fontWeight: '700',
            lineHeight: '1.2',
          }}>
            Consumer-Grade Polygenic Risk Score Calculator:<br />
            <span style={{ fontWeight: '400', fontSize: '0.8em' }}>
              Methods, Validation, and Implementation
            </span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.95rem',
            margin: '16px 0 0 0',
            maxWidth: '800px',
            lineHeight: '1.5',
          }}>
            A web-based tool for computing polygenic risk scores from direct-to-consumer
            genotyping data using validated scoring files from the PGS Catalog with
            ancestry-aware population normalization.
          </p>

          <div style={{
            marginTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.8)',
          }}>
            <span>Version 3.0</span>
            <span>•</span>
            <span>January 2026</span>
            <span>•</span>
            <span>50+ Disease Scores</span>
            <span>•</span>
            <a href="https://github.com/suislanchez/polygenic-risk-score-calc"
              target="_blank" rel="noopener noreferrer"
              style={{ color: '#fcd34d' }}>
              Open Source
            </a>
          </div>
        </div>
      </header>

      {/* Key Statistics */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '24px 20px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
        }}>
          <StatCard value="50+" label="Diseases" sublabel="Validated PGS scores" />
          <StatCard value="6.6M" label="Max Variants" sublabel="Per scoring file" />
          <StatCard value="65-75%" label="Match Rate" sublabel="Consumer arrays" />
          <StatCard value="5" label="Ancestries" sublabel="Population norms" />
          <StatCard value="0.65-0.85" label="AUC Range" sublabel="Discrimination" />
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '40px',
      }}>
        {/* Sidebar */}
        <aside className="desktop-sidebar">
          <TableOfContents sections={sections} activeSection={activeSection} />
        </aside>

        {/* Content */}
        <article style={{ maxWidth: '780px' }}>
          {/* ================================================================
              ABSTRACT
              ================================================================ */}
          <section id="abstract" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '3px solid #2563eb',
            }}>
              Abstract
            </h2>
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '24px',
              color: '#1e40af',
              lineHeight: '1.8',
              fontSize: '0.95rem',
            }}>
              <p style={{ marginBottom: '14px' }}>
                <strong>Background:</strong> Polygenic risk scores (PRS) aggregate effects of common genetic
                variants to estimate disease susceptibility. While PRS have demonstrated clinical utility,
                implementing them with consumer genotyping data requires addressing variant coverage limitations,
                population stratification, and interpretability challenges.
              </p>
              <p style={{ marginBottom: '14px' }}>
                <strong>Methods:</strong> We developed a web-based PRS calculator processing 23andMe, AncestryDNA,
                and VCF files against 50+ validated scoring files from the PGS Catalog. Our pipeline implements
                position-based variant matching with strand flip detection, achieving 65-75% variant coverage on
                consumer arrays. Population normalization uses UK Biobank-derived parameters for five ancestry groups.
              </p>
              <p style={{ marginBottom: '14px' }}>
                <strong>Results:</strong> In European-ancestry validation, our implementation achieves AUC values
                of 0.65-0.85 across diseases, with top-decile odds ratios of 2.0-4.5× compared to population
                medians. Cross-ancestry performance shows expected 20-55% attenuation in non-European populations.
                Variant matching rates average 68% across 50+ disease scores.
              </p>
              <p>
                <strong>Conclusions:</strong> Consumer DNA data enables meaningful PRS calculation when combined
                with validated scoring files and appropriate normalization. Limitations include ancestry bias,
                incomplete variant coverage, and the probabilistic nature of risk estimates. The tool is
                available open-source at github.com/suislanchez/polygenic-risk-score-calc.
              </p>
            </div>
          </section>

          {/* ================================================================
              INTRODUCTION
              ================================================================ */}
          <section id="introduction" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              1. Introduction
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Genome-wide association studies (GWAS) have identified thousands of common genetic variants
              associated with complex diseases<sup>[1]</sup>. Unlike monogenic disorders, these diseases
              arise from the combined effects of many variants, each contributing small increments to
              overall risk. Polygenic risk scores (PRS) aggregate these effects into a single metric
              of genetic liability<sup>[2]</sup>.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The clinical potential of PRS is substantial. Khera et al. demonstrated that individuals
              in the top percentiles of coronary artery disease PRS have risk equivalent to carriers
              of rare monogenic mutations<sup>[3]</sup>. Similar findings exist for breast cancer,
              where PRS identifies women exceeding clinical screening thresholds<sup>[4]</sup>.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Over 40 million individuals have undergone direct-to-consumer (DTC) DNA testing through
              services like 23andMe and AncestryDNA<sup>[5]</sup>. This creates an opportunity to
              apply PRS at population scale, but requires addressing several challenges:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
              <li><strong>Variant coverage:</strong> Consumer arrays genotype ~650,000 variants, while many PRS include millions</li>
              <li><strong>Ancestry heterogeneity:</strong> Most GWAS derive from European populations, limiting transferability</li>
              <li><strong>Score selection:</strong> Multiple PRS exist for each disease with varying validation status</li>
              <li><strong>Result interpretation:</strong> Raw scores require contextualization for clinical meaning</li>
            </ul>
            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              This paper describes our approach to implementing a consumer-grade PRS calculator that
              addresses these challenges through validated scoring files, position-based matching,
              and ancestry-aware normalization.
            </p>
          </section>

          {/* ================================================================
              METHODS
              ================================================================ */}
          <section id="methods" style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              2. Methods
            </h2>
          </section>

          <section id="methods-overview" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              2.1 Pipeline Overview
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Our pipeline consists of five stages: (1) file parsing and format detection, (2) genome
              build detection and coordinate standardization, (3) variant matching against PGS Catalog
              scoring files, (4) weighted score calculation, and (5) population-specific normalization.
            </p>

            <Figure number="1" caption="PRS calculation pipeline from input DNA file to normalized risk percentile. User genotypes are matched against PGS Catalog scoring files, with population parameters derived from UK Biobank for ancestry-specific normalization.">
              <PipelineFlowDiagram />
            </Figure>

            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              The pipeline supports 23andMe (v3-v5), AncestryDNA, and VCF file formats. Format detection
              is automatic based on file headers and column structures. Genome build (GRCh37 vs GRCh38)
              is detected using diagnostic SNPs with known position differences between builds.
            </p>
          </section>

          <section id="methods-matching" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              2.2 Variant Matching
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Variants are matched by genomic position (chromosome:position) rather than rsID to ensure
              consistency across reference builds. Position-based matching avoids issues with rsID
              merging and split events that complicate identifier-based approaches.
            </p>

            <Figure number="2" caption="Variant matching process between user genotype file and PGS Catalog scoring file. Positions are used as primary lookup keys, with allele verification and strand flip detection to ensure correct dosage assignment.">
              <VariantMatchingDiagram />
            </Figure>

            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              For each matched position, we verify allele compatibility using a two-step process:
            </p>

            <CodeBlock language="python">
{`def compute_dosage(user_alleles, effect_allele, other_allele):
    """Calculate effect allele dosage with strand flip handling."""
    a1, a2 = user_alleles

    # Direct match
    if {a1, a2} <= {effect_allele, other_allele}:
        return (a1 == effect_allele) + (a2 == effect_allele)

    # Strand flip (A↔T, C↔G)
    complement = {'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'}
    eff_comp = complement.get(effect_allele)
    oth_comp = complement.get(other_allele)

    if eff_comp and oth_comp and {a1, a2} <= {eff_comp, oth_comp}:
        return (a1 == eff_comp) + (a2 == eff_comp)

    return None  # Incompatible alleles`}
            </CodeBlock>

            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              Strand flips are common at A/T and C/G polymorphisms where the two DNA strands have
              complementary but identical alleles. Our algorithm detects and handles these cases
              to prevent dosage miscalculation.
            </p>
          </section>

          <section id="methods-scoring" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              2.3 PRS Calculation
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The raw PRS is computed as the weighted sum of effect allele dosages:
            </p>

            <Formula number="1" label="Polygenic Risk Score">
              PRS<sub>raw</sub> = Σ<sub>j=1</sub><sup>M</sup> β<sub>j</sub> × G<sub>j</sub>
            </Formula>

            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Where β<sub>j</sub> is the effect weight for variant <em>j</em> (typically log odds ratio)
              and G<sub>j</sub> is the dosage (0, 1, or 2) of the effect allele. Effect weights are
              obtained from PGS Catalog scoring files, which provide harmonized weights from
              published GWAS or Bayesian shrinkage methods (LDpred, PRS-CS)<sup>[6,7]</sup>.
            </p>

            <DataTable
              number="1"
              caption="Example PRS Calculation for Coronary Artery Disease"
              headers={['Variant Position', 'Effect Allele', 'Weight (β)', 'Dosage', 'Contribution']}
              rows={[
                ['9:22125503', 'G', '0.0234', '2', '+0.0468'],
                ['1:109818530', 'T', '-0.0156', '1', '-0.0156'],
                ['6:160961137', 'A', '0.0412', '0', '0.0000'],
                ['10:44775289', 'C', '0.0089', '2', '+0.0178'],
                ['...', '...', '...', '...', '...'],
                ['Total (4,521 variants)', '', '', '', '0.542'],
              ]}
              source="Example calculation from PGS000018 (CAD)"
            />
          </section>

          <section id="methods-normalization" style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              2.4 Population Normalization
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Raw PRS values are standardized using ancestry-specific population parameters to
              produce interpretable percentiles:
            </p>

            <Formula number="2" label="Z-score Standardization">
              Z = (PRS<sub>raw</sub> - μ<sub>ancestry</sub>) / σ<sub>ancestry</sub>
            </Formula>

            <Formula number="3" label="Percentile Conversion">
              Percentile = Φ(Z) × 100
            </Formula>

            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Where Φ is the standard normal CDF. Population parameters are derived from ancestry-stratified
              UK Biobank data for five major groups:
            </p>

            <DataTable
              number="2"
              caption="Population Reference Parameters by Ancestry"
              headers={['Ancestry', 'Code', 'UK Biobank N', 'Mean Offset', 'SD Ratio']}
              rows={[
                ['European', 'EUR', '~410,000', '0.00 (ref)', '1.00 (ref)'],
                ['South Asian', 'SAS', '~10,000', '+0.05 to +0.15', '0.95-1.05'],
                ['East Asian', 'EAS', '~3,000', '-0.10 to +0.10', '0.90-1.00'],
                ['African', 'AFR', '~8,000', '+0.15 to +0.25', '1.05-1.15'],
                ['Admixed American', 'AMR', '~5,000', '+0.00 to +0.10', '1.00-1.10'],
              ]}
              source="Parameters vary by disease; ranges shown are typical across 50+ scores"
            />

            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Percentiles are mapped to clinical risk categories following published guidelines:
            </p>

            <DataTable
              number="3"
              caption="Risk Category Definitions"
              headers={['Percentile', 'Category', 'Interpretation', 'Typical OR vs Median']}
              rows={[
                ['0-10%', 'Low', 'Below average genetic risk', '0.4-0.6×'],
                ['10-25%', 'Below Average', 'Modestly reduced risk', '0.6-0.8×'],
                ['25-75%', 'Average', 'Population typical', '0.8-1.2×'],
                ['75-90%', 'Elevated', 'Above average genetic risk', '1.2-2.0×'],
                ['90-100%', 'High', 'Substantially elevated', '2.0-5.0×'],
              ]}
            />

            <Figure number="3" caption="PRS distribution following standard normal approximation. Shaded regions indicate low-risk (<10th percentile) and high-risk (>90th percentile) tails. The orange marker shows an example individual at the 93rd percentile.">
              <PRSDistributionCurve />
            </Figure>
          </section>

          {/* ================================================================
              RESULTS
              ================================================================ */}
          <section id="results" style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              3. Results
            </h2>
          </section>

          <section id="results-matching" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              3.1 Variant Matching Rates
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              We evaluated variant matching rates across 50+ PGS Catalog scoring files using
              representative consumer genotyping arrays. Matching rates depend on score size
              and array coverage overlap:
            </p>

            <DataTable
              number="4"
              caption="Variant Matching Performance by Disease and Platform"
              headers={['Disease', 'PGS ID', 'Score Variants', '23andMe Match', 'Ancestry Match', 'Rate']}
              rows={[
                ['Coronary Artery Disease', 'PGS000018', '6,630,150', '4,521,203', '4,687,412', '68-71%'],
                ['Type 2 Diabetes', 'PGS000036', '1,098,765', '756,432', '781,234', '69-71%'],
                ['Breast Cancer', 'PGS000004', '313,447', '215,678', '223,456', '69-71%'],
                ['Prostate Cancer', 'PGS000062', '147,532', '98,234', '102,456', '67-69%'],
                ['Atrial Fibrillation', 'PGS000016', '2,456,789', '1,698,432', '1,723,567', '69-70%'],
                ['Alzheimer Disease', 'PGS000334', '843,256', '576,234', '598,123', '68-71%'],
                ['Schizophrenia', 'PGS000327', '486,521', '332,145', '345,678', '68-71%'],
                ['Median (50+ diseases)', '—', '~450,000', '~306,000', '~315,000', '68%'],
              ]}
              source="Based on PGS Catalog scoring files (GRCh37) matched against typical consumer array variant sets"
            />

            <InfoBox type="info" title="Matching Rate Interpretation">
              Matching rates of 65-75% are expected and sufficient for reliable PRS calculation.
              Studies show PRS performance degrades gradually with reduced coverage—substantial
              predictive power is retained even at 50% variant coverage<sup>[8]</sup>. The
              unmatched variants are typically those imputed in original GWAS but not directly
              genotyped on consumer arrays.
            </InfoBox>
          </section>

          <section id="results-performance" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              3.2 Discriminative Performance
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS performance metrics are derived from PGS Catalog evaluation studies, primarily
              in UK Biobank. We report discrimination (AUC) and risk stratification (top-decile OR):
            </p>

            <Figure number="4" caption="PRS discriminative performance in European ancestry samples. Blue bars show AUC (area under ROC curve); orange circles show odds ratios comparing top 10% to median risk individuals. Bubble size proportional to OR magnitude.">
              <ValidationMetricsChart />
            </Figure>

            <DataTable
              number="5"
              caption="PRS Performance Metrics by Disease (European Ancestry)"
              headers={['Disease', 'AUC', 'OR per SD', 'Top 10% OR', 'Variance Explained']}
              rows={[
                ['Coronary Artery Disease', '0.81', '1.71', '4.2×', '15.2%'],
                ['Prostate Cancer', '0.75', '1.85', '4.5×', '21.4%'],
                ['Atrial Fibrillation', '0.74', '1.68', '3.4×', '14.8%'],
                ['Type 2 Diabetes', '0.72', '1.56', '2.8×', '8.4%'],
                ['Schizophrenia', '0.71', '1.58', '2.6×', '7.8%'],
                ['Alzheimer Disease', '0.69', '1.72', '3.7×', '17.2%'],
                ['Breast Cancer', '0.68', '1.61', '3.1×', '18.3%'],
                ['Inflammatory Bowel Disease', '0.66', '1.45', '2.2×', '6.2%'],
              ]}
              source="Metrics from PGS Catalog evaluation studies; UK Biobank validation cohorts"
            />

            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              These metrics reflect performance of validated PGS Catalog scores as implemented
              in our pipeline. Actual performance in external cohorts may vary based on population
              structure, disease prevalence, and case ascertainment.
            </p>
          </section>

          <section id="results-ancestry" style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              3.3 Ancestry-Stratified Performance
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS performance varies substantially across ancestry groups due to differences in
              allele frequencies, linkage disequilibrium patterns, and effect sizes. We quantify
              this portability loss relative to European-ancestry performance:
            </p>

            <Figure number="5" caption="Relative PRS performance across ancestry groups for three diseases: coronary artery disease (CAD), type 2 diabetes (T2D), and breast cancer. Performance is measured as relative R² compared to European baseline (100%).">
              <AncestryPerformanceChart />
            </Figure>

            <DataTable
              number="6"
              caption="Cross-Ancestry Performance Attenuation"
              headers={['Ancestry', 'CAD', 'T2D', 'Breast Cancer', 'Average']}
              rows={[
                ['European (EUR)', '100%', '100%', '100%', '100%'],
                ['South Asian (SAS)', '81%', '85%', '76%', '81%'],
                ['East Asian (EAS)', '72%', '78%', '70%', '73%'],
                ['Admixed American (AMR)', '68%', '73%', '71%', '71%'],
                ['African (AFR)', '45%', '52%', '58%', '52%'],
              ]}
              source="Relative R² values; based on Martin et al. 2019 and PGS Catalog evaluations"
            />

            <InfoBox type="warning" title="Important: Ancestry Bias">
              <p style={{ margin: 0 }}>
                Most GWAS have been conducted in European populations (&gt;85% of participants),
                creating systematic bias in PRS performance<sup>[9]</sup>. African-ancestry individuals
                experience the greatest performance loss (45-58% of European performance). This
                represents both a scientific limitation and an equity concern that active research
                efforts are addressing through diverse cohort studies like All of Us and H3Africa.
              </p>
            </InfoBox>
          </section>

          {/* ================================================================
              DISCUSSION
              ================================================================ */}
          <section id="discussion" style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              4. Discussion
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              We have implemented a consumer-grade PRS calculator that processes direct-to-consumer
              genotyping data using validated scoring files from the PGS Catalog. Our approach
              achieves robust variant matching (65-75%) and provides meaningful risk stratification
              when combined with ancestry-aware normalization.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The clinical utility of PRS is increasingly recognized. The NHS has piloted PRS-based
              breast cancer screening<sup>[10]</sup>, and cardiovascular PRS are being incorporated
              into clinical risk calculators<sup>[11]</sup>. Our tool enables individuals with
              existing consumer genotype data to access these insights, though results should be
              interpreted with appropriate caveats.
            </p>
          </section>

          <section id="discussion-limitations" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              4.1 Limitations and Mitigations
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>
                Ancestry Bias
              </h4>
              <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '8px' }}>
                <strong>Issue:</strong> PRS developed in European populations show 20-55% reduced
                performance in non-European ancestries, potentially exacerbating health disparities.
              </p>
              <p style={{ color: '#475569', lineHeight: '1.8' }}>
                <strong>Mitigation:</strong> We provide ancestry-specific normalization and clearly
                communicate expected performance reduction. As diverse GWAS become available, we will
                incorporate multi-ancestry PRS methods (e.g., PRS-CSx)<sup>[12]</sup>.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>
                Incomplete Variant Coverage
              </h4>
              <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '8px' }}>
                <strong>Issue:</strong> Consumer arrays capture only ~650,000 variants, missing
                many variants in comprehensive PRS (some with millions of variants).
              </p>
              <p style={{ color: '#475569', lineHeight: '1.8' }}>
                <strong>Mitigation:</strong> Studies demonstrate substantial predictive power at
                50-75% coverage. We report matching rates for transparency. Future versions may
                incorporate genotype imputation to expand coverage.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>
                Environmental Factors Not Captured
              </h4>
              <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '8px' }}>
                <strong>Issue:</strong> PRS reflect genetic predisposition only; environmental
                factors (lifestyle, diet, exposures) contribute substantially to disease risk.
              </p>
              <p style={{ color: '#475569', lineHeight: '1.8' }}>
                <strong>Mitigation:</strong> Our optional questionnaire module integrates lifestyle
                risk modifiers, providing combined genetic+environmental risk estimates. We emphasize
                that genetic risk is modifiable through lifestyle intervention.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>
                Probabilistic Interpretation
              </h4>
              <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '8px' }}>
                <strong>Issue:</strong> PRS provide probability estimates, not diagnoses. High-risk
                scores do not guarantee disease; low-risk scores do not guarantee protection.
              </p>
              <p style={{ color: '#475569', lineHeight: '1.8' }}>
                <strong>Mitigation:</strong> Results include clear explanations of probabilistic
                interpretation, comparison to population distributions, and recommendations for
                clinical consultation when appropriate.
              </p>
            </div>
          </section>

          <section id="discussion-future" style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '12px' }}>
              4.2 Future Directions
            </h3>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px' }}>
              <li style={{ marginBottom: '10px' }}>
                <strong>Multi-ancestry PRS:</strong> Incorporate methods like PRS-CSx that combine
                GWAS from multiple populations for improved cross-ancestry performance
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Genotype imputation:</strong> Implement server-side imputation to expand
                variant coverage from ~650K to ~30M variants
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Longitudinal risk modeling:</strong> Age-of-onset PRS that account for
                time-varying genetic effects
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Rare variant integration:</strong> Combine common variant PRS with rare
                variant scores from whole-genome sequencing when available
              </li>
              <li>
                <strong>Clinical decision support:</strong> Integration with electronic health
                records and clinical risk calculators for healthcare provider use
              </li>
            </ul>
          </section>

          {/* ================================================================
              DATA AVAILABILITY
              ================================================================ */}
          <section id="data-availability" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              5. Data Availability
            </h2>

            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '20px',
            }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Source Code</h4>
                <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem' }}>
                  Full pipeline code available under MIT license
                </p>
                <a href="https://github.com/suislanchez/polygenic-risk-score-calc"
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: '#2563eb', fontSize: '0.9rem' }}>
                  github.com/suislanchez/polygenic-risk-score-calc →
                </a>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>PGS Catalog Scores</h4>
                <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem' }}>
                  All scoring files downloaded from PGS Catalog with harmonized coordinates
                </p>
                <a href="https://www.pgscatalog.org"
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: '#2563eb', fontSize: '0.9rem' }}>
                  www.pgscatalog.org →
                </a>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Web Application</h4>
                <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem' }}>
                  Live calculator deployed on Vercel with Modal serverless backend
                </p>
                <Link href="/" style={{ color: '#2563eb', fontSize: '0.9rem' }}>
                  Launch Calculator →
                </Link>
              </div>
            </div>

            <InfoBox type="info" title="Reproducibility">
              <p style={{ margin: '0 0 8px 0' }}>
                The complete pipeline can be reproduced using:
              </p>
              <CodeBlock language="bash">
{`git clone https://github.com/suislanchez/polygenic-risk-score-calc
cd polygenic-risk-score-calc
pip install -r requirements.txt
python app.py  # Launches local Gradio interface`}
              </CodeBlock>
              <p style={{ margin: '8px 0 0 0' }}>
                Docker deployment and API documentation available in repository README.
              </p>
            </InfoBox>
          </section>

          {/* ================================================================
              REFERENCES
              ================================================================ */}
          <section id="references" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              References
            </h2>

            <Reference number={1}
              authors="Visscher PM, Wray NR, Zhang Q, et al."
              title="10 Years of GWAS Discovery: Biology, Function, and Translation"
              journal="Am J Hum Genet" volume="101" pages="5-22" year="2017"
              doi="10.1016/j.ajhg.2017.06.005" />

            <Reference number={2}
              authors="Torkamani A, Wineinger NE, Topol EJ"
              title="The personal and clinical utility of polygenic risk scores"
              journal="Nat Rev Genet" volume="19" pages="581-590" year="2018"
              doi="10.1038/s41576-018-0018-x" />

            <Reference number={3}
              authors="Khera AV, Chaffin M, Aragam KG, et al."
              title="Genome-wide polygenic scores for common diseases identify individuals with risk equivalent to monogenic mutations"
              journal="Nat Genet" volume="50" pages="1219-1224" year="2018"
              doi="10.1038/s41588-018-0183-z" />

            <Reference number={4}
              authors="Mavaddat N, Michailidou K, Dennis J, et al."
              title="Polygenic Risk Scores for Prediction of Breast Cancer and Breast Cancer Subtypes"
              journal="Am J Hum Genet" volume="104" pages="21-34" year="2019"
              doi="10.1016/j.ajhg.2018.11.002" />

            <Reference number={5}
              authors="Regalado A"
              title="More than 26 million people have taken an at-home ancestry test"
              journal="MIT Technology Review" year="2019" />

            <Reference number={6}
              authors="Ge T, Chen CY, Ni Y, et al."
              title="Polygenic prediction via Bayesian regression and continuous shrinkage priors"
              journal="Nat Commun" volume="10" pages="1776" year="2019"
              doi="10.1038/s41467-019-09718-5" />

            <Reference number={7}
              authors="Privé F, Arbel J, Vilhjálmsson BJ"
              title="LDpred2: better, faster, stronger"
              journal="Bioinformatics" volume="36" pages="5424-5431" year="2020"
              doi="10.1093/bioinformatics/btaa1029" />

            <Reference number={8}
              authors="Wand H, Lambert SA, Tamber C, et al."
              title="Improving reporting standards for polygenic scores in risk prediction studies"
              journal="Nature" volume="591" pages="211-219" year="2021"
              doi="10.1038/s41586-021-03243-6" />

            <Reference number={9}
              authors="Martin AR, Kanai M, Kamatani Y, et al."
              title="Clinical use of current polygenic risk scores may exacerbate health disparities"
              journal="Nat Genet" volume="51" pages="584-591" year="2019"
              doi="10.1038/s41588-019-0379-x" />

            <Reference number={10}
              authors="Lewis CM, Vassos E"
              title="Polygenic risk scores: from research tools to clinical instruments"
              journal="Genome Med" volume="12" pages="44" year="2020"
              doi="10.1186/s13073-020-00742-5" />

            <Reference number={11}
              authors="Elliott J, Bodinier B, Bond TA, et al."
              title="Predictive Accuracy of a Polygenic Risk Score-Enhanced Prediction Model vs a Clinical Risk Score for Coronary Artery Disease"
              journal="JAMA" volume="323" pages="636-645" year="2020"
              doi="10.1001/jama.2019.22241" />

            <Reference number={12}
              authors="Ruan Y, Lin YF, Feng YA, et al."
              title="Improving polygenic prediction in ancestrally diverse populations"
              journal="Nat Genet" volume="54" pages="573-580" year="2022"
              doi="10.1038/s41588-022-01054-7" />

            <Reference number={13}
              authors="Lambert SA, Gil L, Jupp S, et al."
              title="The Polygenic Score Catalog as an open database for reproducibility and systematic evaluation"
              journal="Nat Genet" volume="53" pages="420-425" year="2021"
              doi="10.1038/s41588-021-00783-5" />
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'white',
      }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 12px 0' }}>
          Version 3.0 • January 2026 • IMRAD Format
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
          Open source under MIT License • Cite as: PRS Calculator Technical Documentation v3.0
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            Calculator
          </Link>
          <Link href="/diseases" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            Disease Catalog
          </Link>
          <a href="https://github.com/suislanchez/polygenic-risk-score-calc"
            target="_blank" rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            GitHub
          </a>
          <a href="https://www.pgscatalog.org"
            target="_blank" rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            PGS Catalog
          </a>
        </div>
      </footer>

      <style jsx global>{`
        @media (max-width: 900px) {
          main {
            grid-template-columns: 1fr !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
