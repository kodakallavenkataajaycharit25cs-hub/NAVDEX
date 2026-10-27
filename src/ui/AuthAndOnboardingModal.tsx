import { Check, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  AvatarGender,
  BodyStyle,
  HairStyle,
  HatStyle,
  PetSpecies,
  TopStyle,
} from '../store/storage';
import { useCampusStore } from '../store/useCampusStore';

const SKIN_TONES = ['#B07346', '#E59866', '#F8D5B8', '#F4C29F', '#6E4228'];
const HAIR_COLORS = ['#241C16', '#1B8A6B', '#2B2438', '#5E3A24', '#D97736'];
const OUTFIT_COLORS = ['#FFFFFF', '#159A74', '#C8234B', '#2563EB', '#18181B', '#F59E0B'];

const TOP_STYLES: Array<{ id: TopStyle; label: string; icon: string; desc: string }> = [
  { id: 'jacket', label: 'Zip Jacket', icon: '🧥', desc: 'Athletic two-tone track jacket' },
  { id: 'hoodie', label: 'Hoodie', icon: '🥼', desc: 'Campus fleece cowl hoodie' },
  { id: 'tshirt', label: 'T-Shirt', icon: '👕', desc: 'Short sleeve active tee' },
  { id: 'shirt', label: 'Oxford Shirt', icon: '👔', desc: 'Crisp button-up collar shirt' },
];

const MEN_HAIR_STYLES: Array<{ id: HairStyle; label: string }> = [
  { id: 'crop', label: 'Textured Crop' },
  { id: 'pompadour', label: 'Pompadour Fade' },
  { id: 'spiky', label: 'Messy Spikes' },
  { id: 'buzz', label: 'Buzz Fade' },
];

const WOMEN_HAIR_STYLES: Array<{ id: HairStyle; label: string }> = [
  { id: 'bob', label: 'Shoulder Bob' },
  { id: 'ponytail', label: 'High Ponytail' },
  { id: 'wavy', label: 'Wavy Flow' },
  { id: 'buns', label: 'Space Buns' },
];

const HAT_STYLES: Array<{ id: HatStyle; label: string }> = [
  { id: 'none', label: 'No Hat' },
  { id: 'cap', label: 'Bucket Cap' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'sprout', label: 'Sprout' },
];

const PET_OPTIONS: Array<{ id: PetSpecies; label: string; tagline: string; badgeColor: string }> = [
  { id: 'dog', label: 'Pian', tagline: 'Gentle mint companion + mini piano', badgeColor: '#80FFDB' },
  { id: 'cat', label: 'Blushy', tagline: 'Rose companion + mini violin', badgeColor: '#FFB3D9' },
  { id: 'bunny', label: 'Willow', tagline: 'Celestial companion + star synth', badgeColor: '#93C5FD' },
];

const FEATURED_LOOKS = [
  {
    id: 'anime-trainer',
    label: 'NAVDEX Trainer',
    isNew: true,
    avatarGender: 'men' as AvatarGender,
    skinTone: '#B07346',
    hairStyle: 'crop' as HairStyle,
    hairColor: '#241C16',
    hatStyle: 'none' as HatStyle,
    topStyle: 'tshirt' as TopStyle,
    outfitColor: '#FFFFFF',
  },
  {
    id: 'woods-scout',
    label: 'Camp Scout',
    isNew: false,
    avatarGender: 'men' as AvatarGender,
    skinTone: '#E59866',
    hairStyle: 'pompadour' as HairStyle,
    hairColor: '#241C16',
    hatStyle: 'cap' as HatStyle,
    topStyle: 'jacket' as TopStyle,
    outfitColor: '#159A74',
  },
  {
    id: 'crimson-trekker',
    label: 'Crimson Trek',
    isNew: true,
    avatarGender: 'women' as AvatarGender,
    skinTone: '#F4C29F',
    hairStyle: 'ponytail' as HairStyle,
    hairColor: '#2B2438',
    hatStyle: 'cap' as HatStyle,
    topStyle: 'hoodie' as TopStyle,
    outfitColor: '#C8234B',
  },
  {
    id: 'sunny-beanie',
    label: 'Gold Beanie',
    isNew: false,
    avatarGender: 'women' as AvatarGender,
    skinTone: '#F8D5B8',
    hairStyle: 'buns' as HairStyle,
    hairColor: '#5E3A24',
    hatStyle: 'beanie' as HatStyle,
    topStyle: 'shirt' as TopStyle,
    outfitColor: '#2563EB',
  },
  {
    id: 'sprout-mage',
    label: 'Sprout Guide',
    isNew: false,
    avatarGender: 'men' as AvatarGender,
    skinTone: '#A86B43',
    hairStyle: 'spiky' as HairStyle,
    hairColor: '#2B2438',
    hatStyle: 'sprout' as HatStyle,
    topStyle: 'tshirt' as TopStyle,
    outfitColor: '#F59E0B',
  },
];

type AuthSubStep = 'splash' | 'intro' | 'login' | 'welcome';
type StyleTab = 'featured' | 'body' | 'hats' | 'hair' | 'outfit' | 'pet';

/**
 * Clean Polished WalkWin Hero Stage Art (Matches uploaded_media_1_1792409983709.png)
 * Joyful athletic runner + cute companion mascot + floating "+150 STEPS" achievement badge
 */
const WalkWinHeroArt: React.FC = () => {
  return (
    <div className="relative flex h-[220px] w-full max-w-[340px] items-center justify-center select-none">
      {/* Floating "+150 STEPS" Achievement Pill Badge */}
      <div className="absolute top-2 left-6 z-20 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 shadow-lg backdrop-blur-sm border border-white/60">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB703] text-[11px] shadow-sm">
          ⭐
        </span>
        <span className="font-display text-xs font-black tracking-wide text-[#18181B]">
          +150 STEPS
        </span>
      </div>

      <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
        {/* Soft Ground Shadow Ovals */}
        <ellipse cx="140" cy="204" rx="42" ry="10" fill="#000000" opacity="0.18" />
        <ellipse cx="230" cy="204" rx="32" ry="8" fill="#000000" opacity="0.18" />

        {/* --- Joyful Athletic Runner Character --- */}
        <g id="runner-character">
          {/* Back Arm */}
          <path d="M 120 105 L 98 122 L 86 112" stroke="#E59866" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Back Leg with Sneaker */}
          <path d="M 132 145 L 115 178 L 102 196" stroke="#1E293B" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <ellipse cx="98" cy="198" rx="10" ry="5.5" fill="#FFFFFF" />
          <ellipse cx="96" cy="199" rx="8" ry="3" fill="#E4E4E7" />

          {/* Torso & Athletic Jacket */}
          <ellipse cx="138" cy="124" rx="19" ry="24" fill="#FFFFFF" />
          <path d="M 124 105 L 152 105 L 148 142 L 128 142 Z" fill="#FF5B00" />
          {/* Jacket White Yoke Accent */}
          <path d="M 124 105 L 152 105 L 146 118 L 130 118 Z" fill="#FFFFFF" />
          <line x1="138" y1="108" x2="138" y2="142" stroke="#FFFFFF" strokeWidth="2" />

          {/* Front Leg with Sneaker */}
          <path d="M 144 142 L 158 172 L 146 198" stroke="#1E293B" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <ellipse cx="144" cy="200" rx="11" ry="5.5" fill="#FFFFFF" />
          <ellipse cx="142" cy="201" rx="9" ry="3" fill="#E4E4E7" />

          {/* Neck & Head */}
          <rect x="134" y="94" width="8" height="9" fill="#E59866" rx="2" />
          <circle cx="138" cy="78" r="18" fill="#E59866" />

          {/* Modern Curly/Swept Hair */}
          <path
            d="M 122 76 C 120 62, 134 52, 148 54 C 158 56, 160 68, 154 78 C 151 72, 144 68, 136 69 C 128 70, 124 74, 122 76 Z"
            fill="#241C16"
          />
          <circle cx="148" cy="60" r="7" fill="#241C16" />
          <circle cx="134" cy="58" r="8" fill="#241C16" />

          {/* Expressive Face: Eye, Brow & Confident Smile */}
          <ellipse cx="145" cy="76" rx="2.4" ry="3" fill="#18181B" />
          <circle cx="146" cy="75" r="0.9" fill="#FFFFFF" />
          <path d="M 142 71 Q 146 69 148 72" stroke="#241C16" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 143 83 Q 146 87 149 84" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Front Waving Arm */}
          <path d="M 148 108 L 172 100 L 186 86" stroke="#E59866" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="188" cy="84" r="5" fill="#E59866" />
        </g>

        {/* --- Cute Companion Mascot --- */}
        <g id="companion-mascot">
          {/* Mascot Body */}
          <ellipse cx="230" cy="162" rx="24" ry="26" fill="#18181B" />
          <ellipse cx="230" cy="162" rx="18" ry="20" fill="#FFFFFF" />
          {/* Ears */}
          <circle cx="212" cy="136" r="9" fill="#18181B" />
          <circle cx="248" cy="136" r="9" fill="#18181B" />
          <circle cx="212" cy="136" r="4.5" fill="#FFA370" opacity="0.7" />
          <circle cx="248" cy="136" r="4.5" fill="#FFA370" opacity="0.7" />
          {/* Head */}
          <circle cx="230" cy="150" r="21" fill="#FFFFFF" />
          {/* Joyful Eyes & Smile */}
          <ellipse cx="221" cy="148" rx="4" ry="5" fill="#18181B" />
          <ellipse cx="239" cy="148" rx="4" ry="5" fill="#18181B" />
          <circle cx="222" cy="147" r="1.5" fill="#FFFFFF" />
          <circle cx="240" cy="147" r="1.5" fill="#FFFFFF" />
          <ellipse cx="230" cy="155" rx="2.5" ry="1.8" fill="#18181B" />
          <path d="M 226 159 Q 230 164 234 159" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Feet */}
          <ellipse cx="218" cy="188" rx="7" ry="5" fill="#18181B" />
          <ellipse cx="242" cy="188" rx="7" ry="5" fill="#18181B" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Custom Filled Pokémon GO-Style Category Icons (`uploaded_media_1_1792237409210.png`)
 */
const PokemonGoCategoryIcon: React.FC<{ id: StyleTab; active: boolean }> = ({ id, active }) => {
  const teal = active ? '#1D6368' : '#408A8E';
  const accent = active ? '#285958' : '#64A2A6';

  switch (id) {
    case 'featured':
      return (
        <svg viewBox="0 0 36 32" className="h-7 w-8 overflow-visible" aria-hidden="true">
          <path
            d="M 12 3 L 14.4 8.2 L 20 9 L 15.8 12.9 L 16.9 18.5 L 12 15.7 L 7.1 18.5 L 8.2 12.9 L 4 9 L 9.6 8.2 Z"
            fill="#F4C44E"
          />
          <path
            d="M 25 5 L 26.5 8.2 L 30 8.7 L 27.4 11.1 L 28.1 14.6 L 25 12.9 L 21.9 14.6 L 22.6 11.1 L 20 8.7 L 23.5 8.2 Z"
            fill="#F7D574"
          />
          <path
            d="M 18 17 L 19.3 19.8 L 22.4 20.2 L 20.1 22.3 L 20.7 25.3 L 18 23.8 L 15.3 25.3 L 15.9 22.3 L 13.6 20.2 L 16.7 19.8 Z"
            fill="#EAB338"
          />
        </svg>
      );
    case 'body':
      return (
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
          <circle cx="16" cy="5.5" r="3.2" fill={teal} />
          <path
            d="M 12 10.5 C 12 9.5, 20 9.5, 20 10.5 L 22.5 17.5 L 20.5 18.2 L 19 13.5 L 18.5 19.5 L 20.5 29.5 L 17.8 29.5 L 16 21.5 L 14.2 29.5 L 11.5 29.5 L 13.5 19.5 L 13 13.5 L 11.5 18.2 L 9.5 17.5 Z"
            fill={teal}
          />
        </svg>
      );
    case 'hats':
      return (
        <svg viewBox="0 0 36 32" className="h-7 w-8" aria-hidden="true">
          <ellipse
            cx="17"
            cy="18"
            rx="14"
            ry="6.5"
            transform="rotate(-12 17 18)"
            fill={teal}
          />
          <path
            d="M 8 16 C 9 8, 23 6, 25 14 Z"
            fill={accent}
          />
          <circle cx="28" cy="21" r="2.6" fill={teal} />
        </svg>
      );
    case 'hair':
      return (
        <svg viewBox="0 0 36 32" className="h-7 w-8" aria-hidden="true">
          <rect
            x="4"
            y="12"
            width="22"
            height="13"
            rx="5"
            fill={teal}
          />
          <circle cx="21" cy="18.5" r="2.2" fill="#FFFFFF" />
          <path
            d="M 23 16 L 31 9 M 24 20 L 31 14"
            stroke={accent}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'outfit':
      return (
        <svg viewBox="0 0 34 32" className="h-7 w-7" aria-hidden="true">
          <path
            d="M 11 6 L 17 10 L 23 6 L 30 11 L 27 17 L 24 15 L 24 27 L 10 27 L 10 15 L 7 17 L 4 11 Z"
            fill={teal}
          />
          <path d="M 17 10 L 17 27" stroke="#FFFFFF" strokeWidth="1.6" />
        </svg>
      );
    case 'pet':
      return (
        <svg viewBox="0 0 34 32" className="h-7 w-7" aria-hidden="true">
          <ellipse cx="9" cy="13" rx="3.5" ry="6.5" transform="rotate(18 9 13)" fill={accent} />
          <ellipse cx="25" cy="13" rx="3.5" ry="6.5" transform="rotate(-18 25 13)" fill={accent} />
          <circle cx="17" cy="16" r="8.5" fill={teal} />
          <circle cx="14" cy="15" r="1.5" fill="#FFFFFF" />
          <circle cx="20" cy="15" r="1.5" fill="#FFFFFF" />
          <ellipse cx="17" cy="18.2" rx="2.5" ry="1.6" fill="#FFFFFF" />
        </svg>
      );
  }
};

export const AuthAndOnboardingModal: React.FC = () => {
  const uiMode = useCampusStore((s) => s.uiMode);
  const setUIMode = useCampusStore((s) => s.setUIMode);
  const profile = useCampusStore((s) => s.profile);
  const updateProfile = useCampusStore((s) => s.updateProfile);

  const [authSubStep, setAuthSubStep] = useState<AuthSubStep>('intro');
  const [styleTab, setStyleTab] = useState<StyleTab>('featured');
  const [name, setName] = useState(profile.displayName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [authError, setAuthError] = useState<string | null>(null);
  const [splashProgress, setSplashProgress] = useState(68);

  useEffect(() => {
    if (authSubStep !== 'splash') return;
    setSplashProgress(25);
    const t1 = setTimeout(() => setSplashProgress(72), 250);
    const t2 = setTimeout(() => setSplashProgress(100), 950);
    const t3 = setTimeout(() => setAuthSubStep('intro'), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [authSubStep]);

  if (
    uiMode !== 'auth' &&
    uiMode !== 'onboarding-avatar' &&
    uiMode !== 'onboarding-pet'
  ) {
    return null;
  }

  const handleConnectSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setAuthError('Please enter your name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid campus email address.');
      return;
    }
    setAuthError(null);
    updateProfile({ displayName: cleanName, email: email.trim(), onboardingComplete: true });
    setAuthSubStep('welcome');
  };

  const handleGuestSubmit = () => {
    const cleanName = name.trim() || 'Campus Explorer';
    updateProfile({ displayName: cleanName, email: 'guest@campus.edu', onboardingComplete: true });
    setUIMode('explore');
  };

  // ============================================================================
  // MODE 1: WALKWIN STYLE AUTH & ONBOARDING FLOW (`uploaded_media_1_1792409983709.png`)
  // ============================================================================
  if (uiMode === 'auth') {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#F7EBE1] p-0 sm:p-4 pointer-events-auto overflow-hidden">
        {/* Centered Mobile Phone Viewport Matching WalkWin Reference */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="NAVDEX Sign In"
          className="relative flex h-[100dvh] w-full max-w-[400px] sm:h-[92dvh] sm:max-h-[820px] flex-col overflow-hidden bg-white sm:rounded-[44px] sm:border-[8px] sm:border-[#1E1B18] sm:shadow-2xl"
        >
          {/* iOS Status Bar Simulation (9:41 · WiFi · Battery) */}
          <div className="z-20 flex w-full items-center justify-between px-7 pt-3 pb-1 text-xs font-semibold">
            <span className={authSubStep === 'login' ? 'text-[#18181B]' : 'text-white'}>
              9:41
            </span>
            <div
              className={`flex items-center gap-1.5 ${
                authSubStep === 'login' ? 'text-[#18181B]' : 'text-white'
              }`}
            >
              <svg className="h-3 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
              </svg>
              <div
                className={`h-2.5 w-5 rounded-[4px] border ${
                  authSubStep === 'login' ? 'border-[#18181B]' : 'border-white'
                } p-0.5`}
              >
                <div
                  className={`h-full w-full rounded-[2px] ${
                    authSubStep === 'login' ? 'bg-[#18181B]' : 'bg-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ==============================================================
              SCREEN 1: SPLASH SCREEN (Mascot Waving on Warm Orange Sky)
              ============================================================== */}
          {authSubStep === 'splash' && (
            <div
              onClick={() => setAuthSubStep('intro')}
              className="relative flex flex-1 cursor-pointer flex-col items-center justify-between px-8 py-8 text-white"
              style={{
                background: 'linear-gradient(180deg, #FF5B00 0%, #FF6F00 55%, #FF821E 100%)',
              }}
            >
              {/* Fluffy Peach Clouds & White Sparkles in Background */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-10 top-12 h-28 w-44 rounded-full bg-[#FFA370]/50 blur-sm" />
                <div className="absolute right-[-20px] top-20 h-32 w-52 rounded-full bg-[#FFA370]/50 blur-sm" />
                {/* 4-point Sparkle Stars */}
                {[
                  { t: '14%', l: '18%', s: '14px' },
                  { t: '22%', r: '16%', s: '16px' },
                  { t: '48%', l: '12%', s: '12px' },
                  { t: '52%', r: '14%', s: '15px' },
                ].map((st, i) => (
                  <svg
                    key={`star-${i}`}
                    className="absolute text-white"
                    style={{ top: st.t, left: (st as any).l, right: (st as any).r, width: st.s, height: st.s }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                  </svg>
                ))}
              </div>

              <div className="z-10 text-xs font-bold uppercase tracking-widest text-white/80">
                Tap to Begin
              </div>

              {/* Cute Waving Panda Companion Mascot */}
              <div className="z-10 flex flex-col items-center">
                <div className="relative flex h-52 w-52 items-center justify-center">
                  <svg viewBox="0 0 160 180" className="h-full w-full">
                    {/* Ears */}
                    <circle cx="36" cy="38" r="20" fill="#18181B" />
                    <circle cx="124" cy="38" r="20" fill="#18181B" />
                    <circle cx="36" cy="38" r="10" fill="#FFA370" opacity="0.6" />
                    <circle cx="124" cy="38" r="10" fill="#FFA370" opacity="0.6" />
                    {/* Body */}
                    <ellipse cx="80" cy="126" rx="42" ry="46" fill="#18181B" />
                    <ellipse cx="80" cy="126" rx="30" ry="36" fill="#FFFFFF" />
                    {/* Head */}
                    <circle cx="80" cy="74" r="50" fill="#FFFFFF" />
                    {/* Eye Patches */}
                    <ellipse cx="60" cy="70" rx="16" ry="20" transform="rotate(-15 60 70)" fill="#18181B" />
                    <ellipse cx="100" cy="70" rx="16" ry="20" transform="rotate(15 100 70)" fill="#18181B" />
                    {/* Big Joyful Eyes */}
                    <circle cx="62" cy="70" r="8" fill="#FFFFFF" />
                    <circle cx="98" cy="70" r="8" fill="#FFFFFF" />
                    <circle cx="64" cy="70" r="5" fill="#18181B" />
                    <circle cx="96" cy="70" r="5" fill="#18181B" />
                    <circle cx="62" cy="68" r="2.5" fill="#FFFFFF" />
                    <circle cx="94" cy="68" r="2.5" fill="#FFFFFF" />
                    {/* Nose & Smile */}
                    <ellipse cx="80" cy="85" rx="6" ry="4.5" fill="#18181B" />
                    <path d="M 72 92 Q 80 102 88 92" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
                    {/* Waving Paw */}
                    <ellipse cx="26" cy="88" rx="13" ry="18" transform="rotate(-35 26 88)" fill="#18181B" />
                    <ellipse cx="134" cy="115" rx="13" ry="18" transform="rotate(25 134 115)" fill="#18181B" />
                    {/* Feet */}
                    <ellipse cx="58" cy="168" rx="16" ry="11" fill="#18181B" />
                    <ellipse cx="102" cy="168" rx="16" ry="11" fill="#18181B" />
                  </svg>
                </div>

                <div className="mt-4 h-2.5 w-44 overflow-hidden rounded-full border border-white/60 bg-black/20 p-0.5">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-300"
                    style={{ width: `${splashProgress}%` }}
                  />
                </div>
              </div>

              {/* WalkWin / NAVDEX Brand Name at Bottom */}
              <div className="z-10 font-display text-2xl font-black tracking-wider text-white">
                WalkWin · NAVDEX
              </div>
            </div>
          )}

          {/* ==============================================================
              SCREEN 2: VALUE PROPOSITION SCREEN ("Earn rewards for every step you take.")
              Exact match to the middle phone in uploaded_media_1_1792409983709.png
              ============================================================== */}
          {authSubStep === 'intro' && (
            <div className="flex flex-1 flex-col justify-between bg-white">
              {/* Top Orange Card with Athletic Character + Panda Companion */}
              <div
                className="relative flex flex-1 flex-col items-center justify-center overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #FF5B00 0%, #FF6F00 65%, #FF7E1A 100%)',
                }}
              >
                {/* Fluffy Peach Clouds & Sparkles */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-8 top-10 h-28 w-44 rounded-full bg-[#FFA370]/50 blur-sm" />
                  <div className="absolute right-[-15px] top-16 h-30 w-48 rounded-full bg-[#FFA370]/50 blur-sm" />
                  {[
                    { t: '16%', l: '14%', s: '15px' },
                    { t: '24%', r: '18%', s: '17px' },
                    { t: '45%', r: '10%', s: '14px' },
                    { t: '65%', l: '12%', s: '14px' },
                  ].map((st, i) => (
                    <svg
                      key={`star-intro-${i}`}
                      className="absolute text-white"
                      style={{ top: st.t, left: (st as any).l, right: (st as any).r, width: st.s, height: st.s }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                    </svg>
                  ))}
                </div>

                {/* Clean Athletic Runner + Companion Mascot Stage */}
                <div className="z-10 flex w-full items-end justify-center px-4 pb-1">
                  <WalkWinHeroArt />
                </div>
              </div>

              {/* Bottom White Card Section */}
              <div className="flex flex-col justify-between bg-white p-7 text-left">
                <div>
                  <h1 className="font-display text-[26px] font-extrabold leading-[1.18] text-[#18181B]">
                    Earn rewards for
                    <br />
                    every step you take.
                  </h1>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[#71717A]">
                    More than tracking transform walking into winning.
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuthSubStep('login')}
                    className="w-full rounded-full bg-[#FF5B00] py-3.5 font-display text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] hover:bg-[#EA5200]"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={handleGuestSubmit}
                    className="w-full py-1 text-center font-display text-xs font-semibold text-[#71717A] hover:text-[#18181B]"
                  >
                    Explore as Campus Guest →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              SCREEN 3: CLEAN WALKWIN LOG IN SCREEN
              Exact match to the right phone in uploaded_media_1_1792409983709.png
              ============================================================== */}
          {authSubStep === 'login' && (
            <div className="flex flex-1 flex-col justify-between bg-white px-7 pb-6 pt-3 text-left">
              <div>
                {/* Back Button with subtle drop shadow */}
                <button
                  type="button"
                  onClick={() => setAuthSubStep('intro')}
                  aria-label="Back to introduction"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E4E4E7] bg-white text-lg font-bold text-[#18181B] shadow-sm transition-transform active:scale-95"
                >
                  ‹
                </button>

                {/* Headline & Terms Notice */}
                <h1 className="mt-5 font-display text-[30px] font-extrabold tracking-tight text-[#18181B]">
                  Log in
                </h1>
                <p className="mt-1 text-xs font-medium text-[#71717A]">
                  By logging in, you agree to our{' '}
                  <span className="font-semibold text-[#18181B]">Terms of Use</span>.
                </p>

                {/* Clean Login Form: Name + Email */}
                <form onSubmit={handleConnectSubmit} className="mt-5 space-y-3.5">
                  <div>
                    <label
                      htmlFor="walkwin-name-input"
                      className="block text-xs font-semibold text-[#71717A]"
                    >
                      Your Name
                    </label>
                    <input
                      id="walkwin-name-input"
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setAuthError(null);
                      }}
                      className="mt-1.5 w-full rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 text-sm font-semibold text-[#18181B] placeholder-[#A1A1AA] transition-colors focus:border-[#FF5B00] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="walkwin-email-input"
                      className="block text-xs font-semibold text-[#71717A]"
                    >
                      Email
                    </label>
                    <input
                      id="walkwin-email-input"
                      type="email"
                      required
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAuthError(null);
                      }}
                      className="mt-1.5 w-full rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 text-sm font-semibold text-[#18181B] placeholder-[#A1A1AA] transition-colors focus:border-[#FF5B00] focus:bg-white focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] font-normal text-[#A1A1AA]">
                      We will send you an e-mail with a login link.
                    </p>
                  </div>

                  {authError && (
                    <div className="rounded-xl bg-[#FEE2E2] px-3 py-2 text-xs font-semibold text-[#991B1B]">
                      {authError}
                    </div>
                  )}

                  {/* Big Vibrant Orange Primary Button: Connect */}
                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#FF5B00] py-3.5 font-display text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98] hover:bg-[#EA5200]"
                  >
                    Connect
                  </button>
                </form>

                {/* "Or" Horizontal Divider */}
                <div className="relative my-5 flex items-center justify-center">
                  <div className="w-full border-t border-[#E4E4E7]" />
                  <span className="absolute bg-white px-3 text-xs font-medium text-[#A1A1AA]">
                    Or
                  </span>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleConnectSubmit()}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[#E4E4E7] bg-white py-3 text-xs font-bold text-[#18181B] transition-colors hover:bg-[#F4F4F5] active:scale-[0.99]"
                  >
                    {/* Google 'G' Icon */}
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestSubmit}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[#E4E4E7] bg-white py-3 text-xs font-bold text-[#18181B] transition-colors hover:bg-[#F4F4F5] active:scale-[0.99]"
                  >
                    <User className="h-4 w-4 text-[#FF5B00]" />
                    <span>Sign in as Campus Guest</span>
                  </button>
                </div>
              </div>

              {/* Privacy Policy Footer Note */}
              <div className="pt-4 text-center">
                <p className="text-[11px] font-normal text-[#A1A1AA]">
                  For more information, please see our{' '}
                  <span className="font-semibold text-[#71717A] underline cursor-pointer">
                    Privacy policy
                  </span>
                  .
                </p>
              </div>
            </div>
          )}

          {/* ==============================================================
              SCREEN 4: WELCOME SCREEN (Post-Login Success & Customizer Entry)
              ============================================================== */}
          {authSubStep === 'welcome' && (
            <div
              className="relative flex flex-1 flex-col items-center justify-between p-7 text-left text-white"
              style={{
                background: 'linear-gradient(180deg, #FF5B00 0%, #FF6F00 55%, #FF821E 100%)',
              }}
            >
              <div className="z-10 flex w-full items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAuthSubStep('intro')}
                  className="rounded-full bg-black/20 px-3.5 py-1 text-xs font-bold text-white hover:bg-black/30"
                >
                  ← Back
                </button>
                <span className="font-display text-xs font-bold uppercase tracking-wider text-white/90">
                  NAVDEX
                </span>
                <button
                  type="button"
                  onClick={() => {
                    updateProfile({ onboardingComplete: true });
                    setUIMode('explore');
                  }}
                  className="rounded-full bg-black/20 px-3.5 py-1 text-xs font-bold text-white hover:bg-black/30"
                >
                  Skip
                </button>
              </div>

              <div className="z-10 my-auto w-full px-2">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/80">
                  Campus Ready!
                </div>
                <h1 className="font-display text-[34px] font-extrabold leading-[1.08] text-white">
                  Welcome to
                  <br />
                  NAVDEX World!
                </h1>
                <p className="mt-3 text-xs font-medium leading-relaxed text-white/90">
                  Ready to explore campus landmarks, live events, and earn steps with your companion.
                </p>
              </div>

              <div className="z-10 flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setUIMode('onboarding-avatar')}
                  className="w-full rounded-full bg-white py-3.5 font-display text-sm font-bold text-[#FF5B00] shadow-xl transition-transform active:scale-[0.98]"
                >
                  Customize Style
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateProfile({ onboardingComplete: true });
                    setUIMode('explore');
                  }}
                  className="w-full rounded-full bg-black/20 py-3 font-display text-xs font-bold text-white transition-colors hover:bg-black/30"
                >
                  Start Exploring Campus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // MODE 2: "NAVDEX · CHOOSE YOUR STYLE" FULL-BODY 3D PEDESTAL CUSTOMIZER
  // With Authentic Filled Two-Tone Pokémon GO Style Icons (`uploaded_media_1_1792237409210.png`)
  // ============================================================================
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between">
      {/* Top Centered Header ("NAVDEX · CHOOSE YOUR STYLE") */}
      <div className="pointer-events-auto mx-auto mt-4 flex w-full max-w-[430px] items-center justify-between px-5">
        <span className="rounded-full bg-white/85 px-3 py-1 font-display text-[11px] font-black tracking-wider text-[#285958] shadow-sm">
          NAVDEX
        </span>
        <h1 className="font-display text-sm font-black uppercase tracking-[0.15em] text-[#285958] drop-shadow-sm">
          CHOOSE YOUR STYLE
        </h1>
        <button
          type="button"
          onClick={() => setUIMode('auth')}
          aria-label="Back to NAVDEX Login"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#285958] shadow-sm"
        >
          <User className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Compact Pokémon GO Style Dock */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="NAVDEX Choose Your Style 3D Customizer"
        className="pointer-events-auto mx-auto w-full max-w-[430px] overflow-hidden rounded-t-[26px] bg-white/95 shadow-sheet border-t border-[#285958]/15"
      >
        {/* Active Category Swatch / Option Strip */}
        <div className="px-4 pb-2 pt-3">
          {styleTab === 'featured' && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#526B65]">
                  NAVDEX Featured Looks
                </span>
                <span className="text-[11px] font-bold text-[#159A74]">
                  {profile.displayName} &amp; {profile.petName}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {FEATURED_LOOKS.map((look) => {
                  const isActive =
                    profile.outfitColor === look.outfitColor &&
                    profile.hatStyle === look.hatStyle;
                  return (
                    <button
                      key={look.id}
                      type="button"
                      onClick={() =>
                        updateProfile({
                          avatarGender: look.avatarGender,
                          skinTone: look.skinTone,
                          hairStyle: look.hairStyle,
                          hairColor: look.hairColor,
                          hatStyle: look.hatStyle,
                          topStyle: look.topStyle,
                          outfitColor: look.outfitColor,
                        })
                      }
                      className={`relative flex flex-col items-center rounded-2xl border p-2 text-center transition-all ${
                        isActive
                          ? 'border-[#159A74] bg-[#E6F7F0] shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {look.isNew && (
                        <span className="absolute -right-1 -top-1 rounded-full bg-[#F2C12E] px-1.5 py-0.2 text-[8px] font-black uppercase text-[#1E241B]">
                          NEW
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <span
                          className="h-4 w-4 rounded-full border border-black/15"
                          style={{ backgroundColor: look.outfitColor }}
                        />
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: look.hairColor }}
                        />
                      </div>
                      <span className="mt-1 text-[10px] font-bold text-[#1E293B]">
                        {look.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {styleTab === 'body' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#526B65]">
                  Body Silhouette &amp; Frame
                </span>
                <div className="flex rounded-xl bg-slate-100 p-0.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      if (profile.avatarGender !== 'men') {
                        updateProfile({
                          avatarGender: 'men',
                          hairStyle: MEN_HAIR_STYLES.some((h) => h.id === profile.hairStyle)
                            ? profile.hairStyle
                            : 'crop',
                        });
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      (profile.avatarGender || 'men') === 'men'
                        ? 'bg-[#1D6368] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>👨</span>
                    <span>Men (Athletic)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (profile.avatarGender !== 'women') {
                        updateProfile({
                          avatarGender: 'women',
                          hairStyle: WOMEN_HAIR_STYLES.some((h) => h.id === profile.hairStyle)
                            ? profile.hairStyle
                            : 'bob',
                        });
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      profile.avatarGender === 'women'
                        ? 'bg-[#1D6368] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>👩</span>
                    <span>Women (Slender)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div>
                  <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#526B65]">
                    Skin Tone
                  </span>
                  <div className="flex gap-2">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        aria-label={`Skin tone ${tone}`}
                        onClick={() => updateProfile({ skinTone: tone })}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${
                          profile.skinTone === tone
                            ? 'scale-115 border-[#159A74]'
                            : 'border-black/15'
                        }`}
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#159A74]">
                    {profile.avatarGender === 'women'
                      ? 'Graceful hips & slender waist'
                      : 'Broad shoulders & athletic chest'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {styleTab === 'hats' && (
            <div>
              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#526B65]">
                Headwear &amp; Caps
              </span>
              <div className="grid grid-cols-4 gap-2">
                {HAT_STYLES.map((hat) => (
                  <button
                    key={hat.id}
                    type="button"
                    onClick={() => updateProfile({ hatStyle: hat.id })}
                    className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                      profile.hatStyle === hat.id
                        ? 'bg-[#285958] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {hat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {styleTab === 'hair' && (
            <div className="space-y-2.5">
              {/* Men vs Women Category Toggle */}
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#526B65]">
                  Hair Style &amp; Look
                </span>
                <div className="flex rounded-xl bg-slate-100 p-0.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      const isMen = (profile.avatarGender || 'men') === 'men';
                      if (!isMen) {
                        updateProfile({
                          avatarGender: 'men',
                          hairStyle: MEN_HAIR_STYLES.some((h) => h.id === profile.hairStyle)
                            ? profile.hairStyle
                            : 'crop',
                        });
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      (profile.avatarGender || 'men') === 'men'
                        ? 'bg-[#1D6368] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span></span>
                    <span>Men</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (profile.avatarGender !== 'women') {
                        updateProfile({
                          avatarGender: 'women',
                          hairStyle: WOMEN_HAIR_STYLES.some((h) => h.id === profile.hairStyle)
                            ? profile.hairStyle
                            : 'bob',
                        });
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      profile.avatarGender === 'women'
                        ? 'bg-[#1D6368] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span></span>
                    <span>Women</span>
                  </button>
                </div>
              </div>

              {/* Hairstyle Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {(profile.avatarGender === 'women' ? WOMEN_HAIR_STYLES : MEN_HAIR_STYLES).map(
                  (h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => updateProfile({ hairStyle: h.id })}
                      className={`rounded-xl py-2 text-xs font-bold transition-all ${
                        profile.hairStyle === h.id
                          ? 'bg-[#285958] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {h.label}
                    </button>
                  )
                )}
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#526B65]">
                  Hair Shade
                </span>
                <div className="flex gap-2">
                  {HAIR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Hair color ${color}`}
                      onClick={() => updateProfile({ hairColor: color })}
                      className={`h-6 w-6 rounded-full border-2 transition-transform ${
                        profile.hairColor === color
                          ? 'scale-115 border-[#285958]'
                          : 'border-black/15'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {styleTab === 'outfit' && (
            <div className="space-y-2.5">
              <div>
                <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#526B65]">
                  Top Style &amp; Layer
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {TOP_STYLES.map((top) => {
                    const isSelected = (profile.topStyle || 'jacket') === top.id;
                    return (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => updateProfile({ topStyle: top.id })}
                        className={`flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all ${
                          isSelected
                            ? 'bg-[#285958] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span className="text-base leading-none mb-1">{top.icon}</span>
                        <span className="text-[11px] font-bold leading-tight">{top.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <div>
                  <span className="block text-[11px] font-bold text-[#1E293B]">
                    {TOP_STYLES.find((t) => t.id === (profile.topStyle || 'jacket'))?.label} Shade
                  </span>
                  <span className="text-[10px] text-[#526B65]">
                    {TOP_STYLES.find((t) => t.id === (profile.topStyle || 'jacket'))?.desc}
                  </span>
                </div>
                <div className="flex gap-2">
                  {OUTFIT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Top color ${color}`}
                      onClick={() => updateProfile({ outfitColor: color })}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        profile.outfitColor === color
                          ? 'scale-115 border-[#1E293B]'
                          : 'border-black/15'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {styleTab === 'pet' && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {PET_OPTIONS.map((pet) => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => updateProfile({ petSpecies: pet.id })}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold ${
                      profile.petSpecies === pet.id
                        ? 'bg-[#285958] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: pet.badgeColor }}
                    />
                    <span>{pet.label}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                maxLength={18}
                value={profile.petName}
                onChange={(e) => updateProfile({ petName: e.target.value })}
                aria-label="Pet Name"
                placeholder="Pet name"
                className="w-28 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-[#285958] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Pokémon GO-Style Filled Category Icon Bar (`uploaded_media_1_1792237409210.png`) */}
        <div className="grid grid-cols-6 border-t border-slate-200/80 px-2 py-2">
          {[
            { id: 'hair' as StyleTab, label: 'HAIR' },
            { id: 'featured' as StyleTab, label: 'FEATURED', isNew: true },
            { id: 'body' as StyleTab, label: 'POSES' },
            { id: 'hats' as StyleTab, label: 'HATS' },
            { id: 'outfit' as StyleTab, label: 'TOPS' },
            { id: 'pet' as StyleTab, label: 'BUDDY' },
          ].map((tab) => {
            const active = styleTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStyleTab(tab.id);
                  setUIMode(tab.id === 'pet' ? 'onboarding-pet' : 'onboarding-avatar');
                }}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-1 transition-transform ${
                  active ? 'scale-105 bg-[#E8F6F5]' : 'hover:bg-slate-50'
                }`}
              >
                <PokemonGoCategoryIcon id={tab.id} active={active} />
                {tab.isNew && (
                  <span className="absolute right-1.5 top-4 rounded-full border border-[#EAB338]/60 bg-white px-1.5 py-0.2 text-[7px] font-black text-[#D99B26] shadow-sm">
                    NEW
                  </span>
                )}
                <span
                  className={`text-[9px] font-extrabold tracking-wider ${
                    active ? 'text-[#1D6368]' : 'text-[#5C7A7C]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Sage-Slate Bar with Circular Confirm Button */}
        <div className="flex items-center justify-center bg-[#7D9282] py-2.5">
          <button
            type="button"
            onClick={() => {
              updateProfile({ onboardingComplete: true });
              setUIMode('explore');
            }}
            aria-label="Confirm style and enter NAVDEX Campus World"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/85 bg-white/15 text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
