import { useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle, Music2, Pause, Play, Search, X } from 'lucide-react';
import api, { API_BASE_URL } from '../../lib/api';

const PROVIDERS = [
  { id: 'all', label: 'All' },
  { id: 'audius', label: 'Audius' },
  { id: 'jamendo', label: 'Jamendo' },
];

export default function MusicPickerModal({ open, selectedTrack, onClose, onSelect }) {
  const audioRef = useRef(null);
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [tracks, setTracks] = useState([]);
  const [playingId, setPlayingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showingIndianDiscovery, setShowingIndianDiscovery] = useState(false);

  const fetchIndianMusic = async () => {
    setLoading(true);
    setError('');
    setShowingIndianDiscovery(true);
    try {
      const { data } = await api.get('/api/community/music/discover/indian');
      const indianTracks = data.tracks || [];
      console.log('[MusicPickerModal] Audius Indian tracks:', indianTracks);
      console.log('[MusicPickerModal] discovery queries:', data.queries);
      setTracks(indianTracks);
    } catch (requestError) {
      console.error('[MusicPickerModal] Indian music fetch failed:', requestError);
      setError(requestError.response?.data?.message || 'Indian music failed to load');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMusic = async (term, selectedProvider = provider) => {
    setLoading(true);
    setError('');
    setShowingIndianDiscovery(false);
    try {
      const { data } = await api.get('/api/community/music/search', {
        params: { q: term, provider: selectedProvider }
      });
      const fetchedTracks = data.tracks || [];
      console.log('[MusicPickerModal] fetched music:', fetchedTracks);
      console.log('[MusicPickerModal] providers:', data.providers);
      setTracks(fetchedTracks);
      if (!data.providers?.jamendo && selectedProvider === 'jamendo') {
        setError('Jamendo needs JAMENDO_CLIENT_ID on the server.');
      }
    } catch (requestError) {
      console.error('[MusicPickerModal] music fetch failed:', requestError);
      setError(requestError.response?.data?.message || 'Music search failed');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => audioRef.current?.pause(), []);
  useEffect(() => {
    if (open) {
      setQuery('');
      setProvider('audius');
      fetchIndianMusic();
    } else {
      audioRef.current?.pause();
      setPlayingId('');
    }
  }, [open]);

  if (!open) return null;

  const search = async (event) => {
    event?.preventDefault();
    const term = query.trim();
    if (term.length < 2) return setError('Enter at least 2 characters');
    await fetchMusic(term);
  };

  const togglePreview = async (track) => {
    if (playingId === track.trackId) {
      audioRef.current?.pause();
      setPlayingId('');
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(`${API_BASE_URL}${track.streamUrl}`);
    audio.volume = 0.65;
    audio.onended = () => setPlayingId('');
    audio.onerror = () => {
      setPlayingId('');
      setError('Preview is unavailable for this track.');
    };
    audioRef.current = audio;
    setPlayingId(track.trackId);
    try {
      await audio.play();
    } catch {
      setPlayingId('');
    }
  };

  return (
    <div className="fixed inset-0 z-130 flex items-center justify-center bg-black/80 p-4" onMouseDown={onClose}>
      <section
        className="flex max-h-[82vh] w-full max-w-155 flex-col overflow-hidden rounded-lg border border-white/15 bg-[#171717] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        aria-modal="true"
        role="dialog"
        aria-label="Choose music"
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Music2 className="h-5 w-5 text-[#00e5ff]" />
          <h2 className="flex-1 font-['Syne'] text-lg font-bold text-white">Add music</h2>
          <button type="button" onClick={onClose} className="text-white/60 hover:text-white" aria-label="Close music picker">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={search} className="space-y-3 border-b border-white/10 p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tracks or artists"
                className="h-10 w-full rounded-md border border-white/15 bg-white/5 pl-9 pr-3 text-sm text-white outline-none focus:border-[#00e5ff]"
                autoFocus
              />
            </div>
            <button type="submit" className="h-10 rounded-md bg-[#00e5ff] px-4 text-sm font-bold text-black">
              Search
            </button>
          </div>
          <div className="flex gap-1" aria-label="Music provider">
            {PROVIDERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setProvider(item.id)}
                className={`h-8 px-3 text-xs font-semibold ${provider === item.id ? 'border-b-2 border-[#00e5ff] text-white' : 'text-white/50'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </form>

        <div className="min-h-60 flex-1 overflow-y-auto p-3">
          {!loading && showingIndianDiscovery && tracks.length > 0 && (
            <p className="px-3 py-2 text-xs font-semibold uppercase text-white/45">Indian music on Audius</p>
          )}
          {loading && <div className="flex h-48 items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-[#00e5ff]" /></div>}
          {!loading && error && <p className="px-2 py-4 text-sm text-[#f87171]">{error}</p>}
          {!loading && !error && tracks.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-white/40">
              <Music2 className="h-8 w-8" />
              <p className="text-sm">Search licensed music for your post</p>
            </div>
          )}
          {!loading && tracks.map((track) => {
            const selected = selectedTrack?.provider === track.provider && selectedTrack?.trackId === track.trackId;
            const canUseInPost = track.canUseInPost !== false;
            return (
              <article key={`${track.provider}-${track.trackId}`} className="flex items-center gap-3 border-b border-white/10 p-3 last:border-0">
                <button type="button" onClick={() => togglePreview(track)} className="relative h-12 w-12 flex-none overflow-hidden rounded-md bg-white/10" aria-label={`Preview ${track.title}`}>
                  {track.artworkUrl && <img src={track.artworkUrl} alt="" className="h-full w-full object-cover opacity-70" />}
                  {playingId === track.trackId ? <Pause className="absolute inset-0 m-auto h-5 w-5 text-white" /> : <Play className="absolute inset-0 m-auto h-5 w-5 text-white" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                  <p className="truncate text-xs text-white/55">{track.artist} · {track.provider}</p>
                  <a href={track.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[#00e5ff] hover:underline">
                    {canUseInPost ? (track.license || 'License and source') : 'Preview only · soundtrack license not provided'}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => { audioRef.current?.pause(); onSelect({ ...track, startTime: 0, volume: 0.7 }); onClose(); }}
                  disabled={!canUseInPost}
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${selected ? 'bg-[#00e5ff] text-black' : canUseInPost ? 'bg-white/10 text-white hover:bg-white/20' : 'cursor-not-allowed bg-white/5 text-white/25'}`}
                  aria-label={canUseInPost ? `Select ${track.title}` : `${track.title} is preview only`}
                >
                  {selected ? <Check className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
                </button>
              </article>
            );
          })}
        </div>
        <footer className="border-t border-white/10 px-5 py-3 text-[11px] text-white/40">
          Tracks remain hosted by their provider. Attribution and license links stay attached to the post.
        </footer>
      </section>
    </div>
  );
}