import { useEffect, useMemo, useState } from 'react';
import { Archive, Bookmark, Check, Folder, LoaderCircle, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import PostPreview from '../components/SocialProfile/postPreview';
import api, { API_BASE_URL } from '../lib/api';

const mediaUrl = (value) => value?.startsWith('/') ? `${API_BASE_URL}${value}` : value || '';

export default function SavedPostsPage() {
  const [view, setView] = useState('saved');
  const [posts, setPosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLibrary = async () => {
    setLoading(true);
    setError('');
    try {
      const [savedResponse, archiveResponse] = await Promise.all([
        api.get('/api/community/saved'),
        api.get('/api/community/archive'),
      ]);
      setPosts(savedResponse.data.posts || []);
      setCollections(savedResponse.data.collections || []);
      setArchivedPosts(archiveResponse.data.posts || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load your library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLibrary(); }, []);

  const selectedCollection = collections.find((item) => item.id === selectedCollectionId);
  const visiblePosts = useMemo(() => {
    if (view === 'archive') return archivedPosts;
    if (!selectedCollection) return posts;
    const ids = new Set(selectedCollection.postIds);
    return posts.filter((post) => ids.has(post.id));
  }, [archivedPosts, collections, posts, selectedCollection, view]);

  const createCollection = async (event) => {
    event.preventDefault();
    if (!newName.trim()) return;
    try {
      const { data } = await api.post('/api/community/saved/collections', { name: newName.trim() });
      setCollections((current) => [...current, data.collection]);
      setSelectedCollectionId(data.collection.id);
      setNewName('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create the collection.');
    }
  };

  const renameCollection = async (collectionId) => {
    if (!editing?.name.trim()) return;
    try {
      const { data } = await api.patch(`/api/community/saved/collections/${collectionId}`, { name: editing.name.trim() });
      setCollections((current) => current.map((item) => item.id === collectionId ? { ...item, name: data.collection.name } : item));
      setEditing(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not rename the collection.');
    }
  };

  const deleteCollection = async (collection) => {
    if (!window.confirm(`Delete “${collection.name}”? Its posts will remain in All saved.`)) return;
    try {
      await api.delete(`/api/community/saved/collections/${collection.id}`);
      setCollections((current) => current.filter((item) => item.id !== collection.id));
      if (selectedCollectionId === collection.id) setSelectedCollectionId(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the collection.');
    }
  };

  const removeSaved = async (postId) => {
    try {
      const { data } = await api.post(`/api/community/posts/${postId}/save`);
      if (!data.saved) {
        setPosts((current) => current.filter((post) => post.id !== postId));
        setCollections((current) => current.map((collection) => ({ ...collection, postIds: collection.postIds.filter((id) => id !== postId) })));
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not remove the bookmark.');
    }
  };

  const restorePost = async (postId) => {
    try {
      const { data } = await api.post(`/api/community/posts/${postId}/archive`);
      if (!data.archived) setArchivedPosts((current) => current.filter((post) => post.id !== postId));
      if (previewPost?.id === postId) setPreviewPost(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not restore the post.');
    }
  };

  const openPost = async (postId) => {
    try {
      const { data } = await api.get(`/api/community/posts/${postId}`);
      setPreviewPost(data.post);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'This post is no longer available.');
      loadLibrary();
    }
  };

  const recordView = async (postId) => {
    const { data } = await api.post(`/api/community/posts/${postId}/view`);
    setPreviewPost((post) => post?.id === postId ? { ...post, viewsCount: data.viewsCount } : post);
  };

  const toggleLike = async (postId) => {
    const { data } = await api.post(`/api/community/posts/${postId}/like`);
    setPreviewPost((post) => post?.id === postId ? { ...post, likesCount: data.likesCount, isLikedByCurrentUser: data.isLiked } : post);
  };

  const switchView = (nextView) => {
    setView(nextView);
    setSelectedCollectionId(null);
    setEditing(null);
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10 px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-semibold sm:text-3xl" style={{ fontFamily: "'Syne', sans-serif" }}>Your library</h1>
          <p className="mt-2 text-sm text-neutral-500">Saved posts and archived content are private to you.</p>
          <div className="mt-6 flex gap-6">
            <button type="button" onClick={() => switchView('saved')} className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-semibold ${view === 'saved' ? 'border-cyan-300 text-white' : 'border-transparent text-neutral-500'}`}><Bookmark size={17} /> Saved</button>
            <button type="button" onClick={() => switchView('archive')} className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-semibold ${view === 'archive' ? 'border-cyan-300 text-white' : 'border-transparent text-neutral-500'}`}><Archive size={17} /> Archive</button>
          </div>
        </div>
      </header>

      <div className={`mx-auto grid max-w-7xl gap-8 px-5 py-7 sm:px-8 lg:px-12 ${view === 'saved' ? 'lg:grid-cols-[240px_1fr]' : ''}`}>
        {view === 'saved' && (
          <aside>
            <button type="button" onClick={() => setSelectedCollectionId(null)} className={`flex w-full items-center gap-3 rounded px-3 py-3 text-left text-sm font-medium ${selectedCollectionId === null ? 'bg-white text-black' : 'text-neutral-300 hover:bg-white/7'}`}>
              <Bookmark size={17} /><span className="flex-1">All saved</span><span className="text-xs opacity-60">{posts.length}</span>
            </button>
            <p className="mt-6 px-3 text-xs font-semibold uppercase text-neutral-600">Collections</p>
            <div className="mt-2 space-y-1">
              {collections.map((collection) => (
                <div key={collection.id} className={`group flex items-center rounded ${selectedCollectionId === collection.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  {editing?.id === collection.id ? (
                    <div className="flex w-full items-center gap-1 p-2">
                      <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} maxLength={50} autoFocus className="min-w-0 flex-1 rounded border border-cyan-400/50 bg-black px-2 py-1 text-sm outline-none" onKeyDown={(event) => event.key === 'Enter' && renameCollection(collection.id)} />
                      <button type="button" onClick={() => renameCollection(collection.id)} className="p-1 text-cyan-300" aria-label="Save name"><Check size={15} /></button>
                      <button type="button" onClick={() => setEditing(null)} className="p-1 text-neutral-500" aria-label="Cancel"><X size={15} /></button>
                    </div>
                  ) : (
                    <>
                      <button type="button" onClick={() => setSelectedCollectionId(collection.id)} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left text-sm text-neutral-300"><Folder size={16} /><span className="min-w-0 flex-1 truncate">{collection.name}</span><span className="text-xs text-neutral-600">{collection.postIds.length}</span></button>
                      <button type="button" onClick={() => setEditing({ id: collection.id, name: collection.name })} className="p-2 text-neutral-600 opacity-0 hover:text-white group-hover:opacity-100" aria-label="Rename collection"><Pencil size={14} /></button>
                      <button type="button" onClick={() => deleteCollection(collection)} className="mr-1 p-2 text-neutral-600 opacity-0 hover:text-rose-400 group-hover:opacity-100" aria-label="Delete collection"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={createCollection} className="mt-4 flex gap-2">
              <input value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={50} placeholder="New collection" className="min-w-0 flex-1 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-400/50" />
              <button type="submit" disabled={!newName.trim()} className="grid h-9 w-9 place-items-center rounded bg-white text-black disabled:opacity-30" aria-label="Create collection"><Plus size={17} /></button>
            </form>
          </aside>
        )}

        <section className="min-w-0">
          <div className="mb-5 border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold">{view === 'archive' ? 'Archived posts' : selectedCollection?.name || 'All saved'}</h2>
            <p className="mt-1 text-xs text-neutral-600">{visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}</p>
          </div>
          {error && <div className="mb-5 flex items-center justify-between rounded border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button></div>}
          {loading ? (
            <div className="grid min-h-80 place-items-center text-neutral-600"><LoaderCircle className="animate-spin" size={28} /></div>
          ) : visiblePosts.length ? (
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
              {visiblePosts.map((post) => (
                <article key={post.id} className="group relative aspect-square overflow-hidden rounded bg-neutral-900">
                  <button type="button" onClick={() => openPost(post.id)} className="h-full w-full text-left" aria-label={`Open post by ${post.author.username}`}>
                    {post.image ? <img src={mediaUrl(post.image)} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : post.video ? <video src={mediaUrl(post.video)} muted className="h-full w-full object-cover" /> : <p className="grid h-full place-items-center p-5 text-center text-sm leading-6 text-neutral-300">{post.content}</p>}
                    <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent px-3 pb-3 pt-10 text-xs font-medium opacity-0 transition group-hover:opacity-100">@{post.author.username}</span>
                  </button>
                  <button type="button" onClick={() => view === 'archive' ? restorePost(post.id) : removeSaved(post.id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur transition hover:text-cyan-300 group-hover:opacity-100 focus:opacity-100" aria-label={view === 'archive' ? 'Restore post' : 'Remove from saved'}>
                    {view === 'archive' ? <RotateCcw size={15} /> : <Bookmark size={15} fill="currentColor" />}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center border border-dashed border-white/10 text-center"><div>{view === 'archive' ? <Archive className="mx-auto text-neutral-700" size={30} /> : <Bookmark className="mx-auto text-neutral-700" size={30} />}<p className="mt-3 text-sm font-medium text-neutral-300">{view === 'archive' ? 'No archived posts' : 'Nothing saved here yet'}</p></div></div>
          )}
        </section>
      </div>

      <PostPreview
        posts={previewPost ? [previewPost] : []}
        initialIndex={0}
        isOpen={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
        onView={recordView}
        onLike={toggleLike}
        onSavedChange={({ postId, saved }) => {
          setPreviewPost((post) => post?.id === postId ? { ...post, isSavedByCurrentUser: saved } : post);
          if (!saved) {
            setPosts((current) => current.filter((post) => post.id !== postId));
            setCollections((current) => current.map((collection) => ({
              ...collection,
              postIds: collection.postIds.filter((id) => id !== postId),
            })));
          }
        }}
      />
    </main>
  );
}
