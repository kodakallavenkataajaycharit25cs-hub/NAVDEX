export type PixelDirection = 'down' | 'up' | 'left' | 'right';
export type PixelAnimState = 'idle' | 'walk' | 'celebrate' | 'sit';

export type PixelBodyStyle = 'normal' | 'petite';

export type PixelHairStyle =
  | 'crop'
  | 'pompadour'
  | 'spiky'
  | 'buzz'
  | 'bob'
  | 'ponytail'
  | 'wavy'
  | 'buns'
  | 'curly'
  | 'messy';

export type PixelTopStyle = 'tshirt' | 'hoodie' | 'jacket' | 'shirt';
export type PixelPantsStyle = 'jeans' | 'shorts' | 'slacks' | 'skirt';
export type PixelShoesStyle = 'sneakers' | 'boots' | 'sandals';
export type PixelHatStyle = 'none' | 'cap' | 'beanie' | 'headphones' | 'glasses' | 'sprout';
export type PixelBackpackStyle = 'none' | 'backpack' | 'sling';
export type PixelPetSpecies = 'dog' | 'cat' | 'bunny';
export type PixelPetState = 'follow' | 'idle' | 'walk' | 'run' | 'sit' | 'celebrate';

export interface PixelCharacterConfig {
  body: PixelBodyStyle;
  skinTone: string;
  hairStyle: PixelHairStyle;
  hairColor: string;
  shirtStyle: PixelTopStyle;
  shirtColor: string;
  pantsStyle: PixelPantsStyle;
  pantsColor: string;
  shoesStyle: PixelShoesStyle;
  shoesColor: string;
  accessory: PixelHatStyle;
  accessoryColor: string;
  backpack: PixelBackpackStyle;
  backpackColor: string;
  petSpecies: PixelPetSpecies;
  petName: string;
}

export const DEFAULT_PIXEL_CONFIG: PixelCharacterConfig = {
  body: 'normal',
  skinTone: '#F4C29F',
  hairStyle: 'messy',
  hairColor: '#241C16',
  shirtStyle: 'hoodie',
  shirtColor: '#5A4FE8',
  pantsStyle: 'jeans',
  pantsColor: '#1E293B',
  shoesStyle: 'sneakers',
  shoesColor: '#FFFFFF',
  accessory: 'headphones',
  accessoryColor: '#F59E0B',
  backpack: 'backpack',
  backpackColor: '#E11D48',
  petSpecies: 'dog',
  petName: 'Mochi',
};

export function profileToPixelConfig(profile: any): PixelCharacterConfig {
  const p = profile || {};
  let hair: PixelHairStyle = 'messy';
  if (p.hairStyle === 'crop' || p.hairStyle === 'pompadour' || p.hairStyle === 'spiky' ||
      p.hairStyle === 'buzz' || p.hairStyle === 'bob' || p.hairStyle === 'ponytail' ||
      p.hairStyle === 'wavy' || p.hairStyle === 'buns' || p.hairStyle === 'curly') {
    hair = p.hairStyle;
  }

  let accessory: PixelHatStyle = 'none';
  if (p.hatStyle === 'cap' || p.hatStyle === 'beanie' || p.hatStyle === 'sprout') {
    accessory = p.hatStyle;
  } else if (p.accessory === 'headphones' || p.accessory === 'glasses') {
    accessory = p.accessory;
  }

  let shirt: PixelTopStyle = 'hoodie';
  if (p.topStyle === 'tshirt' || p.topStyle === 'jacket' || p.topStyle === 'shirt') {
    shirt = p.topStyle;
  }

  return {
    body: p.bodyStyle === 'chibi-b' ? 'petite' : 'normal',
    skinTone: p.skinTone || '#F4C29F',
    hairStyle: hair,
    hairColor: p.hairColor || '#241C16',
    shirtStyle: shirt,
    shirtColor: p.outfitColor || '#5A4FE8',
    pantsStyle: p.pantsStyle || 'jeans',
    pantsColor: p.pantsColor || '#1E293B',
    shoesStyle: p.shoesStyle || 'sneakers',
    shoesColor: p.shoesColor || '#FFFFFF',
    accessory: accessory,
    accessoryColor: p.accessoryColor || '#F59E0B',
    backpack: p.backpack || 'backpack',
    backpackColor: p.backpackColor || '#E11D48',
    petSpecies: p.petSpecies === 'cat' || p.petSpecies === 'bunny' ? p.petSpecies : 'dog',
    petName: p.petName || 'Mochi',
  };
}

