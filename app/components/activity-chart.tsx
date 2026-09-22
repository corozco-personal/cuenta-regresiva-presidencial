type Row = { day: string; users: number; pageviews: number; interactions: number };

const series = [
  { key: "users", label: "Visitantes", className: "chart-users" },
  { key: "pageviews", label: "Vistas", className: "chart-views" },
  { key: "interactions", label: "Interacciones", className: "chart-actions" },
] as const;

function niceMaximum(value: number) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude * 2) / 2 * magnitude;
}

export default function ActivityChart({ rows }: { rows: Row[] }) {
  const width = 960;
  const height = 390;
  const margin = { top: 24, right: 28, bottom: 64, left: 72 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maximum = niceMaximum(Math.max(1, ...rows.flatMap((row) => [row.users, row.pageviews, row.interactions])));
  const yTicks = Array.from({ length: 6 }, (_, index) => maximum / 5 * index);
  const x = (index: number) => rows.length === 1 ? margin.left + plotWidth / 2 : margin.left + index / (rows.length - 1) * plotWidth;
  const y = (value: number) => margin.top + plotHeight - value / maximum * plotHeight;
  const xTickIndexes = rows.length <= 6
    ? rows.map((_, index) => index)
    : Array.from(new Set(Array.from({ length: 6 }, (_, index) => Math.round(index * (rows.length - 1) / 5))));
  const dateLabel = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

  return (
    <figure className="activity-figure">
      <div className="chart-legend" aria-label="Leyenda de la gráfica">
        {series.map((item) => <span key={item.key}><i className={item.className} /> {item.label}</span>)}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="activity-svg-title activity-svg-description">
        <title id="activity-svg-title">Actividad diaria del sitio</title>
        <desc id="activity-svg-description">Gráfica de líneas que compara visitantes, páginas vistas e interacciones por fecha.</desc>
        <rect className="chart-frame" x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} />
        {yTicks.map((tick) => (
          <g key={tick}>
            <line className="chart-grid-line" x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} />
            <text className="chart-tick chart-y-tick" x={margin.left - 12} y={y(tick) + 4}>{numberLabel(tick)}</text>
          </g>
        ))}
        {xTickIndexes.map((index) => (
          <g key={rows[index].day}>
            <line className="chart-x-tick-mark" x1={x(index)} x2={x(index)} y1={margin.top + plotHeight} y2={margin.top + plotHeight + 6} />
            <text className="chart-tick chart-x-tick" x={x(index)} y={height - 37}>{dateLabel(rows[index].day)}</text>
          </g>
        ))}
        <text className="chart-axis-title" x={margin.left + plotWidth / 2} y={height - 5}>Fecha</text>
        <text className="chart-axis-title" transform={`translate(18 ${margin.top + plotHeight / 2}) rotate(-90)`}>Cantidad</text>
        {series.map((item) => {
          const points = rows.map((row, index) => `${x(index)},${y(Number(row[item.key]))}`).join(" ");
          return (
            <g className={item.className} key={item.key}>
              <polyline className="chart-series-line" points={points} />
              {rows.map((row, index) => <circle className="chart-series-point" key={row.day} cx={x(index)} cy={y(Number(row[item.key]))} r="4"><title>{dateLabel(row.day)} · {item.label}: {Number(row[item.key]).toLocaleString("es-CO")}</title></circle>)}
            </g>
          );
        })}
      </svg>
      <figcaption>Valores diarios dentro del periodo seleccionado.</figcaption>
    </figure>
  );
}

function numberLabel(value: number) {
  return Number.isInteger(value) ? value.toLocaleString("es-CO") : value.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}
