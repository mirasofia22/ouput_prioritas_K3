import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

Chart.defaults.font.family = "'Public Sans', system-ui, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#4A5A52';

// Padanan fungsi mk(id, type, labels, datasets, opts, fmt) di layout-2.html.
const KOSONG = {};

export default function ChartCanvas({ type, labels, datasets, options = KOSONG, fmt, tinggi, tall = false }) {
  const ref = useRef(null);
  const fmtRef = useRef(fmt);
  fmtRef.current = fmt;

  useEffect(() => {
    const satuSeri = datasets.length === 1 && type !== 'doughnut';
    const chart = new Chart(ref.current, {
      type,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options,
        plugins: {
          legend: { display: !satuSeri, position: 'bottom', labels: { boxWidth: 12 } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label || c.label}: ${fmtRef.current ? fmtRef.current(c.raw) : c.formattedValue}` } },
          ...(options.plugins || {}),
        },
      },
    });
    return () => chart.destroy();
  }, [type, labels, datasets, options]);

  return (
    <div className={tall ? 'ch t' : 'ch'} style={tinggi ? { height: tinggi } : undefined}>
      <canvas ref={ref} />
    </div>
  );
}
