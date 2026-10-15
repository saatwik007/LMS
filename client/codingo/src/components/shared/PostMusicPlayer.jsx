import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, Volume2 } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function PostMusicPlayer({ music, compact = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(music?.volume ?? 0.7);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  if (!music?.streamUrl) return null;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const changeVolume = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  };

  return (
    <div className={`flex items-center gap-2 rounded-md border border-white/15 bg-black/25 ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}>
      <audio
        ref={audioRef}
        src={`${API_BASE_URL}${music.streamUrl}`}
        preload="none"
        loop
        onLoadedMetadata={(event) => { event.currentTarget.currentTime = music.startTime || 0; event.currentTarget.volume = volume; }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button type="button" onClick={togglePlayback} className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#00e5ff] text-black" aria-label={playing ? 'Pause soundtrack' : 'Play soundtrack'}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      {music.artworkUrl ? <img src={music.artworkUrl} alt="" className="h-8 w-8 flex-none rounded object-cover" /> : <Music2 className="h-5 w-5 flex-none text-white/55" />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">{music.title}</p>
        <a href={music.sourceUrl} target="_blank" rel="noreferrer" className="block truncate text-[10px] text-white/55 hover:text-[#00e5ff]">
          {music.artist} · {music.provider} · {music.license}
        </a>
      </div>
      {!compact && (
        <label className="hidden items-center gap-1 sm:flex" aria-label="Soundtrack volume">
          <Volume2 className="h-3.5 w-3.5 text-white/50" />
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={changeVolume} className="w-16 accent-[#00e5ff]" />
        </label>
      )}
    </div>
  );
}