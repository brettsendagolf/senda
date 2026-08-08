import type { Drill } from '@/types'
import { AggregateEntry, PerShotEntry } from './ScoreEntry'
import { CarryTableEntry, RandomYardageEntry } from './SpecialEntry'

/**
 * Picks the right score input for a drill: the two special inputs first, then
 * per-shot, then the plain keypad. One place so the runner and the drill detail
 * stay in step.
 */
export function DrillScoreInput({
  drill,
  onValueChange,
}: {
  drill: Drill
  onValueChange: (value: number | undefined) => void
}) {
  if (drill.special === 'carry_table')
    return <CarryTableEntry metric={drill.metric} onValueChange={onValueChange} />
  if (drill.special === 'random_yardage')
    return <RandomYardageEntry metric={drill.metric} onValueChange={onValueChange} />
  if (drill.logType === 'per_shot')
    return <PerShotEntry metric={drill.metric} onValueChange={onValueChange} />
  return <AggregateEntry metric={drill.metric} onValueChange={onValueChange} />
}
