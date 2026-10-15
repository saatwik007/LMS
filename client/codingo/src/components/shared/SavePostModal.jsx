import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Check, FolderPlus, LoaderCircle, Plus, X } from 'lucide-react';
import api from '../../lib/api';

export default function SavePostModal({ post, onClose, onSavedChange }) {
  const [collections, setCollections] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [newName, setNewName] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/api/community/saved').then(({ data }) => {
      if (!active) return;
      const saved = data.posts?.some((item) => item.id === post.id) || false;
      setCollections(data.collections || []);
      setIsSaved(saved);
      setSelectedIds(new Set((data.collections || []).filter((item) => item.postIds.includes(post.id)).map((item) => item.id)));
      setStatus('idle');
    }).catch((requestError) => {
      if (!active) return;
      setError(requestError.response?.data?.message || 'Could not load your collections.');
      setStatus('idle');
    });
    return () => { active = false; };
  }, [post.id]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && status !== 'saving') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose, status]);

  const notifyChange = (saved, collectionIds) => {
    onSavedChange?.({ postId: post.id, saved, collectionIds });
  };

  const toggleSaved = async () => {
    if (status === 'saving') return;
    setStatus('saving');
    setError('');
    try {
      const { data } = await api.post(`/api/community/posts/${post.id}/save`);
      setIsSaved(data.saved);
      if (!data.saved) setSelectedIds(new Set());
      notifyChange(data.saved, data.collectionIds || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this bookmark.');
    } finally {
      setStatus('idle');
    }
  };

  const toggleCollection = async (collectionId) => {
    if (status === 'saving') return;
    setStatus('saving');
    setError('');
    const next = new Set(selectedIds);
    if (next.has(collectionId)) next.delete(collectionId);
    else next.add(collectionId);
    try {
      if (!isSaved) {
        const { data } = await api.post(`/api/community/posts/${post.id}/save`, { collectionId });
        setIsSaved(true);
        setSelectedIds(new Set([collectionId]));
        notifyChange(true, data.collectionIds || [collectionId]);
      } else {
        const collectionIds = [...next];
        await api.put(`/api/community/posts/${post.id}/save/collections`, { collectionIds });
        setSelectedIds(next);
        notifyChange(true, collectionIds);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update the collection.');
    } finally {
      setStatus('idle');
    }
  };

  const createCollection = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name || status === 'saving') return;
    setStatus('saving');
    setError('');
    try {
      const { data } = await api.post('/api/community/saved/collections', { name });
      const collection = data.collection;
      setCollections((current) => [...current, collection]);
      setNewName('');
      if (!isSaved) {
        await api.post(`/api/community/posts/${post.id}/save`, { collectionId: collection.id });
        setIsSaved(true);
        setSelectedIds(new Set([collection.id]));
        notifyChange(true, [collection.id]);
      } else {
        const collectionIds = [...selectedIds, collection.id];
        await api.put(`/api/community/posts/${post.id}/save/collections`, { collectionIds });
        setSelectedIds(new Set(collectionIds));
        notifyChange(true, collectionIds);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create the collection.');
    } finally {
      setStatus('idle');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="save-post-title">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close save dialog" />
      <section className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#101010] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 id="save-post-title" className="text-base font-semibold text-white">Save post</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Only you can see saved posts</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center text-neutral-400 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {status === 'loading' ? (
          <div className="grid h-56 place-items-center text-neutral-500"><LoaderCircle className="animate-spin" size={24} /></div>
        ) : (
          <>
            <div className="border-b border-white/10 p-4">
              <button
                type="button"
                onClick={toggleSaved}
                disabled={status === 'saving'}
                className={`flex w-full items-center gap-3 rounded border px-4 py-3 text-left transition ${isSaved ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/3 text-white hover:bg-white/6'}`}
              >
                <Bookmark size={19} fill={isSaved ? 'currentColor' : 'none'} />
                <span className="flex-1 text-sm font-semibold">{isSaved ? 'Saved' : 'Save without a collection'}</span>
                {isSaved && <Check size={17} />}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto px-4 py-3">
              <p className="mb-2 px-1 text-xs font-semibold uppercase text-neutral-500">Collections</p>
              {collections.length ? collections.map((collection) => {
                const selected = selectedIds.has(collection.id);
                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => toggleCollection(collection.id)}
                    disabled={status === 'saving'}
                    className="flex w-full items-center gap-3 border-b border-white/5 px-2 py-3 text-left hover:bg-white/5 disabled:opacity-60"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded bg-white/7 text-neutral-300"><FolderPlus size={17} /></span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{collection.name}</span>
                    <span className={`grid h-6 w-6 place-items-center rounded-full border ${selected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/20 text-transparent'}`}><Check size={14} /></span>
                  </button>
                );
              }) : <p className="px-2 py-5 text-center text-sm text-neutral-500">Create your first collection below.</p>}
            </div>

            <form onSubmit={createCollection} className="flex gap-2 border-t border-white/10 p-4">
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                maxLength={50}
                placeholder="New collection name"
                className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
              <button type="submit" disabled={!newName.trim() || status === 'saving'} className="grid h-10 w-10 place-items-center rounded bg-white text-black hover:bg-neutral-200 disabled:opacity-40" aria-label="Create collection">
                {status === 'saving' ? <LoaderCircle className="animate-spin" size={16} /> : <Plus size={18} />}
              </button>
            </form>
          </>
        )}
        {error && <p className="border-t border-rose-400/15 bg-rose-400/5 px-5 py-3 text-sm text-rose-300">{error}</p>}
      </section>
    </div>,
    document.body
  );
}
