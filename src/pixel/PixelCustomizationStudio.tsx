import {
  Check,
  Compass,
  Dice5,
  Eye,
  Heart,
  Palette,
  RotateCw,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { PixelPetGenerator } from './pixelPetGenerator';
import { PixelSpriteGenerator } from './pixelSpriteGenerator';
import {
  DEFAULT_PIXEL_CONFIG,
  PixelAnimState,
  PixelBackpackStyle,
  PixelCharacterConfig,
  PixelDirection,
  PixelHairStyle,
  PixelHatStyle,
  PixelPantsStyle,
  PixelPetSpecies,
  PixelShoesStyle,
  PixelTopStyle,
  profileToPixelConfig,
} from './types';

export interface PixelCustomizationStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKIN_TONES = ['#F4C29F', '#E59866', '#B07346', '#F8D5B8', '#6E4228'];
const HAIR_COLORS = ['#241C16', '#5E3A24', '#D97736', '#FCD34D', '#1B8A6B', '#2B2438'];
const OUTFIT_COLORS = ['#5A4FE8', '#159A74', '#C8234B', '#2563EB', '#18181B', '#F59E0B'];
const PANTS_COLORS = ['#1E293B', '#334155', '#475569', '#1E1B4B', '#92400E'];
const BACKPACK_COLORS = ['#E11D48', '#2563EB', '#059669', '#D97706', '#1E293B'];

const HAIR_STYLES: Array<{ id: PixelHairStyle; label: string }> = [
  { id: 'messy', label: 'Anime Messy' },
  { id: 'crop', label: 'Textured Crop' },
  { id: 'pompadour', label: 'Pompadour' },
  { id: 'spiky', label: 'Messy Spikes' },
  { id: 'buzz', label: 'Buzz Fade' },
  { id: 'bob', label: 'Shoulder Bob' },
  { id: 'ponytail', label: 'High Ponytail' },
  { id: 'wavy', label: 'Wavy Flow' },
  { id: 'buns', label: 'Space Buns' },
  { id: 'curly', label: 'Curly Locks' },
];

const TOP_STYLES: Array<{ id: PixelTopStyle; label: string; icon: string }> = [
  { id: 'hoodie', label: 'Campus Hoodie', icon: '🥼' },
  { id: 'jacket', label: 'Track Jacket', icon: '🧥' },
  { id: 'tshirt', label: 'Active Tee', icon: '👕' },
  { id: 'shirt', label: 'Oxford Shirt', icon: '👔' },
];

const PANTS_STYLES: Array<{ id: PixelPantsStyle; label: string }> = [
  { id: 'jeans', label: 'Denim Jeans' },
  { id: 'shorts', label: 'Summer Shorts' },
  { id: 'slacks', label: 'Tailored Slacks' },
  { id: 'skirt', label: 'Pleated Skirt' },
];

const ACCESSORIES: Array<{ id: PixelHatStyle; label: string; icon: string }> = [
  { id: 'none', label: 'None', icon: '❌' },
  { id: 'headphones', label: 'Headphones', icon: '🎧' },
  { id: 'cap', label: 'Bucket Cap', icon: '🧢' },
  { id: 'beanie', label: 'Warm Beanie', icon: '🧶' },
  { id: 'glasses', label: 'Wire Glasses', icon: '👓' },
  { id: 'sprout', label: 'Leaf Sprout', icon: '🌱' },
];

const BACKPACKS: Array<{ id: PixelBackpackStyle; label: string; icon: string }> = [
  { id: 'backpack', label: 'Campus Bag', icon: '🎒' },
  { id: 'sling', label: 'Sling Pack', icon: '👜' },
  { id: 'none', label: 'No Bag', icon: '❌' },
];

const PETS: Array<{ id: PixelPetSpecies; label: string; tagline: string; emoji: string }> = [
  { id: 'dog', label: 'Pian the Dog', tagline: 'Gentle mint companion + piano', emoji: '🐶' },
  { id: 'cat', label: 'Blushy the Cat', tagline: 'Rose companion + violin', emoji: '🐱' },
  { id: 'bunny', label: 'Willow the Bunny', tagline: 'Celestial companion + synth', emoji: '🐰' },
];

export const PixelCustomizationStudio: React.FC<PixelCustomizationStudioProps> = ({
  isOpen,
  onClose,
}) => {
  const profile = useCampusStore((s) => s.profile);
  const updateProfile = useCampusStore((s) => s.updateProfile);

  const [config, setConfig] = useState<PixelCharacterConfig>(() =>
    profileToPixelConfig(profile)
  );

  const [activeTab, setActiveTab] = useState<'hair' | 'outfit' | 'accessory' | 'pet'>('hair');
  const [previewDir, setPreviewDir] = useState<PixelDirection>('down');
  const [previewAnim, setPreviewAnim] = useState<PixelAnimState>('walk');

  // Preview Canvas Ref
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync initial config whenever opened
  useEffect(() => {
    if (isOpen) {
      setConfig(profileToPixelConfig(profile));
    }
  }, [isOpen, profile]);

  // Render 4x Zoom Preview Loop
  useEffect(() => {
    if (!isOpen) return;

    let frame = 0;
    let animTimer = 0;
    let isCancelled = false;

    const render = () => {
      if (isCancelled) return;
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Background checkboard for retro studio aesthetic
          ctx.fillStyle = '#F3E8FF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 1. Render Character Frame
          const charFrame = PixelSpriteGenerator.renderFrame(
            config,
            previewDir,
            previewAnim,
            frame
          );

          // Draw scaled 4x at center
          // 32x32 scaled to 128x128
          ctx.drawImage(charFrame, 32, 20, 128, 128);

          // 2. Render Pet beside Character
          const petFrame = PixelPetGenerator.renderPetFrame(
            config.petSpecies,
            previewDir,
            previewAnim === 'walk' ? 'walk' : previewAnim === 'celebrate' ? 'celebrate' : 'idle',
            frame
          );
          // 24x24 scaled to 72x72
          ctx.drawImage(petFrame, 150, 76, 72, 72);
        }
      }

      animTimer++;
      if (animTimer % 8 === 0) {
        frame = (frame + 1) % 4;
      }
      requestAnimationFrame(render);
    };

    const handle = requestAnimationFrame(render);
    return () => {
      isCancelled = true;
      cancelAnimationFrame(handle);
    };
  }, [isOpen, config, previewDir, previewAnim]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfile({
      skinTone: config.skinTone,
      hairStyle: config.hairStyle as any,
      hairColor: config.hairColor,
      topStyle: config.shirtStyle as any,
      outfitColor: config.shirtColor,
      hatStyle:
        config.accessory === 'cap' || config.accessory === 'beanie' || config.accessory === 'sprout'
          ? config.accessory
          : 'none',
      petSpecies: config.petSpecies,
      petName: config.petName,
      onboardingComplete: true,
    });
    onClose();
  };

  const randomize = () => {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setConfig({
      ...config,
      skinTone: randomItem(SKIN_TONES),
      hairStyle: randomItem(HAIR_STYLES).id,
      hairColor: randomItem(HAIR_COLORS),
      shirtStyle: randomItem(TOP_STYLES).id,
      shirtColor: randomItem(OUTFIT_COLORS),
      pantsStyle: randomItem(PANTS_STYLES).id,
      pantsColor: randomItem(PANTS_COLORS),
      accessory: randomItem(ACCESSORIES).id,
      backpack: randomItem(BACKPACKS).id,
      backpackColor: randomItem(BACKPACK_COLORS),
    });
  };

  const applyPreset = (presetName: string) => {
    if (presetName === 'trainer') {
      setConfig({
        ...config,
        hairStyle: 'crop',
        hairColor: '#241C16',
        shirtStyle: 'tshirt',
        shirtColor: '#FFFFFF',
        pantsStyle: 'jeans',
        pantsColor: '#1E293B',
        accessory: 'cap',
        backpack: 'backpack',
        backpackColor: '#E11D48',
      });
    } else if (presetName === 'scout') {
      setConfig({
        ...config,
        hairStyle: 'pompadour',
        hairColor: '#5E3A24',
        shirtStyle: 'jacket',
        shirtColor: '#159A74',
        pantsStyle: 'shorts',
        pantsColor: '#92400E',
        accessory: 'beanie',
        backpack: 'backpack',
        backpackColor: '#D97706',
      });
    } else if (presetName === 'scholar') {
      setConfig({
        ...config,
        hairStyle: 'messy',
        hairColor: '#2B2438',
        shirtStyle: 'hoodie',
        shirtColor: '#5A4FE8',
        pantsStyle: 'jeans',
        pantsColor: '#1E1B4B',
        accessory: 'headphones',
        backpack: 'sling',
        backpackColor: '#2563EB',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-pink-50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#5A4FE8] text-white">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#1D2440] font-fredoka">
                Pixel Character Studio
              </h2>
              <p className="text-xs text-slate-500">
                Modular 2D sprite generator & pet companion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Live 4x Preview Box */}
          <div className="relative flex flex-col items-center bg-[#FAF5FF] border border-purple-200/80 rounded-2xl p-3 shadow-inner">
            <canvas
              ref={previewCanvasRef}
              width={240}
              height={160}
              className="w-60 h-40 rounded-xl shadow-md border border-purple-300"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Preview Direction & Animation Toggles */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center bg-white rounded-lg p-0.5 border border-purple-200 text-xs shadow-sm">
                {(['down', 'left', 'up', 'right'] as PixelDirection[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setPreviewDir(d)}
                    className={`px-2 py-1 rounded font-medium capitalize ${
                      previewDir === d
                        ? 'bg-[#5A4FE8] text-white'
                        : 'text-slate-600 hover:bg-purple-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-white rounded-lg p-0.5 border border-purple-200 text-xs shadow-sm">
                {(['idle', 'walk', 'celebrate'] as PixelAnimState[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setPreviewAnim(a)}
                    className={`px-2 py-1 rounded font-medium capitalize ${
                      previewAnim === a
                        ? 'bg-[#EC4899] text-white'
                        : 'text-slate-600 hover:bg-pink-50'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <button
                onClick={randomize}
                title="Randomize Look"
                className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:scale-95 transition-transform"
              >
                <Dice5 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Presets:
            </span>
            <button
              onClick={() => applyPreset('trainer')}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
            >
              🧢 Trainer
            </button>
            <button
              onClick={() => applyPreset('scout')}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            >
              🏕️ Scout
            </button>
            <button
              onClick={() => applyPreset('scholar')}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              🎧 Scholar
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('hair')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'hair'
                  ? 'border-[#5A4FE8] text-[#5A4FE8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Hair & Face
            </button>
            <button
              onClick={() => setActiveTab('outfit')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'outfit'
                  ? 'border-[#5A4FE8] text-[#5A4FE8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Outfit
            </button>
            <button
              onClick={() => setActiveTab('accessory')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'accessory'
                  ? 'border-[#5A4FE8] text-[#5A4FE8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Accessories
            </button>
            <button
              onClick={() => setActiveTab('pet')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === 'pet'
                  ? 'border-[#5A4FE8] text-[#5A4FE8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Pet Companion
            </button>
          </div>

          {/* TAB 1: HAIR & FACE */}
          {activeTab === 'hair' && (
            <div className="flex flex-col gap-3">
              {/* Skin Tone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Skin Tone
                </label>
                <div className="flex gap-2">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setConfig({ ...config, skinTone: tone })}
                      style={{ backgroundColor: tone }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        config.skinTone === tone
                          ? 'border-[#5A4FE8] scale-110 shadow-sm'
                          : 'border-white hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Hair Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HAIR_STYLES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setConfig({ ...config, hairStyle: h.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                        config.hairStyle === h.id
                          ? 'border-[#5A4FE8] bg-purple-50 text-[#5A4FE8] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Hair Color
                </label>
                <div className="flex gap-2">
                  {HAIR_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setConfig({ ...config, hairColor: col })}
                      style={{ backgroundColor: col }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        config.hairColor === col
                          ? 'border-[#5A4FE8] scale-110 shadow-sm'
                          : 'border-white hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OUTFIT */}
          {activeTab === 'outfit' && (
            <div className="flex flex-col gap-3">
              {/* Top Style */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Top Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TOP_STYLES.map((top) => (
                    <button
                      key={top.id}
                      onClick={() => setConfig({ ...config, shirtStyle: top.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border flex items-center gap-2 transition-all ${
                        config.shirtStyle === top.id
                          ? 'border-[#5A4FE8] bg-purple-50 text-[#5A4FE8] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{top.icon}</span>
                      <span>{top.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Shirt Color
                </label>
                <div className="flex gap-2">
                  {OUTFIT_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setConfig({ ...config, shirtColor: col })}
                      style={{ backgroundColor: col }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        config.shirtColor === col
                          ? 'border-[#5A4FE8] scale-110 shadow-sm'
                          : 'border-white hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pants Style */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Pants Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PANTS_STYLES.map((pants) => (
                    <button
                      key={pants.id}
                      onClick={() => setConfig({ ...config, pantsStyle: pants.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                        config.pantsStyle === pants.id
                          ? 'border-[#5A4FE8] bg-purple-50 text-[#5A4FE8] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {pants.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pants Color */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Pants Color
                </label>
                <div className="flex gap-2">
                  {PANTS_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setConfig({ ...config, pantsColor: col })}
                      style={{ backgroundColor: col }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        config.pantsColor === col
                          ? 'border-[#5A4FE8] scale-110 shadow-sm'
                          : 'border-white hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCESSORIES & BAGS */}
          {activeTab === 'accessory' && (
            <div className="flex flex-col gap-3">
              {/* Head Accessory */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Headwear & Accessories
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setConfig({ ...config, accessory: acc.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border flex items-center gap-2 transition-all ${
                        config.accessory === acc.id
                          ? 'border-[#5A4FE8] bg-purple-50 text-[#5A4FE8] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{acc.icon}</span>
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Backpack */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Backpack Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BACKPACKS.map((bp) => (
                    <button
                      key={bp.id}
                      onClick={() => setConfig({ ...config, backpack: bp.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border flex flex-col items-center gap-1 transition-all ${
                        config.backpack === bp.id
                          ? 'border-[#5A4FE8] bg-purple-50 text-[#5A4FE8] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{bp.icon}</span>
                      <span>{bp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Backpack Color */}
              {config.backpack !== 'none' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Backpack Color
                  </label>
                  <div className="flex gap-2">
                    {BACKPACK_COLORS.map((col) => (
                      <button
                        key={col}
                        onClick={() => setConfig({ ...config, backpackColor: col })}
                        style={{ backgroundColor: col }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          config.backpackColor === col
                            ? 'border-[#5A4FE8] scale-110 shadow-sm'
                            : 'border-white hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PET COMPANION */}
          {activeTab === 'pet' && (
            <div className="flex flex-col gap-3">
              {/* Pet Species */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Choose Your Companion
                </label>
                <div className="flex flex-col gap-2">
                  {PETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setConfig({ ...config, petSpecies: p.id })}
                      className={`px-3 py-2.5 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                        config.petSpecies === p.id
                          ? 'border-[#5A4FE8] bg-purple-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl p-2 rounded-xl bg-white shadow-sm">
                        {p.emoji}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-[#1D2440]">{p.label}</div>
                        <div className="text-[11px] text-slate-500">{p.tagline}</div>
                      </div>
                      {config.petSpecies === p.id && (
                        <Check className="w-5 h-5 text-[#5A4FE8]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pet Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Pet Name
                </label>
                <input
                  type="text"
                  value={config.petName}
                  maxLength={16}
                  onChange={(e) => setConfig({ ...config, petName: e.target.value })}
                  placeholder="Companion Name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#5A4FE8]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-[#5A4FE8] text-white shadow-md hover:bg-[#4D42D0] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save & Explore Campus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
