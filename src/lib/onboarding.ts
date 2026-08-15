import type { Area, Experience, OnboardingProfile } from '@/types'
import { computeGameProfile } from './diagnosis'

/** The "where are you now" choices — drives Learn tailoring too. */
export const EXPERIENCE_OPTIONS: {
  value: Experience
  label: string
  sub: string
}[] = [
  { value: 'never', label: "I've never played", sub: 'Never hit a ball, or only at a range once or twice' },
  { value: 'learning', label: "I'm learning, no handicap yet", sub: 'Playing occasionally, still finding my feet' },
  { value: 'handicap', label: 'I have a handicap', sub: 'Official WHS index — you can enter it' },
  { value: 'untracked', label: "I play, but I don't track anything", sub: 'Regular golfer, no stats, no index' },
]

/** A newcomer wants the range/first-round content up front. */
export const isBeginner = (e: Experience) => e === 'never' || e === 'learning'

/**
 * The quick assessment — one concrete question per area, options ordered best
 * → worst so the chosen index IS the severity (0..3). We ask about penalties,
 * not fairways: fairway accuracy is flat across the handicap range.
 */
export interface AssessQuestion {
  area: Area
  eyebrow: string
  question: string
  /** Plain-English gloss for anything that is golf jargon. */
  help?: string
  options: string[] // index 0 = best (severity 0) … 3 = worst
}

/** For golfers who have played rounds: recall-based, about their scoring. */
export const ASSESSMENT: AssessQuestion[] = [
  {
    area: 'ott',
    eyebrow: 'Off the tee',
    question: 'How often do you lose a ball or take a penalty in a round?',
    options: ['Rarely', '1–2 times', '3–4 times', '5 or more'],
  },
  {
    area: 'app',
    eyebrow: 'Approach',
    question: 'Out of 18 holes, how many greens do you hit in regulation?',
    help: 'On the green in one shot on a par 3, two on a par 4, three on a par 5. A rough guess is fine.',
    options: ['10 or more', '6–9', '3–5', '0–2'],
  },
  {
    area: 'short',
    eyebrow: 'Short game',
    question: 'When you miss a green, how often do you get up and down?',
    help: 'Chip on and hole the putt — two shots from just off the green.',
    options: ['Usually', 'Sometimes', 'Rarely', 'Almost never'],
  },
  {
    area: 'putt',
    eyebrow: 'Putting',
    question: 'How many times do you three-putt in a round?',
    options: ['0–1', 'About 2', 'About 3', '4 or more'],
  },
]

/**
 * For golfers who have never played a round. Asking a newcomer about greens in
 * regulation or penalty shots is meaningless — they have no round to recall.
 * These ask about comfort with the movement instead, in plain language, and
 * map to the same four areas so the rest of the app still works.
 */
export const BEGINNER_ASSESSMENT: AssessQuestion[] = [
  {
    area: 'app',
    eyebrow: 'Full shots',
    question: 'When you swing at a ball, how often do you make clean contact?',
    help: 'Nobody starts well here. It is the first thing that improves.',
    options: ['Most times', 'About half', 'Now and then', "Haven't tried yet"],
  },
  {
    area: 'ott',
    eyebrow: 'The big clubs',
    question: 'How do you feel about hitting a driver?',
    options: [
      'Comfortable',
      'It goes somewhere',
      'A bit wild',
      "Haven't used one",
    ],
  },
  {
    area: 'short',
    eyebrow: 'Around the green',
    question: 'Have you practised short chips onto a green?',
    options: ['Often', 'A few times', 'Once or twice', 'Never'],
  },
  {
    area: 'putt',
    eyebrow: 'Putting',
    question: 'How comfortable are you on the putting green?',
    options: ['Comfortable', 'Fairly', 'Not very', 'Never putted'],
  },
]

/** The right assessment for where the golfer says they are. */
export function assessmentFor(experience: Experience): AssessQuestion[] {
  return experience === 'never' ? BEGINNER_ASSESSMENT : ASSESSMENT
}

/** Facilities offered in onboarding, mapped to capability-group keys. */
export const FACILITY_OPTIONS: { key: string; label: string }[] = [
  { key: 'range', label: '🎯 Driving range' },
  { key: 'short', label: '⛳ Short game / green' },
  { key: 'home', label: '🏠 Net or space at home' },
  { key: 'enclosed', label: '🖥 Simulator' },
]

/** Self-rated severity (0..3) → a rough z prior; higher z = worse. */
const RATING_Z = [-0.3, 0.2, 0.6, 1.0]

export function priorsFromRatings(
  selfRatings: Partial<Record<Area, number>>,
): Partial<Record<Area, number>> {
  const priors: Partial<Record<Area, number>> = {}
  for (const [area, rating] of Object.entries(selfRatings)) {
    priors[area as Area] = RATING_Z[Math.max(0, Math.min(3, rating ?? 0))]
  }
  return priors
}

/** The area the user rated their worst (for the putting_myth flag later). */
export function worstArea(
  selfRatings: Partial<Record<Area, number>>,
): Area | undefined {
  let worst: Area | undefined
  let max = -Infinity
  for (const [area, rating] of Object.entries(selfRatings)) {
    if ((rating ?? 0) > max) {
      max = rating ?? 0
      worst = area as Area
    }
  }
  return worst
}

/**
 * The cold-start Game Profile from onboarding answers — a ranking with an
 * honest "Estimate" label and NO invented shot figures (Spec A6). It sharpens
 * once real rounds are logged.
 */
export function profileFromOnboarding(p: OnboardingProfile) {
  return computeGameProfile({
    rounds: [],
    handicap: p.handicap,
    handicapSource: 'self_assessed',
    priors: priorsFromRatings(p.selfRatings),
    selfAssessedWorst: worstArea(p.selfRatings),
  })
}
