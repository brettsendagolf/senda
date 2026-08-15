import { describe, it, expect } from 'vitest'
import type { Area, Round } from '@/types'
import {
  computeGameProfile,
  normaliseRound,
  benchAt,
  expectedPutts,
} from './diagnosis'

// Build a round; defaults are an 18-hole card you override per test.
function makeRound(p: Partial<Round>): Round {
  return {
    id: p.id ?? 'r',
    playedAt: '2026-08-15',
    holesPlayed: 18,
    par: 72,
    grossScore: 95,
    gir: 3.4,
    penalties: 3.8,
    putts: 33.9,
    upDownMade: 4,
    upDownAttempts: 25, // 16%
    fairwaysHit: 6,
    fairwaysPossible: 14,
    threePutts: 2,
    source: 'manual',
    createdAt: '2026-08-15',
    ...p,
  }
}

const area = (profile: ReturnType<typeof computeGameProfile>, a: Area) =>
  profile.areas.find((x) => x.area === a)!

// The §A5.5 averages, as five identical 18-hole rounds.
const WORKED = () =>
  Array.from({ length: 5 }, (_, i) =>
    makeRound({
      id: `w${i}`,
      grossScore: 95, // +23 to par
      gir: 3.4,
      penalties: 3.8,
      putts: 33.9,
      upDownMade: 4,
      upDownAttempts: 25,
    }),
  )

describe('diagnostic engine', () => {
  it('reproduces the §A5.5 worked example (test vector 1)', () => {
    const p = computeGameProfile({
      rounds: WORKED(),
      handicap: 20,
      handicapSource: 'whs',
      now: 'T',
    })
    // Shots lost vs scratch
    expect(area(p, 'app').shotsLostVsScratch!).toBeCloseTo(8.03, 1)
    expect(area(p, 'ott').shotsLostVsScratch!).toBeCloseTo(7.67, 1)
    expect(area(p, 'short').shotsLostVsScratch!).toBeCloseTo(2.49, 1)
    expect(area(p, 'putt').shotsLostVsScratch!).toBeCloseTo(3.98, 1)
    expect(p.totalShotsLostVsScratch!).toBeCloseTo(22.17, 1)
    // Recoverable, and the priority ranking that disagrees with volume
    expect(area(p, 'ott').recoverableShots!).toBeCloseTo(1.55, 1)
    expect(area(p, 'putt').recoverableShots!).toBeCloseTo(0.88, 1)
    expect(area(p, 'ott').rank).toBe(1) // priority = off the tee, not approach
    expect(p.confidence).toBe('medium') // weighted n = 5
  })

  it('normalises a 9-hole half-stats round to the same 18-hole round (vector 2)', () => {
    const eighteen = normaliseRound(makeRound({}))
    const nine = normaliseRound(
      makeRound({
        holesPlayed: 9,
        par: 36,
        grossScore: 47.5, // (47.5-36)*2 = 23 to par
        gir: 1.7,
        penalties: 1.9,
        putts: 16.95,
        upDownMade: 4,
        upDownAttempts: 25, // ratio unchanged
      }),
    )
    expect(nine.girN).toBeCloseTo(eighteen.girN, 5)
    expect(nine.penaltiesN).toBeCloseTo(eighteen.penaltiesN, 5)
    expect(nine.puttsN).toBeCloseTo(eighteen.puttsN, 5)
    expect(nine.scoreToPar).toBeCloseTo(eighteen.scoreToPar, 5)
    expect(nine.puttResidual).toBeCloseTo(eighteen.puttResidual, 5)
    expect(nine.roundWeight).toBe(0.5)

    // A single 9-hole round → 0.5 weighted rounds, low confidence, same priority.
    const p = computeGameProfile({
      rounds: [
        makeRound({
          holesPlayed: 9,
          par: 36,
          grossScore: 47.5,
          gir: 1.7,
          penalties: 1.9,
          putts: 16.95,
          upDownMade: 4,
          upDownAttempts: 25,
        }),
      ],
      handicap: 20,
      now: 'T',
    })
    expect(p.roundsUsed).toBe(0.5)
    expect(p.confidence).toBe('low')
    expect(area(p, 'ott').rank).toBe(1)
  })

  it('a scratch player at every benchmark has ~zero residuals (vector 3)', () => {
    const b = benchAt(0)
    const rounds = Array.from({ length: 20 }, (_, i) =>
      makeRound({
        id: `s${i}`,
        par: 72,
        grossScore: Math.round(72 + b.scoreToPar),
        gir: b.girHoles,
        penalties: b.pen,
        putts: b.putts,
        upDownMade: 47,
        upDownAttempts: 100, // 47%
      }),
    )
    const p = computeGameProfile({ rounds, handicap: 0, now: 'T' })
    expect(p.totalShotsLostVsScratch!).toBeCloseTo(0, 0)
    for (const a of p.areas) expect(Math.abs(a.z)).toBeLessThan(0.35)
    expect(p.confidence).toBe('good') // n = 20
  })

  it('rewards a poor ball-striker who putts well (vector 8)', () => {
    const n = normaliseRound(makeRound({ gir: 0, putts: 30 }))
    expect(n.puttResidual).toBeCloseTo(30 - expectedPutts(0), 5) // ≈ −4.78
    expect(n.puttResidual).toBeLessThan(-4)
  })

  it('flags the putting myth (vector 4)', () => {
    const gir = 3.06
    const putts = expectedPutts(gir) - 3.0 // residual −3
    const rounds = Array.from({ length: 5 }, (_, i) =>
      makeRound({ id: `m${i}`, gir, putts, penalties: 3.03 }),
    )
    const p = computeGameProfile({
      rounds,
      handicap: 20,
      selfAssessedWorst: 'putt',
      now: 'T',
    })
    expect(area(p, 'putt').z).toBeLessThan(0)
    expect(p.flags).toContain('putting_myth')
  })

  it('suppresses shot figures at n = 1 (vector 5)', () => {
    const p = computeGameProfile({
      rounds: [makeRound({})],
      handicap: 20,
      now: 'T',
    })
    expect(p.confidence).toBe('low')
    expect(p.flags).toContain('low_data')
    for (const a of p.areas) {
      expect(a.shotsLostVsScratch).toBeNull()
      expect(a.recoverableShots).toBeNull()
    }
    expect(p.areas).toHaveLength(4)
  })

  it('onboarding cold start shows a ranking but no shots (vector 6)', () => {
    const p = computeGameProfile({
      rounds: [],
      handicapSource: 'self_assessed',
      priors: { app: 1.0, ott: 0.5, short: 0.2, putt: -0.1 },
      now: 'T',
    })
    expect(p.confidence).toBe('estimate')
    expect(p.totalShotsLostVsScratch).toBeNull()
    expect(area(p, 'app').rank).toBe(1)
    for (const a of p.areas) expect(a.shotsLostVsScratch).toBeNull()
  })

  it('fires penalty_dominant and ranks off-the-tee first (vector 7)', () => {
    const b = benchAt(20)
    const rounds = Array.from({ length: 5 }, (_, i) =>
      makeRound({
        id: `p${i}`,
        gir: b.girHoles,
        penalties: 8,
        putts: b.putts,
        upDownMade: 20,
        upDownAttempts: 100, // 20%
      }),
    )
    const p = computeGameProfile({ rounds, handicap: 20, now: 'T' })
    expect(p.flags).toContain('penalty_dominant')
    expect(area(p, 'ott').rank).toBe(1)
  })
})
