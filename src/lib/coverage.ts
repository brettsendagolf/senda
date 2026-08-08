import type { Capability, Category, Drill, Mode, SkillId } from '@/types'
import type { Symptom } from '@/data/skills'

/**
 * Coverage report over the drill library — which categories, skills, modes and
 * venue capabilities have a generatable drill and which have nothing. The
 * backlog says to re-run this after every batch of new drills; a bucket that
 * stays empty is a golfer with that problem getting nothing useful.
 *
 * Pure and data-driven so it can run in a test, a script, or the UI.
 */

export interface CountedGap<T extends string> {
  key: T
  count: number
}

export interface SkillCoverage {
  key: SkillId
  primary: number // generatable drills where this is the PRIMARY skill
  any: number //     generatable drills training it at all (primary or not)
}

export interface CoverageReport {
  totals: { all: number; generatable: number; course: number }
  categories: CountedGap<Category>[]
  modes: CountedGap<Mode>[]
  capabilities: CountedGap<Capability>[]
  skills: SkillCoverage[]
  symptoms: { id: string; label: string; served: number }[]
}

export interface CoverageRefs {
  categories: Category[]
  capabilities: Capability[]
  modes: Mode[]
  skills: SkillId[]
  symptoms: Symptom[]
}

export function computeCoverage(
  drills: Drill[],
  refs: CoverageRefs,
): CoverageReport {
  const generatable = drills.filter((d) => d.mode !== 'course')
  const course = drills.filter((d) => d.mode === 'course')

  const categories = refs.categories.map((key) => ({
    key,
    count: generatable.filter((d) => d.category === key).length,
  }))

  const modes = refs.modes.map((key) => ({
    key,
    count: generatable.filter((d) => d.mode === key).length,
  }))

  const capabilities = refs.capabilities.map((key) => ({
    key,
    count: generatable.filter((d) => d.requires.includes(key)).length,
  }))

  const skills = refs.skills.map((key) => ({
    key,
    primary: generatable.filter((d) => d.primarySkill === key).length,
    any: generatable.filter((d) => d.skills.includes(key)).length,
  }))

  const symptoms = refs.symptoms.map((s) => ({
    id: s.id,
    label: s.label,
    // If the symptom names categories (e.g. bunker), a drill only serves it by
    // matching one — a shared skill on a different shot type is a weak match and
    // shouldn't count. Category-less symptoms (falls_apart) match on skill.
    served: generatable.filter((d) =>
      s.categories.length > 0
        ? s.categories.includes(d.category)
        : d.skills.some((skill) => s.skills.includes(skill)),
    ).length,
  }))

  return {
    totals: {
      all: drills.length,
      generatable: generatable.length,
      course: course.length,
    },
    categories,
    modes,
    capabilities,
    skills,
    symptoms,
  }
}
