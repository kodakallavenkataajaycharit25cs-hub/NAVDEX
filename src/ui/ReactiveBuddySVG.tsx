import React from 'react';

export type BuddyMood = 'idle' | 'tracking' | 'covering-eyes' | 'peeking' | 'error';

interface ReactiveBuddySVGProps {
  mood: BuddyMood;
  lookOffset: number; // -1..1 horizontal eye tracking
  skinTone: string;
  outfitColor: string;
  hairColor: string;
}

/**
 * Stylish Anime Trainer & Companion Stage (`ReactiveBuddySVG.tsx`)
 * Modeled after the reference character & reduced-glow companion:
 * - Mature teen anime trainer with open camp-collar button-up shirt and chest flap pockets
 * - Voluminous curly anime hair framing the forehead and crown
 * - Blue athletic fingerless gloves with white cuffs for Watch, Cover-Eyes, and Peek interactions
 * - Reduced-Glow cute Mint Melody companion with clear mini piano keyboard
 * - Full-width curved scoop stage (`\_____/`) matching the wireframe layout
 */
export const ReactiveBuddySVG: React.FC<ReactiveBuddySVGProps> = ({
  mood,
  lookOffset,
  skinTone,
  outfitColor,
  hairColor,
}) => {
  const isCovering = mood === 'covering-eyes';
  const isPeeking = mood === 'peeking';
  const isError = mood === 'error';
  const isWatching = !isCovering && !isPeeking;

  const clampedOffset = Math.max(-1, Math.min(1, lookOffset));
  const headShiftX = isWatching ? clampedOffset * 5 : isPeeking ? -2 : 0;
  const headTiltDeg = isPeeking ? -4 : isWatching ? clampedOffset * 3 : 0;
  const pupilX = isWatching ? clampedOffset * 4.5 : isPeeking ? 2.0 : 0;
  const pupilY = isWatching ? 2.5 : isPeeking ? 1.5 : 0;

  return (
    <div
      className={`relative w-full select-none overflow-hidden ${
        isError ? 'animate-shake' : ''
      }`}
    >
      <svg
        viewBox="0 0 400 235"
        preserveAspectRatio="xMidYMax meet"
        className="block h-[205px] w-full"
        role="img"
        aria-label={`NAVDEX Anime Trainer character (${mood})`}
      >
        <defs>
          <filter id="softCharShadow" x="-15%" y="-15%" width="130%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#132A15" floodOpacity="0.22" />
          </filter>
          <filter id="armLiftShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#132A15" floodOpacity="0.25" />
          </filter>
          <radialGradient id="claySheen" cx="35%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#1A0F0A" stopOpacity="0.14" />
          </radialGradient>
          <linearGradient id="mintPetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D1FAE5" />
            <stop offset="60%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
          {/* Smooth downward-curving scoop clip */}
          <clipPath id="scoopStageClip">
            <path d="M 0 0 L 400 0 L 400 182 Q 200 236 0 182 Z" />
          </clipPath>
        </defs>

        {/* ==============================================================
            STAGE CONTENT CLIPPED TO THE SMOOTH CURVED SCOOP (`\_____/`)
           ============================================================== */}
        <g clipPath="url(#scoopStageClip)">
          {/* Subtle Topographic Woodland Trail Ribbons in the Sky */}
          <path
            d="M -20 65 C 85 20, 140 125, 250 55 C 330 5, 370 85, 420 45"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeOpacity="0.16"
          />
          <path
            d="M -10 145 C 90 105, 290 165, 415 110"
            fill="none"
            stroke="#F2C12E"
            strokeWidth="2.0"
            strokeOpacity="0.28"
          />

          {/* ==============================================================
              REDUCED-GLOW MINT MELODY COMPANION PET CAMEO
              (Gentle pastel clay, no blown-out glare, crisp eyes & mini piano)
             ============================================================== */}
          <g
            style={{
              transform: `translate(${isWatching ? clampedOffset * 2.5 : 0}px, ${
                isCovering ? -2 : 0
              }px)`,
              transition: 'transform 300ms ease-out',
            }}
          >
            {/* Subtle Soft Drop Shadow */}
            <ellipse cx="316" cy="178" rx="28" ry="8" fill="#1D2440" fillOpacity="0.2" />

            {/* Left & Right Bear / Spirit Ears */}
            <circle cx="294" cy="120" r="12.5" fill="url(#mintPetGrad)" />
            <ellipse cx="292" cy="120" rx="5.5" ry="7" transform="rotate(-18 292 120)" fill="#34D399" />

            <circle cx="340" cy="128" r="12.5" fill="url(#mintPetGrad)" />
            <ellipse cx="340" cy="129" rx="6" ry="6" fill="#34D399" />

            {/* Main Crisp Mochi-Spirit Clay Body (No blinding aura shells!) */}
            <circle cx="316" cy="148" r="27" fill="url(#mintPetGrad)" />
            <circle cx="316" cy="148" r="27" fill="url(#claySheen)" />

            {/* Musical Eighth-Note (`♪`) Antenna */}
            <g transform="translate(322, 102) rotate(14)">
              <line x1="0" y1="16" x2="0" y2="0" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 0 0 C 7 1, 12 5, 10 12 C 7 8, 3 6, 0 6 Z" fill="#10B981" />
            </g>

            {/* Clear Black Bead Eyes with Catchlights (Crisp & cute!) */}
            <g
              style={{
                transform: `translate(${pupilX * 0.5}px, ${pupilY * 0.4}px)`,
                transition: 'transform 140ms ease-out',
              }}
            >
              <circle cx="306" cy="144" r="3.2" fill="#0F172A" />
              <circle cx="305" cy="143" r="1" fill="#FFFFFF" />
              <circle cx="319" cy="144" r="3.2" fill="#0F172A" />
              <circle cx="318" cy="143" r="1" fill="#FFFFFF" />
            </g>

            {/* Rosy Blush Cheeks */}
            <ellipse cx="298" cy="150" rx="4" ry="2.5" fill="#F47280" fillOpacity="0.6" />
            <ellipse cx="327" cy="150" rx="4" ry="2.5" fill="#F47280" fillOpacity="0.6" />

            {/* Coral-Pink Mini Piano Keyboard with Clear White & Black Keys */}
            <g
              style={{
                transform: isCovering
                  ? 'translate(-2px, -20px) rotate(-6deg)'
                  : isPeeking
                  ? 'translate(3px, -12px) rotate(6deg)'
                  : 'translate(0px, 0px) rotate(-10deg)',
                transformOrigin: '312px 164px',
                transition: 'transform 360ms cubic-bezier(0.34, 1.48, 0.64, 1)',
              }}
            >
              <rect x="286" y="156" width="48" height="18" rx="5" fill="#FB7185" stroke="#F43F5E" strokeWidth="1" />
              <rect x="292" y="159" width="36" height="9" rx="1.5" fill="#FFFFFF" />
              {[296, 301, 306, 311, 316, 321].map((kx) => (
                <rect key={kx} x={kx} y="159" width="2.2" height="5.5" rx="0.5" fill="#0F172A" />
              ))}
            </g>
          </g>

          {/* ==============================================================
              ANIME TRAINER TORSO: WHITE OPEN CAMP-COLLAR BUTTON-UP SHIRT
              (With chest flap pockets, matching the reference image!)
             ============================================================== */}
          <g filter="url(#softCharShadow)">
            {/* Defined Neck + Clavicle Shadow */}
            <rect x="182" y="120" width="24" height="28" rx="8" fill={skinTone} />
            <ellipse cx="194" cy="126" rx="11" ry="5" fill="#1A0F0A" fillOpacity="0.18" />

            {/* Open Chest V-Neck area */}
            <polygon points="187,136 201,136 194,152" fill={skinTone} />

            {/* Main Camp Shirt Body (Crisp white or user outfitColor) */}
            <path
              d="M 126 156 C 132 136, 158 134, 194 134 C 230 134, 256 136, 262 156 L 272 232 L 116 232 Z"
              fill={outfitColor || '#FFFFFF'}
            />
            <path
              d="M 126 156 C 132 136, 158 134, 194 134 C 230 134, 256 136, 262 156 L 272 232 L 116 232 Z"
              fill="url(#claySheen)"
            />

            {/* Crisp Open Camp-Collar Lapels */}
            <path
              d="M 174 134 L 194 154 L 180 158 L 162 140 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <path
              d="M 214 134 L 194 154 L 208 158 L 226 140 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />

            {/* Front Button Placket Stripe */}
            <line x1="194" y1="154" x2="194" y2="232" stroke="#E2E8F0" strokeWidth="2.5" />
            {[172, 196, 220].map((by) => (
              <circle key={by} cx="194" cy={by} r="2" fill="#334155" />
            ))}

            {/* Left Chest Flap Pocket with Button */}
            <g transform="translate(142, 164)">
              <rect x="0" y="0" width="24" height="26" rx="2" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />
              <rect x="-1" y="-1" width="26" height="8" rx="2" fill="#F1F5F9" />
              <circle cx="12" cy="3" r="1.5" fill="#334155" />
            </g>

            {/* Right Chest Flap Pocket with Button */}
            <g transform="translate(222, 164)">
              <rect x="0" y="0" width="24" height="26" rx="2" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />
              <rect x="-1" y="-1" width="26" height="8" rx="2" fill="#F1F5F9" />
              <circle cx="12" cy="3" r="1.5" fill="#334155" />
            </g>
          </g>

          {/* ==============================================================
              ANIME TRAINER HEAD, CURLY HAIR & EXPRESSIVE FACE
             ============================================================== */}
          <g
            filter="url(#softCharShadow)"
            style={{
              transform: `translate(${headShiftX}px, 0px) rotate(${headTiltDeg}deg)`,
              transformOrigin: '194px 84px',
              transition: 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Back Tousled Curls framing nape and crown */}
            <g fill={hairColor}>
              <circle cx="148" cy="68" r="15" />
              <circle cx="144" cy="84" r="13" />
              <circle cx="240" cy="68" r="15" />
              <circle cx="244" cy="84" r="13" />
              <circle cx="194" cy="42" r="18" />
              <circle cx="172" cy="46" r="16" />
              <circle cx="216" cy="46" r="16" />
            </g>

            {/* Sculpted Ears */}
            <circle cx="146" cy="88" r="9.5" fill={skinTone} />
            <circle cx="147" cy="88" r="4.5" fill="#E07A5F" fillOpacity="0.5" />
            <circle cx="242" cy="88" r="9.5" fill={skinTone} />
            <circle cx="241" cy="88" r="4.5" fill="#E07A5F" fillOpacity="0.5" />

            {/* Sculpted Anime Head (Defined jaw, heroic proportions) */}
            <path
              d="M 152 64 C 152 48, 236 48, 236 64 L 234 94 C 232 114, 212 126, 194 128 C 176 126, 156 114, 154 94 Z"
              fill={skinTone}
            />
            <path
              d="M 152 64 C 152 48, 236 48, 236 64 L 234 94 C 232 114, 212 126, 194 128 C 176 126, 156 114, 154 94 Z"
              fill="url(#claySheen)"
            />

            {/* Expressive Arched Anime Eyebrows */}
            <path
              d={
                isCovering
                  ? 'M 166 74 Q 176 77 185 75'
                  : 'M 165 72 Q 176 67 185 71'
              }
              fill="none"
              stroke={hairColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d={
                isPeeking
                  ? 'M 203 66 Q 214 59 224 65' // Raised inquisitive eyebrow when peeking!
                  : isCovering
                  ? 'M 203 75 Q 212 77 222 74'
                  : 'M 203 71 Q 213 67 223 72'
              }
              fill="none"
              stroke={hairColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Expressive Anime Eyes (White sclera, dark warm iris, bright dual catchlights) */}
            {/* Left Eye */}
            <g>
              <ellipse cx="175" cy="85" rx="8.5" ry="9" fill="#FFFFFF" />
              <g
                style={{
                  transform: `translate(${pupilX}px, ${pupilY}px)`,
                  transition: 'transform 120ms ease-out',
                }}
              >
                <circle cx="175" cy="85" r="5.2" fill="#2B1A0E" />
                <circle cx="173.2" cy="83" r="1.9" fill="#FFFFFF" />
                <circle cx="176.8" cy="87" r="0.9" fill="#FFFFFF" />
              </g>
            </g>

            {/* Right Eye (Opens wide when peeking!) */}
            <g>
              <ellipse
                cx="213"
                cy="85"
                rx={isPeeking ? 9.5 : 8.5}
                ry={isPeeking ? 10 : 9}
                fill="#FFFFFF"
              />
              <g
                style={{
                  transform: `translate(${pupilX}px, ${pupilY}px)`,
                  transition: 'transform 120ms ease-out',
                }}
              >
                <circle cx="213" cy="85" r={isPeeking ? 5.8 : 5.2} fill="#2B1A0E" />
                <circle cx="211.2" cy="83" r="2.0" fill="#FFFFFF" />
                <circle cx="214.8" cy="87" r="1.0" fill="#FFFFFF" />
              </g>
            </g>

            {/* Subtle Defined Nose */}
            <ellipse cx="194" cy="93" rx="3.5" ry="2.5" fill="#B86B40" fillOpacity="0.5" />
            <ellipse cx="194" cy="92" rx="3" ry="2.2" fill={skinTone} />

            {/* Confident Friendly Smirk / Smile */}
            {isError ? (
              <path d="M 186 107 Q 194 102 202 107" fill="none" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" />
            ) : isCovering ? (
              <ellipse cx="194" cy="105" rx="4.2" ry="3.2" fill="#991B1B" stroke="#18181B" strokeWidth="2" />
            ) : isPeeking ? (
              <path d="M 186 103 Q 195 111 206 102" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <path d="M 186 103 Q 195 110 205 103" fill="none" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            )}

            {/* Voluminous Curly Locks Framing Forehead and Temples (Matches reference bangs!) */}
            <g fill={hairColor}>
              <circle cx="158" cy="56" r="11" />
              <circle cx="174" cy="52" r="12" />
              <circle cx="194" cy="50" r="12.5" />
              <circle cx="214" cy="52" r="12" />
              <circle cx="230" cy="56" r="11" />
              {/* Forehead curl clumps */}
              <circle cx="168" cy="62" r="7.5" />
              <circle cx="186" cy="58" r="8" />
              <circle cx="204" cy="59" r="8" />
              <circle cx="220" cy="63" r="7.5" />
            </g>
          </g>
        </g>

        {/* ==============================================================
            SMOOTH DOWNWARD-CURVING SCOOP DIVIDER LINE (`\_____/`)
           ============================================================== */}
        <path d="M 0 182 Q 200 236 400 182 L 400 240 L 0 240 Z" fill="#53AC59" />
        <path d="M 0 182 Q 200 236 400 182" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeOpacity="0.85" />

        {/* ==============================================================
            BLUE FINGERLESS ATHLETIC GLOVES WITH WHITE WRISTBANDS
            (Direct match to the gloves in the user reference image!)
           ============================================================== */}

        {/* LEFT GLOVE HAND (Resting on ledge or sweeping up to cover eyes) */}
        <g
          filter="url(#armLiftShadow)"
          style={{
            transform: isWatching
              ? `translate(${clampedOffset * 2.5}px, 0px)`
              : 'translate(22px, -96px) rotate(24deg)',
            transformOrigin: '148px 190px',
            transition: 'transform 380ms cubic-bezier(0.34, 1.46, 0.64, 1)',
          }}
        >
          {/* Bare Forearm (Visible when lifted) */}
          <path d="M 124 228 L 134 186 L 158 190 L 150 232 Z" fill={skinTone} opacity={isWatching ? 0 : 1} />
          {/* White Wristband Cuff */}
          <rect x="130" y="181" width="30" height="7" rx="3.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Royal Blue Fingerless Glove Body */}
          <path
            d="M 132 178 C 132 166, 142 160, 153 162 C 161 163, 166 170, 165 180 C 169 176, 174 178, 173 184 C 171 190, 162 194, 148 194 C 136 194, 132 188, 132 178 Z"
            fill="#2563EB"
            stroke="#1D4ED8"
            strokeWidth="1.2"
          />
          {/* Bare Finger Tips poking out of the fingerless glove */}
          <ellipse cx="144" cy="160" rx="3" ry="3.5" fill={skinTone} />
          <ellipse cx="152" cy="159" rx="3" ry="3.5" fill={skinTone} />
          <ellipse cx="160" cy="161" rx="3" ry="3.5" fill={skinTone} />
        </g>

        {/* RIGHT GLOVE HAND (Lowers to cheek when peeking!) */}
        <g
          filter="url(#armLiftShadow)"
          style={{
            transform: isWatching
              ? `translate(${clampedOffset * 2.5}px, 0px)`
              : isPeeking
              ? 'translate(-4px, -66px) rotate(-8deg)' // Lowers below right eye so eye peeks!
              : 'translate(-22px, -96px) rotate(-24deg)',
            transformOrigin: '240px 190px',
            transition: 'transform 380ms cubic-bezier(0.34, 1.46, 0.64, 1)',
          }}
        >
          {/* Bare Forearm */}
          <path d="M 264 228 L 254 186 L 230 190 L 238 232 Z" fill={skinTone} opacity={isWatching ? 0 : 1} />
          {/* White Wristband Cuff */}
          <rect x="228" y="181" width="30" height="7" rx="3.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Royal Blue Fingerless Glove Body */}
          <path
            d="M 256 178 C 256 166, 246 160, 235 162 C 227 163, 222 170, 223 180 C 219 176, 214 178, 215 184 C 217 190, 226 194, 240 194 C 252 194, 256 188, 256 178 Z"
            fill="#2563EB"
            stroke="#1D4ED8"
            strokeWidth="1.2"
          />
          {/* Bare Finger Tips */}
          <ellipse cx="244" cy="160" rx="3" ry="3.5" fill={skinTone} />
          <ellipse cx="236" cy="159" rx="3" ry="3.5" fill={skinTone} />
          <ellipse cx="228" cy="161" rx="3" ry="3.5" fill={skinTone} />
        </g>
      </svg>
    </div>
  );
};
