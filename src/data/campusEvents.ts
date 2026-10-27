export interface CampusEvent {
  id: string;
  title: string;
  placeId: string;
  timeLabel: string;
  tag: string;
  description: string;
  isLiveNow?: boolean;
}

export const SEEDED_EVENTS: CampusEvent[] = [
  {
    id: 'evt-hackathon',
    title: 'AI & Robotics Demo Day',
    placeId: 'AUDI',
    timeLabel: 'Today · 2:00 PM – 5:00 PM',
    tag: 'Showcase',
    description: 'Live student project demos, autonomous rovers, and 3D campus navigation showcase in the Main Auditorium.',
    isLiveNow: true,
  },
  {
    id: 'evt-cse-ctf',
    title: 'Midnight Capture The Flag (CTF)',
    placeId: 'CSE',
    timeLabel: 'Today · 3:30 PM – 6:30 PM',
    tag: 'Coding',
    description: 'Team cybersecurity puzzle sprint hosted on the 2nd floor of CSE Block.',
    isLiveNow: true,
  },
  {
    id: 'evt-acoustic-jam',
    title: 'Golden Hour Acoustic Jam',
    placeId: 'AT',
    timeLabel: 'Today · 4:45 PM – 6:00 PM',
    tag: 'Music',
    description: 'Unplugged indie sets and chai on the open-air Amphitheatre steps.',
    isLiveNow: false,
  },
  {
    id: 'evt-book-swap',
    title: 'Sci-Fi & Design Book Swap',
    placeId: 'LIB',
    timeLabel: 'Tomorrow · 11:00 AM – 2:00 PM',
    tag: 'Community',
    description: 'Bring a book, take a book at the Library reading courtyard.',
    isLiveNow: false,
  },
  {
    id: 'evt-startup-pitch',
    title: 'Campus Founder Pitch Clinic',
    placeId: 'MBA',
    timeLabel: 'Tomorrow · 2:30 PM – 4:30 PM',
    tag: 'Startups',
    description: '5-minute student startup pitches with alumni mentors in the MBA amphitheatre.',
    isLiveNow: false,
  },
];
