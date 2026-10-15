const AUDIUS_BASE_URL = 'https://api.audius.co/v1';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0/tracks/';
const PROVIDERS = new Set(['audius', 'jamendo']);
const INDIAN_MUSIC_QUERIES = ['Bollywood', 'Hindi', 'Punjabi', 'Indian Indie'];

const isAudiusLicenseAllowed = (license = '') =>
  /creative commons|\bcc\s*(by|0)/i.test(license) && !/no derivatives|\bnd\b/i.test(license);

const normalizeAudiusTrack = (track) => ({
  provider: 'audius',
  trackId: String(track.id),
  title: track.title || 'Untitled',
  artist: track.user?.name || track.user?.handle || 'Unknown artist',
  artworkUrl: track.artwork?.['480x480'] || track.artwork?.['150x150'] || '',
  sourceUrl: `https://audius.co${track.permalink || ''}`,
  license: track.license || '',
  licenseUrl: 'https://creativecommons.org/share-your-work/cclicenses/',
  duration: Number(track.duration) || 0,
  canUseInPost: isAudiusLicenseAllowed(track.license),
  streamUrl: `/api/community/music/audius/${encodeURIComponent(track.id)}/stream`
});

const getJamendoLicenseUrl = (track) => track.license_ccurl || track.license?.ccurl || '';

const normalizeJamendoTrack = (track) => ({
  provider: 'jamendo',
  trackId: String(track.id),
  title: track.name || 'Untitled',
  artist: track.artist_name || 'Unknown artist',
  artworkUrl: track.image || track.album_image || '',
  sourceUrl: track.shareurl || `https://www.jamendo.com/track/${track.id}`,
  license: getJamendoLicenseUrl(track) || 'Creative Commons',
  licenseUrl: getJamendoLicenseUrl(track),
  duration: Number(track.duration) || 0,
  streamUrl: `/api/community/music/jamendo/${encodeURIComponent(track.id)}/stream`
});

async function requestJson(url, provider) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${provider} request failed (${response.status})`);
  return response.json();
}

async function getAudiusTrack(trackId, requireSoundtrackLicense = true) {
  const url = new URL(`${AUDIUS_BASE_URL}/tracks/${encodeURIComponent(trackId)}`);
  url.searchParams.set('app_name', 'Codingo');
  const payload = await requestJson(url, 'Audius');
  const track = payload.data;
  if (!track?.is_streamable || (requireSoundtrackLicense && !isAudiusLicenseAllowed(track.license))) {
    throw new Error('This Audius track is not licensed for post soundtracks');
  }
  return track;
}

async function getJamendoTrack(trackId) {
  if (!process.env.JAMENDO_CLIENT_ID) throw new Error('Jamendo is not configured');
  const url = new URL(JAMENDO_BASE_URL);
  url.searchParams.set('client_id', process.env.JAMENDO_CLIENT_ID);
  url.searchParams.set('format', 'json');
  url.searchParams.set('id', trackId);
  url.searchParams.set('include', 'licenses');
  const payload = await requestJson(url, 'Jamendo');
  const track = payload.results?.[0];
  if (!track || /\/nd(?:\/|$)/i.test(getJamendoLicenseUrl(track))) {
    throw new Error('This Jamendo track does not allow post soundtracks');
  }
  return track;
}

async function searchAudius(query) {
  const url = new URL(`${AUDIUS_BASE_URL}/tracks/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('app_name', 'Codingo');
  const payload = await requestJson(url, 'Audius');
  console.log('[Audius API] all soundtracks:', payload.data || []);
  return (payload.data || [])
    .filter((track) => track.is_streamable && isAudiusLicenseAllowed(track.license))
    .slice(0, 12)
    .map(normalizeAudiusTrack);
}

async function getTrendingAudiusTracks() {
  const url = new URL(`${AUDIUS_BASE_URL}/tracks/trending`);
  url.searchParams.set('app_name', 'Codingo');
  url.searchParams.set('time', 'week');
  const payload = await requestJson(url, 'Audius');
  console.log('[Audius API] trending soundtracks:', payload.data || []);
  return (payload.data || [])
    .filter((track) => track.is_streamable)
    .slice(0, 25)
    .map(normalizeAudiusTrack);
}

async function getIndianAudiusTracks() {
  const searches = INDIAN_MUSIC_QUERIES.map(async (query) => {
    const url = new URL(`${AUDIUS_BASE_URL}/tracks/search`);
    url.searchParams.set('query', query);
    url.searchParams.set('app_name', 'Codingo');
    const payload = await requestJson(url, 'Audius');
    console.log(`[Audius API] ${query} soundtracks:`, payload.data || []);
    return payload.data || [];
  });
  const results = await Promise.allSettled(searches);
  const uniqueTracks = new Map();
  results.forEach((result) => {
    if (result.status !== 'fulfilled') return;
    result.value.forEach((track) => {
      if (track?.id && track.is_streamable && !uniqueTracks.has(String(track.id))) {
        uniqueTracks.set(String(track.id), track);
      }
    });
  });
  return Array.from(uniqueTracks.values()).slice(0, 40).map(normalizeAudiusTrack);
}

async function searchJamendo(query) {
  if (!process.env.JAMENDO_CLIENT_ID) return [];
  const url = new URL(JAMENDO_BASE_URL);
  url.searchParams.set('client_id', process.env.JAMENDO_CLIENT_ID);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '12');
  url.searchParams.set('search', query);
  url.searchParams.set('include', 'licenses');
  url.searchParams.set('ccnd', 'false');
  const payload = await requestJson(url, 'Jamendo');
  console.log('[Jamendo API] all soundtracks:', payload.results || []);
  return (payload.results || []).map(normalizeJamendoTrack);
}

async function searchMusicProviders(query, provider = 'all') {
  if (provider !== 'all' && !PROVIDERS.has(provider)) throw new Error('Invalid music provider');
  const searches = [];
  if (provider === 'all' || provider === 'audius') searches.push(searchAudius(query));
  if (provider === 'all' || provider === 'jamendo') searches.push(searchJamendo(query));
  const results = await Promise.allSettled(searches);
  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

async function resolveMusicSelection(selection) {
  if (!selection || !PROVIDERS.has(selection.provider) || !selection.trackId) {
    throw new Error('Invalid music selection');
  }
  const track = selection.provider === 'audius'
    ? normalizeAudiusTrack(await getAudiusTrack(selection.trackId))
    : normalizeJamendoTrack(await getJamendoTrack(selection.trackId));
  return {
    ...track,
    startTime: Math.max(0, Math.min(Number(selection.startTime) || 0, Math.max(0, track.duration - 1))),
    volume: Math.max(0, Math.min(Number(selection.volume) || 0.7, 1))
  };
}

async function getMusicStreamUrl(provider, trackId) {
  if (provider === 'audius') {
    await getAudiusTrack(trackId, false);
    return `${AUDIUS_BASE_URL}/tracks/${encodeURIComponent(trackId)}/stream?app_name=Codingo`;
  }
  if (provider === 'jamendo') {
    const track = await getJamendoTrack(trackId);
    if (!track.audio) throw new Error('Music stream not found');
    return track.audio;
  }
  throw new Error('Music provider not found');
}

module.exports = {
  getIndianAudiusTracks,
  getMusicStreamUrl,
  getTrendingAudiusTracks,
  resolveMusicSelection,
  searchMusicProviders
};