import { create } from 'zustand'
import type { GameProfile, OnboardingProfile, Round } from '@/types'
import { storage } from '@/lib/storage'
import { computeGameProfile } from '@/lib/diagnosis'
import { priorsFromRatings, worstArea } from '@/lib/onboarding'

const ONBOARDING_KEY = 'onboarding'
const ROUND_PREFIX = 'round:'
const roundKey = (id: string) => `${ROUND_PREFIX}${id}`

interface ProfileState {
  onboarding: OnboardingProfile | null
  rounds: Round[]
  hydrated: boolean
  hydrate: () => Promise<void>
  saveOnboarding: (p: OnboardingProfile) => Promise<void>
  addRound: (r: Round) => Promise<void>
  /** The current Game Profile: from rounds when there are any, else cold start. */
  gameProfile: () => GameProfile | null
}

export const useProfile = create<ProfileState>((set, get) => ({
  onboarding: null,
  rounds: [],
  hydrated: false,

  hydrate: async () => {
    const [onboarding, rounds] = await Promise.all([
      storage.get<OnboardingProfile>(ONBOARDING_KEY),
      storage.list<Round>(ROUND_PREFIX),
    ])
    rounds.sort((a, b) => a.playedAt.localeCompare(b.playedAt))
    set({ onboarding: onboarding ?? null, rounds, hydrated: true })
  },

  // Optimistic: update state first, persist in the background. A slow or
  // blocked IndexedDB must never freeze the user mid-flow.
  saveOnboarding: async (p) => {
    set({ onboarding: p })
    void storage.set(ONBOARDING_KEY, p).catch((e) =>
      console.error('Could not save onboarding:', e),
    )
  },

  addRound: async (r) => {
    set({ rounds: [...get().rounds, r] })
    void storage.set(roundKey(r.id), r).catch((e) =>
      console.error('Could not save round:', e),
    )
  },

  gameProfile: () => {
    const { onboarding, rounds } = get()
    if (!onboarding && rounds.length === 0) return null
    return computeGameProfile({
      rounds,
      handicap: onboarding?.handicap,
      handicapSource: onboarding?.handicap ? 'whs' : 'self_assessed',
      priors: onboarding ? priorsFromRatings(onboarding.selfRatings) : undefined,
      selfAssessedWorst: onboarding ? worstArea(onboarding.selfRatings) : undefined,
    })
  },
}))
