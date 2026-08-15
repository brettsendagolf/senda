import { describe, it, expect } from 'vitest'
import type { Mode, SkillId } from '@/types'
import { DRILLS } from '@/data/drills'
import { SKILLS, SYMPTOMS } from '@/data/skills'
import { CATEGORY_ORDER, CATEGORY_LABELS } from '@/data/labels'
import { CAPABILITY_ORDER } from '@/data/capabilities'
import { computeCoverage } from './coverage'

/**
 * Not really a test — a re-runnable coverage report. `npm run coverage` prints
 * which parts of the game the library can and can't serve. The one assertion
 * just keeps it a valid test file.
 */
const MODES: Mode[] = ['warmup', 'build', 'pressure', 'test', 'course']

function mark(count: number): string {
  return count === 0 ? '  ✗ none' : `  ✓ ${count}`
}

describe('drill library coverage', () => {
  it('prints the coverage report', () => {
    const report = computeCoverage(DRILLS, {
      categories: CATEGORY_ORDER,
      capabilities: CAPABILITY_ORDER,
      modes: MODES,
      skills: Object.keys(SKILLS) as SkillId[],
      symptoms: SYMPTOMS,
    })

    const lines: string[] = []
    lines.push('')
    lines.push('══════════════════════════════════════════════════')
    lines.push('  PRACTICE BOOK — DRILL LIBRARY COVERAGE')
    lines.push('══════════════════════════════════════════════════')
    lines.push(
      `  ${report.totals.all} drills · ${report.totals.generatable} generatable · ${report.totals.course} on-course`,
    )

    lines.push('\n  BY CATEGORY (generatable)')
    for (const c of report.categories)
      lines.push(`    ${CATEGORY_LABELS[c.key].padEnd(12)}${mark(c.count)}`)

    lines.push('\n  BY MODE (generatable; warm-up is the composed loosener)')
    for (const m of report.modes)
      lines.push(`    ${m.key.padEnd(12)}${mark(m.count)}`)

    lines.push('\n  BY SKILL (primary / any)')
    for (const s of report.skills) {
      const flag = s.primary === 0 ? (s.any === 0 ? '✗ absent' : '△ never primary') : '✓'
      lines.push(
        `    ${s.key.padEnd(18)} primary ${String(s.primary).padStart(2)}  ·  any ${String(s.any).padStart(2)}  ${flag}`,
      )
    }

    lines.push('\n  BY VENUE CAPABILITY (generatable)')
    for (const cap of report.capabilities)
      lines.push(`    ${cap.key.padEnd(14)}${mark(cap.count)}`)

    lines.push('\n  BY SYMPTOM (drills that match)')
    for (const s of report.symptoms)
      lines.push(`    ${s.served === 0 ? '✗' : '✓'} ${s.label}  (${s.served})`)

    lines.push('══════════════════════════════════════════════════\n')

    // eslint-disable-next-line no-console
    console.log(lines.join('\n'))

    expect(report.categories.length).toBe(CATEGORY_ORDER.length)
  })
})
