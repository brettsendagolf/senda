import type { Experience } from '@/types'

/**
 * Learn content — free forever, and tailored to where the user said they are.
 * The verified beginner barrier is procedural, not technical: what to expect,
 * what things cost, what the unwritten rules are. Everyone writes the technical
 * FAQ; almost nobody addresses the embarrassment.
 */

export interface LearnArticle {
  id: string
  title: string
  blurb: string
  readMinutes: number
  body: string[]
}

export interface LearnSection {
  id: string
  eyebrow: string
  /** Which experience levels see this section. Empty = everyone. */
  audience: Experience[]
  articles: LearnArticle[]
}

export const LEARN_SECTIONS: LearnSection[] = [
  {
    id: 'first_steps',
    eyebrow: 'Start here',
    audience: ['never', 'learning'],
    articles: [
      {
        id: 'first_range',
        title: 'Your first trip to the driving range',
        blurb: 'What to do, in order, so nothing catches you out.',
        readMinutes: 4,
        body: [
          'Go at a quiet time if you can — a weekday morning or mid-afternoon. Nobody is watching, but it feels easier when the bays either side are empty.',
          'You buy a token or a card at the desk, take a basket or tray, and find a bay. Most UK ranges are £3.50–£6.50 for 50 balls at a club, or £8–£9 per 100 at a commercial range.',
          'If you do not have clubs, ask at the desk — most ranges hire them, often around £2 for an iron and £4–£6 for a driver.',
          'Start with a wedge or a 9 iron, not the driver. Half swings. The aim of the first ten balls is to make contact, not distance.',
          'Nobody is judging your ball flight. Everyone there has hit exactly the shot you are worried about hitting.',
        ],
      },
      {
        id: 'first_round',
        title: 'Playing your first round',
        blurb: "Pace, etiquette, and what to do when you're embarrassed.",
        readMinutes: 5,
        body: [
          'Book a quiet tee time and play 9 holes, not 18. Nine is a proper round — it is WHS-acceptable and it is the format most new golfers actually enjoy.',
          'Pick the forward tees. There is no prize for playing a longer course badly.',
          'Pace matters more than score. If you are holding people up, pick the ball up and move on — nobody minds a high score, everyone minds waiting.',
          'You are allowed to have a bad hole. Cap it: pick up after double par and walk to the next tee.',
          'The embarrassment fades faster than you think. Most golfers are far too worried about their own game to be watching yours.',
        ],
      },
      {
        id: 'what_you_need',
        title: 'What you actually need to start',
        blurb: 'And what you can safely ignore for a year.',
        readMinutes: 3,
        body: [
          'You need: something to hit with, shoes you can walk in, and a glove if you blister easily.',
          'A half set is plenty — a driver or 5 wood, a 7 iron, a 9 iron, a wedge and a putter will play any hole on any course.',
          'Second-hand is completely fine. Clubs do not wear out at the rate the marketing suggests.',
          'You do not need: a rangefinder, a launch monitor, or a new driver. Not yet, and possibly not ever.',
        ],
      },
    ],
  },
  {
    id: 'handicap',
    eyebrow: 'Getting a handicap in England',
    audience: ['never', 'learning', 'untracked'],
    articles: [
      {
        id: 'handicap_how',
        title: 'How to get your first handicap',
        blurb: "The chain of steps England Golf's own page doesn't spell out.",
        readMinutes: 4,
        body: [
          'You need 54 holes. Any mix of 9s and 18s — three 18-hole rounds, six 9-hole rounds, or any combination.',
          'You must register the card BEFORE you tee off, in the MyEG app, standing at the course. It is location-checked.',
          'You need a marker: someone with a membership number who played with you and verifies your score.',
          'Submit by midnight on the day of play. There are no retrospective cards.',
          'Not a club member? iGolf costs £47 a year and gets you an official index.',
          'Match play does not count. Individual strokeplay, Stableford or Par/Bogey only.',
        ],
      },
    ],
  },
  {
    id: 'practice',
    eyebrow: 'How practice actually works',
    audience: [], // everyone
    articles: [
      {
        id: 'putting_myth',
        title: "Why your putting probably isn't the problem",
        blurb: 'Putts per round barely move across the handicap range.',
        readMinutes: 4,
        body: [
          'Putts per round only moves from about 29 for a scratch golfer to about 34 for a 25 handicap. Five putts across twenty-five handicap strokes.',
          'It is also confounded: higher handicaps chip on and putt from closer, which flatters the number.',
          'Once you know how many greens someone hits, their handicap tells you almost nothing extra about their putting. The difference between bands is mostly a greens-in-regulation effect.',
          'That is why we measure your putting against how many greens you hit, not against a raw average.',
          'Outside 24 feet, every handicap band putts about the same. Almost all putting skill lives inside 12 feet.',
        ],
      },
      {
        id: 'fairways_useless',
        title: 'Fairways hit is a useless stat',
        blurb: 'A 25 handicap hits about as many as a scratch golfer.',
        readMinutes: 3,
        body: [
          'Fairways hit runs between about 46% and 50% across the entire handicap range. It barely moves.',
          'It is a binary that throws away the only thing that matters: how badly you missed. Ten yards into the first cut and out of bounds both score the same.',
          'Penalty shots, by contrast, run from about 0.56 a round at scratch to 4.67 at 25 handicap — an eightfold range.',
          'So we ask about penalties and lost balls. Those are the shots you can actually stop giving away.',
        ],
      },
      {
        id: 'blocked_random',
        title: 'Blocked vs random — and why we do both',
        blurb: 'The order of a session matters more than the drills in it.',
        readMinutes: 5,
        body: [
          'Blocked practice — same club, same target, over and over — looks better while you are doing it. You groove something and it feels like progress.',
          'Random practice — changing club and target every ball — feels worse and retains better. This is one of the most replicated findings in motor learning.',
          'The best result comes from doing them in order: block first to build the pattern, then randomise to make it stick.',
          'That is why sessions here run warm-up, then blocked, then random, then something with a consequence on the end.',
          'A word of honesty: most of this research is on simple tasks in a lab, and no controlled study has ever demonstrated that range practice transfers to the course. Practice quality is the biggest lever you personally control — that is the honest claim, and it is enough.',
        ],
      },
      {
        id: 'fifty_balls',
        title: 'What 50 balls should actually look like',
        blurb: 'The default unit of practice, and how to spend it.',
        readMinutes: 4,
        body: [
          'Fifty balls over 45 minutes to an hour is what most golfers actually do, and it is a good unit.',
          'Roughly one ball a minute is the pace of practising with intent. If you are getting through a hundred balls in twenty minutes, you are hitting, not practising.',
          'Spend about eight warming up, fifteen grooving one thing, eighteen with the target changing, and the last nine with a score on the line.',
          'The last nine are the ones that matter. A score you have to deliver is the closest a range gets to a golf course.',
        ],
      },
    ],
  },
]

/** Sections visible to a given experience level (undefined = show everything). */
export function sectionsFor(experience?: Experience): LearnSection[] {
  return LEARN_SECTIONS.filter(
    (s) =>
      s.audience.length === 0 ||
      (experience !== undefined && s.audience.includes(experience)),
  )
}

export function getArticle(id: string): LearnArticle | undefined {
  for (const s of LEARN_SECTIONS) {
    const a = s.articles.find((x) => x.id === id)
    if (a) return a
  }
  return undefined
}
