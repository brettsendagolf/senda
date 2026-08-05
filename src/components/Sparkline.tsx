/**
 * Minimal inline SVG sparkline — no chart library. Draws the given values left
 * to right, scaled to fit. Flat/one-point series render as a baseline.
 */
export function Sparkline({
  values,
  width = 96,
  height = 28,
}: {
  values: number[]
  width?: number
  height?: number
}) {
  if (values.length === 0) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = 3
  const w = width - pad * 2
  const h = height - pad * 2

  const points = values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w
    const y = h - ((v - min) / span) * h
    return `${(x + pad).toFixed(1)},${(y + pad).toFixed(1)}`
  })

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1].split(',')[0]}
        cy={points[points.length - 1].split(',')[1]}
        r={2.5}
        fill="var(--color-accent)"
      />
    </svg>
  )
}
