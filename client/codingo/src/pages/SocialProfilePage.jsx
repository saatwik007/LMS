import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ImageCard, TextCard } from "../components/SocialProfile/SocialImageCard";
import { ArticleCard, QuoteCard } from "../components/SocialProfile/SocialQouteArticleCard";
import { apiUrl } from "../utilites/DashboardHelper";
import { getAuthHeaders } from "../utilites/communityHelper";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCamera, FaComment, FaExpandAlt, FaGripVertical, FaHeart, FaSave, FaTimes } from "react-icons/fa";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PostPreview from "../components/SocialProfile/postPreview";

const TABS = ["Your Posts"];

const POST_SIZE_CLASSES = {
    "1x1": "col-span-1 row-span-1",
    "2x1": "col-span-2 row-span-1",
    "3x1": "col-span-3 row-span-1",
    "1x2": "col-span-1 row-span-2",
    "2x2": "col-span-2 row-span-2",
    "3x2": "col-span-3 row-span-2",
    "1x3": "col-span-1 row-span-3",
    "2x3": "col-span-2 row-span-3",
    "3x3": "col-span-3 row-span-3",
};

// ---------------------------------------------------------------
// Sample data — swap these out for real API data later.
// ---------------------------------------------------------------

const PROFILE = {
    name: "ALEXANDER COLE",
    title: "Lead Product Designer",
    handle: "@AlexColeDesign",
    bio: "Crafting pixels into experiences. Minimalist advocate. // portfolio: alexcole.design",
    posts: 210,
    followers: "6.8K",
    following: 750,
};

const POSTS_DATA = [
    {
        id: "p1",
        type: "image",
        likes: 522,
        comments: 88,
    },
    {
        id: "p2",
        type: "text",
        title: "UX Case Study: Dark Mode Benefits",
        body: "Crafting pixels into experiences. Minimalist advocate.  // portfolio: alexcole.design...",
    },
    {
        id: "p3",
        type: "quote",
        quote: "Miniminalist design in quote, minimialist design maths.",
        author: "- Minii Design",
    },
    {
        id: "p4",
        type: "article",
        title: "UX Case Study: Dark Mode - External Article",
        body: "The popularitor of designs to thar dark Mode benefram at an internal...",
        author: "alexColeDesign",
    },
];

const SHOWCASE_DATA = [
    {
        id: "s1",
        type: "text",
        title: "Fintech Dashboard Redesign",
        body: "A ground-up redesign of a legacy fintech dashboard, focused on data density without sacrificing clarity...",
    },
    {
        id: "s2",
        type: "image",
        likes: 341,
        comments: 42,
    },
    {
        id: "s3",
        type: "article",
        title: "Design Systems at Scale",
        body: "How we built a token-driven design system used across 12 product teams...",
        author: "alexColeDesign",
    },
    {
        id: "s4",
        type: "quote",
        quote: "Systems age. Principles don't.",
        author: "- A. Cole",
    },
];

const LINKS_DATA = [
    { id: "l1", label: "Portfolio", url: "alexcole.design" },
    { id: "l2", label: "Dribbble", url: "dribbble.com/alexcole" },
    { id: "l3", label: "Behance", url: "behance.net/alexcole" },
    { id: "l4", label: "Twitter / X", url: "x.com/AlexColeDesign" },
];

const DATA_BY_TAB = {
    Posts: POSTS_DATA,
    "Project Showcases": SHOWCASE_DATA,
    Links: LINKS_DATA,
};

// ---------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------


function LinkRow({ label, url }) {
    return (
        <div className="col-span-1 flex h-16 sm:h-[80px] items-center justify-between rounded-lg sm:rounded-2xl border border-white/10 bg-neutral-900/60 px-3 sm:px-6 gap-2 flex-wrap">
            <span className="text-xs sm:text-base font-semibold text-white truncate">{label}</span>
            <span className="text-xs sm:text-sm text-neutral-400 truncate">{url}</span>
        </div>
    );
}

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------

export default function SocialProfileSection() {
    const [activeTab, setActiveTab] = useState("Your Posts");
    const { userId } = useParams();
    const storedUser = getStoredUser();
    const   isOwnProfile = !userId || userId === storedUser?.id;
    const [currentUser, setCurrentUser] = useState(isOwnProfile ? storedUser : null);
    console.log('currentUser', currentUser)
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bio, setBio] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [showPostPreview, setShowPostPreview] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(0);

    const rootRef = useRef(null);
    const headerRef = useRef(null);
    const avatarRef = useRef(null);
    const infoRef = useRef(null);
    const tabsRef = useRef(null);
    const contentRef = useRef(null);
    const gridRef = useRef(null);
    const firstRender = useRef(true);
    const [gridCellSize, setGridCellSize] = useState(0);
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const updateCellSize = () => {
            const columnGap = parseFloat(getComputedStyle(grid).columnGap) || 0;
            setGridCellSize((grid.clientWidth - (columnGap * 2)) / 3);
        };
        const resizeObserver = new ResizeObserver(updateCellSize);

        updateCellSize();
        resizeObserver.observe(grid);
        return () => resizeObserver.disconnect();
    }, [postsLoading]);

    useEffect(() => {
        const fetchUserPosts = async () => {
            const id = userId || storedUser?.id;
            if (!id) return;
            console.log('Fetching posts for user ID:', id, 'storedUser ID:', storedUser?.id, 'isUserId:', userId);

            setPostsLoading(true);
            try {
                const res = await axios.get(
                    `${apiUrl}/api/community/users/${id}/posts?page=1&limit=20`,
                    {
                        withCredentials: true,
                        headers: getAuthHeaders()
                    }
                );
                console.log('res', res);
                const hasSavedLayout = res.data.hasSavedProfileGridLayout === true;
                const posts = getOrderedPosts(res.data.posts || [], id, !hasSavedLayout);
                setUserPosts(posts);

                const hasLocalLayout = localStorage.getItem(`profile-grid-order:${id}`)
                    || localStorage.getItem(`profile-grid-sizes:${id}`);
                if (isOwnProfile && !hasSavedLayout && hasLocalLayout) {
                    persistProfileGrid(id, posts);
                }
            } catch (err) {
                console.error('Failed to fetch user posts:', err);
                setError('Failed to load user posts.');
            } finally {
                setPostsLoading(false);
            }
        };

        fetchUserPosts();
    }, [userId, storedUser?.id]);

    // const imageUrl = post.image?.startsWith('/')
    //     ? `${apiUrl}${post.image}`
    //     : post.image;

    const getDisplayImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        return imageUrl.startsWith('/') ? `${apiUrl}${imageUrl}` : imageUrl;
    };


    function getStoredUser() {
        try {
            const raw = localStorage.getItem('user');
            // console.log('raw', raw)
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    async function fetchUserProfile() {
        try {
            console.log("fetch user profile");
            const url = isOwnProfile
                ? `${apiUrl}/api/auth/user/me`
                : `${apiUrl}/api/auth/user/${userId}/public`;

            const response = await axios.get(url, {
                withCredentials: true,
                headers: getAuthHeaders()
            });
            console.log('ownprofile', isOwnProfile)

            if (response.data?.user) {
                const userData = response.data.user;
                setCurrentUser(userData)
                setBio(userData.bio || '');
                setEditedUsername(userData.username || '');

                if (isOwnProfile) {
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            }
            console.log('Fetched user profile:', response.data);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setError('Failed to load profile.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            setError('Image must be less than 3MB');
            return;
        }

        setIsUploadingAvatar(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.patch(
                `${apiUrl}/api/auth/user/profile/image`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data?.user) {
                setCurrentUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.dispatchEvent(new Event('auth:user-updated'));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveBio = async () => {
        try {
            const response = await axios.patch(
                `${apiUrl}/api/auth/user/profile`,
                { bio },
                {
                    withCredentials: true,
                    headers: getAuthHeaders()
                }
            );

            if (response.data?.user) {
                setCurrentUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            setIsEditingBio(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update bio');
        }
    };

    const handleSaveUsername = async () => {
        const trimmed = editedUsername.trim();
        if (!trimmed || trimmed === currentUser?.username) {
            setIsEditingUsername(false);
            return;
        }

        try {
            setError(null);
            const response = await axios.patch(
                `${apiUrl}/api/auth/user/profile`,
                { username: trimmed },
                {
                    withCredentials: true,
                    headers: getAuthHeaders()
                }
            );

            if (response.data?.user) {
                setCurrentUser(response.data.user);
                setEditedUsername(response.data.user.username);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.dispatchEvent(new Event('auth:user-updated'));
            }
            setIsEditingUsername(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update username');
        }
    };

    // Page-open animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                avatarRef.current,
                { opacity: 0, scale: 0.85 },
                { opacity: 1, scale: 1, duration: 0.7 }
            )
                .fromTo(
                    infoRef.current.children,
                    { opacity: 0, y: 16 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.45"
                )
                .fromTo(
                    tabsRef.current,
                    { opacity: 0, y: 12 },
                    { opacity: 1, y: 0, duration: 0.4 },
                    "-=0.2"
                )
                .fromTo(
                    contentRef.current.children,
                    { opacity: 0, y: 24 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                    "-=0.15"
                );
        }, rootRef);

        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Tab-switch animation
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (!contentRef.current) return;

        gsap.fromTo(
            contentRef.current.children,
            { opacity: 0, y: 18 },
            {
                opacity: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.07,
                ease: "power2.out",
            }
        );
    }, [activeTab]);

    const handleTabClick = (tab) => {
        if (tab === activeTab) return;

        const underline = tabsRef.current.querySelector(`[data-tab="${activeTab}"] span.underline-bar`);

        gsap.to(contentRef.current, {
            opacity: 0,
            y: 10,
            duration: 0.18,
            ease: "power2.in",
            onComplete: () => {
                setActiveTab(tab);
                gsap.set(contentRef.current, { opacity: 1, y: 0 });
            },
        });
    };

    const handleDragEnd = ({ active, over }) => {
        if (!isOwnProfile || !over || active.id === over.id) return;

        setUserPosts((posts) => {
            const oldIndex = posts.findIndex((post) => post.id === active.id);
            const newIndex = posts.findIndex((post) => post.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return posts;

            const reorderedPosts = arrayMove(posts, oldIndex, newIndex);
            const profileId = userId || storedUser?.id;
            if (profileId) {
                localStorage.setItem(
                    `profile-grid-order:${profileId}`,
                    JSON.stringify(reorderedPosts.map((post) => post.id))
                );
                persistProfileGrid(profileId, reorderedPosts);
            }
            return reorderedPosts;
        });
    };

    const handlePostResize = (postId, gridSize) => {
        if (!isOwnProfile || !POST_SIZE_CLASSES[gridSize]) return;

        setUserPosts((posts) => {
            const resizedPosts = posts.map((post) => (
                post.id === postId ? { ...post, gridSize } : post
            ));
            const profileId = userId || storedUser?.id;
            if (profileId) {
                localStorage.setItem(
                    `profile-grid-sizes:${profileId}`,
                    JSON.stringify(Object.fromEntries(
                        resizedPosts.map((post) => [post.id, post.gridSize || "1x1"])
                    ))
                );
                persistProfileGrid(profileId, resizedPosts);
            }
            return resizedPosts;
        });
    };

    const persistProfileGrid = async (profileId, posts) => {
        try {
            await axios.put(
                `${apiUrl}/api/community/users/${profileId}/profile-grid`,
                {
                    layout: posts.map((post) => ({
                        postId: post.id,
                        gridSize: post.gridSize || "1x1",
                    })),
                },
                { withCredentials: true, headers: getAuthHeaders() }
            );
        } catch (err) {
            console.error("Failed to save profile grid:", err);
        }
    };

    const items = DATA_BY_TAB[activeTab];
    const isLinks = activeTab === "Links";

    const showPostModal = (postIndex) => {
        setSelectedPostIndex(postIndex);
        setShowPostPreview(true);
    };


    return (
        <div
            ref={rootRef}
            className="relative min-h-screen w-full overflow-hidden bg-black text-white"
        >
            {/* ---------- Background: dark navy silk texture fading to black ---------- */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-[280px] sm:h-[420px] bg-gradient-to-b from-[#25406b] via-[#16233d] to-transparent" />
                <div className="hidden sm:block absolute -left-20 top-[-100px] h-[500px] w-[700px] rounded-full bg-[#2f5590]/40 blur-[110px]" />
                <div className="hidden sm:block absolute right-[-150px] top-[-60px] h-[450px] w-[600px] rounded-full bg-[#1c3a66]/50 blur-[120px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-3 sm:px-6 md:px-10 pb-12 sm:pb-16 md:pb-20 pt-8 sm:pt-12 md:pt-16">
                {/* ---------------- Header ---------------- */}
                <div ref={headerRef} className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-8">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 md:gap-8 w-full sm:w-auto">
                        <div
                            ref={avatarRef}
                            className="group relative flex h-24 w-24 sm:h-32 sm:w-32 md:h-[190px] md:w-[190px] shrink-0 items-center justify-center overflow-hidden cursor-pointer rounded-full border border-white/10 bg-neutral-200"
                        >
                            {(
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            )}

                            {/* Profile Pic (guarded) */}
                            {currentUser?.profilePic ? (
                                <img
                                    src={currentUser.profilePic}
                                    alt={currentUser?.username || 'Profile'}
                                    className="cursor-pointer w-full h-full object-cover rounded-full transition-opacity duration-200 group-hover:opacity-50"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-300 text-black text-2xl rounded-full">
                                    {((currentUser?.username && currentUser.username[0]) || 'U').toUpperCase()}
                                    {/* {currentUser?.username} */}
                                </div>
                            )}

                            {/* Overlay Camera Icon */}
                            {isOwnProfile && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                >
                                    {isUploadingAvatar ? (
                                        <div className="animate-spin w-6 h-6 rounded-full"></div>
                                    ) : (
                                        <FaCamera className="text-2xl text-white transform transition-transform duration-200 group-hover:scale-110" />
                                    )}
                                </button>
                            )}
                        </div>


                        <div ref={infoRef} className="pt-0 sm:pt-2 flex-1">

                            {/* <h1 className="text-5xl font-extrabold tracking-tight">{currentUser.username}</h1> */}
                            {isOwnProfile && isEditingUsername ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                        type="text"
                                        value={editedUsername}
                                        onChange={(e) => setEditedUsername(e.target.value)}
                                        className="bg-transparent text-white text-xl sm:text-2xl md:text-3xl font-bold outline-0 flex-1 min-w-0"
                                        maxLength={30}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveUsername();
                                            if (e.key === 'Escape') {
                                                setEditedUsername(currentUser?.username || '');
                                                setIsEditingUsername(false);
                                            }
                                        }}
                                    />
                                    <button type="button" onClick={handleSaveUsername} className="text-cyan-400 hover:text-cyan-300">
                                        <FaSave />
                                    </button>
                                    <button type="button" onClick={() => { setEditedUsername(currentUser?.username || ''); setIsEditingUsername(false); }} className="text-gray-400 hover:text-gray-300">
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {(
                                        <h1 onClick={() => setIsEditingUsername(true)} className="text-xl sm:text-2xl md:text-3xl font-bold truncate hover:text-white/80 transition">{currentUser?.username || 'Learner'}</h1>
                                    )}
                                </>
                            )}

                            {/* <p className="mt-2 text-xl text-neutral-300">{currentUser?.username}</p> */}
                            {/* <p className="mt-1 text-xs sm:text-sm text-neutral-500">{PROFILE.handle}</p> */}

                            {isOwnProfile && isEditingBio ? (
                                <div>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Write something about yourself..."
                                        className="w-full bg-transparent text-white text-xs sm:text-sm rounded-lg outline-none"
                                        rows="3"
                                        maxLength="200"
                                    />
                                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                                        <span className="text-xs text-gray-500">{bio.length}/200</span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBio(currentUser?.bio || '');
                                                    setIsEditingBio(false);
                                                }}
                                                className="px-2 sm:px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition"
                                            >
                                                <FaTimes className="inline mr-1" /> Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveBio}
                                                className="px-2 sm:px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-xs sm:text-sm font-semibold transition"
                                            >
                                                <FaSave className="inline mr-1" /> Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">

                                    {(
                                        <p onClick={() => setIsEditingBio(true)} className="text-gray-300 text-xs sm:text-sm flex-1">{currentUser?.bio || (isOwnProfile ? 'No bio yet. Click edit to add one.' : 'No bio yet.')}</p>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 text-neutral-400 text-xs sm:text-sm flex-wrap">
                                <span>
                                    <span className="font-bold text-white">{userPosts?.length}</span> Posts
                                </span>
                                <span className="text-neutral-600">|</span>
                                <span>
                                    <span className="font-bold text-white">{PROFILE.followers}</span> Followers
                                </span>
                                <span className="text-neutral-600 hidden sm:inline">|</span>
                                <span>
                                    <span className="font-bold text-white">{PROFILE.following}</span> Following
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ---------------- Tabs ---------------- */}
                <div
                    ref={tabsRef}
                    className="mt-8 sm:mt-10 flex items-center justify-center gap-6 sm:gap-10 border-b border-white/10 pb-3 sm:pb-4 overflow-x-auto"
                >
                    {TABS.map((tab) => {
                        const active = tab === activeTab;
                        return (
                            <button
                                key={tab}
                                data-tab={tab}
                                onClick={() => handleTabClick(tab)}
                                className={`relative pb-2 text-sm sm:text-lg font-medium transition-colors whitespace-nowrap ${active ? "font-bold text-white" : "text-neutral-500 hover:text-neutral-300"
                                    }`}
                            >
                                [ {tab} ]
                                {active && (
                                    <span className="underline-bar absolute -bottom-[17px] left-0 h-[2px] w-full bg-white" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ---------------- Content grid ---------------- */}
                <div ref={contentRef} className="mt-8 sm:mt-10">
                    {postsLoading ? (
                        <div className="text-center text-gray-400 text-sm sm:text-base">Loading posts...</div>
                    ) : userPosts.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm sm:text-base">No posts yet.</div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={userPosts.map((post) => post.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div
                                    ref={gridRef}
                                    className="mx-auto grid max-w-6xl grid-cols-3 grid-flow-dense gap-1"
                                    style={{
                                        gridAutoRows: gridCellSize ? `${gridCellSize}px` : "auto",
                                    }}
                                >
                                    {userPosts.map((post, postIndex) => (
                                        <SortablePostTile
                                            key={post.id}
                                            post={post}
                                            imageUrl={getDisplayImageUrl(post.image)}
                                            canReorder={isOwnProfile}
                                            onResize={handlePostResize}
                                            onOpen={() => showPostModal(postIndex)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            <PostPreview
                posts={userPosts}
                initialIndex={selectedPostIndex}
                isOpen={showPostPreview}
                onClose={() => setShowPostPreview(false)}
            />
        </div>
    );
}

function SortablePostTile({ post, imageUrl, canReorder, onResize, onOpen }) {
    const [previewSize, setPreviewSize] = useState(null);
    const resizeStateRef = useRef(null);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: post.id, disabled: !canReorder });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
    };
    const activeGridSize = previewSize || post.gridSize || "1x1";

    const handleResizeStart = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const grid = event.currentTarget.closest("article")?.parentElement;
        if (!grid) return;

        const [columns, rows] = activeGridSize.split("x").map(Number);
        const gridStyles = getComputedStyle(grid);
        const columnGap = parseFloat(gridStyles.columnGap) || 0;
        const rowGap = parseFloat(gridStyles.rowGap) || 0;
        const cellSize = (grid.clientWidth - (columnGap * 2)) / 3;

        resizeStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startWidth: (columns * cellSize) + ((columns - 1) * columnGap),
            startHeight: (rows * cellSize) + ((rows - 1) * rowGap),
            columnStep: cellSize + columnGap,
            rowStep: cellSize + rowGap,
            currentSize: activeGridSize,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleResizeMove = (event) => {
        const resizeState = resizeStateRef.current;
        if (!resizeState || resizeState.pointerId !== event.pointerId) return;

        const columns = Math.max(1, Math.min(3, Math.round(
            (resizeState.startWidth + event.clientX - resizeState.startX) / resizeState.columnStep
        )));
        const rows = Math.max(1, Math.min(3, Math.round(
            (resizeState.startHeight + event.clientY - resizeState.startY) / resizeState.rowStep
        )));
        const nextSize = `${columns}x${rows}`;

        if (nextSize !== resizeState.currentSize) {
            resizeState.currentSize = nextSize;
            setPreviewSize(nextSize);
        }
    };

    const handleResizeEnd = (event) => {
        const resizeState = resizeStateRef.current;
        if (!resizeState || resizeState.pointerId !== event.pointerId) return;

        event.stopPropagation();
        onResize(post.id, resizeState.currentSize);
        resizeStateRef.current = null;
        setPreviewSize(null);
    };

    const handleResizeCancel = () => {
        resizeStateRef.current = null;
        setPreviewSize(null);
    };

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={`group relative min-h-0 min-w-0 overflow-hidden bg-[#202020] outline-none ring-white/80 focus-visible:ring-2 ${POST_SIZE_CLASSES[activeGridSize]} ${isDragging ? "scale-[1.03] opacity-80 shadow-2xl" : ""}`}
            onClick={onOpen}
        >
            {post.image ? (
                <img
                    src={imageUrl}
                    alt={post.content || "Profile post"}
                    className="h-full w-full select-none object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    draggable="false"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs font-medium text-neutral-200 sm:p-6 sm:text-sm">
                    <span className="line-clamp-6">{post.content}</span>
                </div>
            )}

            <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/55 group-focus-visible:bg-black/55" />

            {canReorder && (
                <>
                    <button
                        type="button"
                        onPointerDown={handleResizeStart}
                        onPointerMove={handleResizeMove}
                        onPointerUp={handleResizeEnd}
                        onPointerCancel={handleResizeCancel}
                        onMouseDown={(event) => event.stopPropagation()}
                        onTouchStart={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                        aria-label="Resize post"
                        title="Drag to resize"
                        className="absolute bottom-0 right-0 z-20 flex h-10 w-10 touch-none cursor-nwse-resize items-end justify-end bg-linear-to-tl from-black/80 to-transparent p-2 text-white opacity-100 outline-none transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    >
                        <FaExpandAlt className="rotate-90" />
                    </button>
                    <button
                        type="button"
                        className="absolute right-2 top-2 z-20 flex h-7 w-7 touch-none cursor-grab items-center justify-center bg-black/65 text-white opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100 focus-visible:opacity-100"
                        title="Drag to reorder"
                        aria-label="Drag to reorder post"
                        onClick={(event) => event.stopPropagation()}
                        {...attributes}
                        {...listeners}
                    >
                        <FaGripVertical />
                    </button>
                </>
            )}

            {previewSize && (
                <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-black/75 px-2 py-1 text-xs font-semibold text-white">
                    {previewSize.replace("x", " x ")}
                </span>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center gap-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2 pb-3 pt-10 text-xs font-semibold text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:text-sm">
                <span className="flex items-center gap-1.5">
                    <FaHeart /> {post.likesCount || 0}
                </span>
                <span className="flex items-center gap-1.5">
                    <FaComment /> {post.commentsCount || 0}
                </span>
            </div>
        </article>
    );
}

function getOrderedPosts(posts, profileId, useLocalLayout) {
    const normalizedPosts = posts.map((post) => ({
        ...post,
        gridSize: POST_SIZE_CLASSES[post.gridSize] ? post.gridSize : "1x1",
    }));
    if (!profileId || !useLocalLayout) return normalizedPosts;

    try {
        const savedOrder = JSON.parse(localStorage.getItem(`profile-grid-order:${profileId}`) || "[]");
        const savedSizes = JSON.parse(localStorage.getItem(`profile-grid-sizes:${profileId}`) || "{}");
        const postsById = new Map(normalizedPosts.map((post) => [
            post.id,
            {
                ...post,
                gridSize: POST_SIZE_CLASSES[savedSizes[post.id]] ? savedSizes[post.id] : post.gridSize,
            },
        ]));
        const orderedPosts = savedOrder.map((id) => postsById.get(id)).filter(Boolean);
        const savedIds = new Set(savedOrder);

        return [
            ...orderedPosts,
            ...Array.from(postsById.values()).filter((post) => !savedIds.has(post.id)),
        ];
    } catch {
        return normalizedPosts;
    }
}