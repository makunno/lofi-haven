export type EffectKind = 'rain' | 'aurora' | 'city' | 'snow' | 'embers' | 'ocean'
export type SourceKind = 'radio' | 'youtube'

export interface Room {
  id: string
  name: string
  emoji: string
  description: string
  source: SourceKind
  streamUrl?: string
  youtubePlaylistId?: string
  accent: string
  effect: EffectKind
  tags: string[]
  tracks: string[]
}

const TRACKS: Record<string, string[]> = {
  rain: [
    'Rainy Window Pane',
    'Coffee and Thunder',
    'Drops on Glass',
    'Midnight Drizzle',
    'Umbrella Daydream',
    'Wet Pavement Glow',
    'Slow Rain Waltz',
    'Chill Under the Eaves',
    'Grey Sky Serenade',
    'Puddle Reflections',
  ],
  aurora: [
    'Northern Light Loop',
    'Drifting Nebula',
    'Aurora Borealis',
    'Starfield Static',
    'Polar Night',
    'Green Sky Ripple',
    'Celestial Drift',
    'Magnetosphere',
    'Nightglow',
    'Constellation Waltz',
  ],
  city: [
    'Neon Sign Flicker',
    'Streetlight Jazz',
    'Subway After Midnight',
    'Concrete Reverie',
    'Roof Terrace View',
    'Taxi Headlights',
    'Billboard Static',
    'Night Shift Bossa',
    'Arcade Rain',
    'City Hum',
  ],
  snow: [
    'First Snowfall',
    'Muffled Footsteps',
    'Frost on Glass',
    'Hearth & Flannel',
    'Quiet Blizzard',
    'Icicle Melodies',
    'Pine Scent Drift',
    'Snow Globe Lullaby',
    'Whiteout Dream',
    'Steam on the Window',
  ],
  embers: [
    'Crackling Campfire',
    'Ember Glow',
    'Smoke and Stories',
    'Firelight Songs',
    'Kindling Dreams',
    'Warm Blanket Jam',
    'Sparks Rising',
    'Bonfire Nights',
    'Tinder & Tin',
    'Evening Glow Strum',
  ],
  ocean: [
    'Tide Pull',
    'Salt Air Breeze',
    'Moonlit Swell',
    'Drifting Buoy',
    'Foam Lines',
    'Harbour Lullaby',
    'Deep Current',
    'Seagull Serenade',
    'Sand Dollar Days',
    'Low Tide Reflections',
  ],
}

export const ROOMS: Room[] = [
  {
    id: 'rain',
    name: 'Midnight Rain',
    emoji: '🌧️',
    description: 'Droplets on the window, city asleep, coffee still warm.',
    source: 'youtube',
    youtubePlaylistId: 'PL6fhs6TSspZu4nYlvQ_l206FmRaMT_MGh',
    accent: '#8b9cd6',
    effect: 'rain',
    tags: ['focus', 'study', 'night'],
    tracks: TRACKS.rain,
  },
  {
    id: 'aurora',
    name: 'Aurora Drift',
    emoji: '🌌',
    description: 'Dark aurora skies, deep synth waves, and drifting northern lights.',
    source: 'youtube',
    youtubePlaylistId: 'PL5A4kOuOreGfrCdioduXGJ5ucUB2UTBjY',
    accent: '#7fb88a',
    effect: 'aurora',
    tags: ['chill', 'synth', 'night'],
    tracks: TRACKS.aurora,
  },
  {
    id: 'city',
    name: 'Neon City',
    emoji: '🌆',
    description: 'Late-night streets, neon signs, and a city that never sleeps.',
    source: 'youtube',
    youtubePlaylistId: 'PLUNz3rL3KK9W21UspvmRt3bwsKZFX73DE',
    accent: '#d4879a',
    effect: 'city',
    tags: ['urban', 'night', 'vibe'],
    tracks: TRACKS.city,
  },
  {
    id: 'snow',
    name: 'Winter Cabin',
    emoji: '❄️',
    description: 'Snowfall outside, a fire inside, nowhere to be.',
    source: 'youtube',
    youtubePlaylistId: 'PLOzDu-MXXLlg5384VEAWMzgXSdU8HFwbS',
    accent: '#a5c8dc',
    effect: 'snow',
    tags: ['warm', 'cozy', 'winter'],
    tracks: TRACKS.snow,
  },
  {
    id: 'embers',
    name: 'Campfire',
    emoji: '🏕️',
    description: 'Stories around a crackling fire under open stars.',
    source: 'youtube',
    youtubePlaylistId: 'OLAK5uy_mQEa5v-JXU-mzDSZFe7F_nbfVEPLJxTWs',
    accent: '#e8a03c',
    effect: 'embers',
    tags: ['acoustic', 'nature', 'warm'],
    tracks: TRACKS.embers,
  },
  {
    id: 'ocean',
    name: 'Shoreline',
    emoji: '🌊',
    description: 'Waves rolling in, salt air, chilled beats on a golden horizon.',
    source: 'youtube',
    youtubePlaylistId: 'OLAK5uy_k-CpQIWTKz2La9hQDNG8gIYipvLIvStEQ',
    accent: '#6fb7c9',
    effect: 'ocean',
    tags: ['beach', 'ambient', 'sunset'],
    tracks: TRACKS.ocean,
  },
]

export function getRoom(id: string): Room {
  return ROOMS.find((r) => r.id === id) ?? ROOMS[0]
}
