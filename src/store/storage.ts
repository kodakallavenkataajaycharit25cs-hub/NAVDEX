export type AvatarGender = 'men' | 'women';
export type BodyStyle = 'chibi-a' | 'chibi-b';
export type HairStyle =
  | 'crop'
  | 'pompadour'
  | 'spiky'
  | 'buzz'
  | 'bob'
  | 'ponytail'
  | 'wavy'
  | 'buns'
  | 'curly'
  | 'swoop'
  | 'puff';
export type HatStyle = 'none' | 'cap' | 'beanie' | 'sprout';
export type TopStyle = 'jacket' | 'hoodie' | 'tshirt' | 'shirt';
export type PetSpecies = 'dog' | 'cat' | 'bunny';

export interface UserCharacterProfile {
  displayName: string;
  email: string;
  avatarGender: AvatarGender;
  bodyStyle: BodyStyle;
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  topStyle: TopStyle;
  outfitColor: string;
  hatStyle: HatStyle;
  petSpecies: PetSpecies;
  petName: string;
  onboardingComplete: boolean;
}

export interface PersistedNavdexState {
  version: 'navdex_v1';
  profile: UserCharacterProfile;
  lastBlockId: string;
  demoMode: boolean;
}

export const STORAGE_KEY = 'navdex_v2';

export const DEFAULT_PROFILE: UserCharacterProfile = {
  displayName: '',
  email: '',
  avatarGender: 'men',
  bodyStyle: 'chibi-a',
  skinTone: '#B07346',
  hairStyle: 'crop',
  hairColor: '#241C16',
  topStyle: 'jacket',
  outfitColor: '#FFFFFF',
  hatStyle: 'none',
  petSpecies: 'dog',
  petName: 'Mochi',
  onboardingComplete: false,
};

export const DEFAULT_PERSISTED_STATE: PersistedNavdexState = {
  version: 'navdex_v1',
  profile: DEFAULT_PROFILE,
  lastBlockId: 'GATE',
  demoMode: true,
};

/**
 * Strips HTML/script tags, collapses whitespace, and caps length at maxLen (default 24)
 * to prevent DOM/XSS injection in floating 3D HTML tags or greeting bubbles.
 */
export function sanitizeName(raw: string, fallback = 'Explorer', maxLen = 24): string {
  const withoutTags = raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const sliced = withoutTags.slice(0, maxLen).trim();
  return sliced.length > 0 ? sliced : fallback;
}

/**
 * Safely loads persisted state from a Storage-compatible object (or window.localStorage).
 * Never throws on malformed or corrupted JSON.
 */
export function safeLoadStorage(
  storage: Pick<Storage, 'getItem'> | null = typeof window !== 'undefined' ? window.localStorage : null
): PersistedNavdexState {
  if (!storage) {
    return structuredClone(DEFAULT_PERSISTED_STATE);
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_PERSISTED_STATE);
    const parsed = JSON.parse(raw) as Partial<PersistedNavdexState>;
    if (!parsed || parsed.version !== 'navdex_v1' || typeof parsed.profile !== 'object') {
      return structuredClone(DEFAULT_PERSISTED_STATE);
    }

    const p = parsed.profile as Partial<UserCharacterProfile>;
    return {
      version: 'navdex_v1',
      lastBlockId: typeof parsed.lastBlockId === 'string' ? parsed.lastBlockId : 'GATE',
      demoMode: typeof parsed.demoMode === 'boolean' ? parsed.demoMode : true,
      profile: {
        displayName: sanitizeName(typeof p.displayName === 'string' ? p.displayName : DEFAULT_PROFILE.displayName, 'Explorer'),
        email: typeof p.email === 'string' ? p.email : DEFAULT_PROFILE.email,
        avatarGender: p.avatarGender === 'women' ? 'women' : 'men',
        bodyStyle: p.bodyStyle === 'chibi-b' ? 'chibi-b' : 'chibi-a',
        skinTone: typeof p.skinTone === 'string' ? p.skinTone : DEFAULT_PROFILE.skinTone,
        hairStyle:
          p.hairStyle === 'crop' ||
          p.hairStyle === 'pompadour' ||
          p.hairStyle === 'spiky' ||
          p.hairStyle === 'buzz' ||
          p.hairStyle === 'bob' ||
          p.hairStyle === 'ponytail' ||
          p.hairStyle === 'wavy' ||
          p.hairStyle === 'buns' ||
          p.hairStyle === 'puff' ||
          p.hairStyle === 'swoop' ||
          p.hairStyle === 'curly'
            ? p.hairStyle
            : DEFAULT_PROFILE.hairStyle,
        hairColor: typeof p.hairColor === 'string' ? p.hairColor : DEFAULT_PROFILE.hairColor,
        topStyle:
          p.topStyle === 'hoodie' || p.topStyle === 'tshirt' || p.topStyle === 'shirt'
            ? p.topStyle
            : 'jacket',
        outfitColor: typeof p.outfitColor === 'string' ? p.outfitColor : DEFAULT_PROFILE.outfitColor,
        hatStyle:
          p.hatStyle === 'none' || p.hatStyle === 'cap' || p.hatStyle === 'beanie' || p.hatStyle === 'sprout'
            ? p.hatStyle
            : DEFAULT_PROFILE.hatStyle,
        petSpecies:
          p.petSpecies === 'dog' || p.petSpecies === 'cat' || p.petSpecies === 'bunny'
            ? p.petSpecies
            : DEFAULT_PROFILE.petSpecies,
        petName: sanitizeName(typeof p.petName === 'string' ? p.petName : DEFAULT_PROFILE.petName, 'Mochi'),
        onboardingComplete: typeof p.onboardingComplete === 'boolean' ? p.onboardingComplete : false,
      },
    };
  } catch {
    return structuredClone(DEFAULT_PERSISTED_STATE);
  }
}

export function safeSaveStorage(
  state: PersistedNavdexState,
  storage: Pick<Storage, 'setItem'> | null = typeof window !== 'undefined' ? window.localStorage : null
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors in private browsing
  }
}
