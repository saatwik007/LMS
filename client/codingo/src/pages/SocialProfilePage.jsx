import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ImageCard, TextCard } from "../components/SocialProfile/SocialImageCard";
import { ArticleCard, QuoteCard } from "../components/SocialProfile/SocialQouteArticleCard";
import { apiUrl } from "../utilites/DashboardHelper";
import { getAuthHeaders } from "../utilites/communityHelper";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCamera, FaComment, FaExpandAlt, FaEye, FaGlobe, FaGripVertical, FaHeart, FaLock, FaSave, FaTimes, FaUserCheck, FaUserPlus } from "react-icons/fa";
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

const TABS = ["Your Posts", "Insights"];

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
    const [followStatus, setFollowStatus] = useState("none");
    const [followPending, setFollowPending] = useState(false);
    const [profileAccess, setProfileAccess] = useState(true);

    useEffect(() => {
        if (!isOwnProfile) setActiveTab("Your Posts");
    }, [isOwnProfile]);

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
                if (err.response?.status === 403 && err.response?.data?.isPrivate) {
                    setProfileAccess(false);
                    setUserPosts([]);
                } else {
                    setError('Failed to load user posts.');
                }
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

    useEffect(() => {
        if (isOwnProfile || !userId) return;

        const fetchFollowStatus = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/social/follow-status/${userId}`, {
                    withCredentials: true,
                    headers: getAuthHeaders()
                });
                setFollowStatus(response.data.status);
                setProfileAccess(response.data.canView);
                setCurrentUser((user) => user ? {
                    ...user,
                    followersCount: response.data.followersCount,
                    followingCount: response.data.followingCount,
                    isPrivate: response.data.isPrivate
                } : user);
            } catch (err) {
                console.error('Failed to fetch follow status:', err);
            }
        };

        fetchFollowStatus();
    }, [isOwnProfile, userId]);

    const handleFollow = async () => {
        if (!userId || followPending) return;
        setFollowPending(true);
        try {
            const method = followStatus === 'following' || followStatus === 'requested' ? 'delete' : 'post';
            const response = await axios({
                method,
                url: `${apiUrl}/api/social/follow/${userId}`,
                withCredentials: true,
                headers: getAuthHeaders()
            });
            setFollowStatus(response.data.status);
            setCurrentUser((user) => user ? { ...user, followersCount: response.data.followersCount } : user);
            setProfileAccess(response.data.status === 'following' || currentUser?.isPrivate === false);
            if (response.data.status === 'following') {
                const postsResponse = await axios.get(`${apiUrl}/api/community/users/${userId}/posts?page=1&limit=20`, {
                    withCredentials: true,
                    headers: getAuthHeaders()
                });
                setUserPosts(getOrderedPosts(postsResponse.data.posts || [], userId, false));
            } else if (currentUser?.isPrivate !== false) {
                setUserPosts([]);
            }
        } catch (err) {
            console.error('Failed to update follow status:', err);
            setError(err.response?.data?.message || 'Failed to update follow status.');
        } finally {
            setFollowPending(false);
        }
    };

    const handlePrivacyToggle = async () => {
        try {
            const response = await axios.patch(`${apiUrl}/api/social/privacy`, {
                isPrivate: currentUser?.isPrivate === false
            }, {
                withCredentials: true,
                headers: getAuthHeaders()
            });
            setCurrentUser((user) => ({ ...user, isPrivate: response.data.isPrivate }));
        } catch (err) {
            console.error('Failed to update profile privacy:', err);
            setError('Failed to update profile privacy.');
        }
    };

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

    const recordPostView = async (postId) => {
        if (!postId) return;

        try {
            const response = await axios.post(
                `${apiUrl}/api/community/posts/${postId}/view`,
                {},
                { withCredentials: true, headers: getAuthHeaders() }
            );
            setUserPosts((posts) => posts.map((post) => (
                post.id === postId ? { ...post, viewsCount: response.data.viewsCount } : post
            )));
        } catch (err) {
            console.error("Failed to record post view:", err);
        }
    };

    const togglePostLike = async (postId) => {
        const response = await axios.post(
            `${apiUrl}/api/community/posts/${postId}/like`,
            {},
            { withCredentials: true, headers: getAuthHeaders() }
        );

        setUserPosts((posts) => posts.map((post) => (
            post.id === postId
                ? {
                    ...post,
                    likesCount: response.data.likesCount,
                    isLikedByCurrentUser: response.data.isLiked,
                }
                : post
        )));
    };

    const archivePost = async (postId) => {
        const response = await axios.post(
            `${apiUrl}/api/community/posts/${postId}/archive`,
            {},
            { withCredentials: true, headers: getAuthHeaders() }
        );
        if (response.data.archived) {
            setUserPosts((posts) => posts.filter((post) => post.id !== postId));
        }
    };

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
                                    <span className="font-bold text-white">
                                        {currentUser?.followersCount ?? 0}
                                    </span> Followers
                                </span>
                                <span className="text-neutral-600">|</span>
                                <span>
                                    <span className="font-bold text-white">
                                        {currentUser?.followingCount ?? 0}
                                    </span> Following
                                </span>
                            </div>
                        </div>
                    </div>

                    {isOwnProfile ? (
                        <button
                            type="button"
                            onClick={handlePrivacyToggle}
                            className="flex items-center gap-2 border border-white/15 px-3 py-2 text-sm text-neutral-200 transition hover:border-white/30 hover:text-white"
                        >
                            {currentUser?.isPrivate === false ? <FaGlobe /> : <FaLock />}
                            {currentUser?.isPrivate === false ? 'Public' : 'Private'}
                        </button>
                    ) : followStatus !== 'blocked' && (
                        <button
                            type="button"
                            onClick={handleFollow}
                            disabled={followPending}
                            className="flex min-w-28 items-center justify-center gap-2 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-60"
                        >
                            {followStatus === 'following' ? <FaUserCheck /> : <FaUserPlus />}
                            {followStatus === 'following' ? 'Following' : followStatus === 'requested' ? 'Requested' : 'Follow'}
                        </button>
                    )}

                </div>

                {/* ---------------- Tabs ---------------- */}
                <div
                    ref={tabsRef}
                    className="mt-8 sm:mt-10 flex items-center justify-center gap-6 sm:gap-10 border-b border-white/10 pb-3 sm:pb-4 overflow-x-auto"
                >
                    {(isOwnProfile ? TABS : TABS.slice(0, 1)).map((tab) => {
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
                    ) : !profileAccess ? (
                        <div className="mx-auto flex max-w-md flex-col items-center border-y border-white/10 py-14 text-center">
                            <FaLock className="mb-4 text-2xl text-neutral-400" />
                            <h2 className="text-lg font-semibold text-white">This account is private</h2>
                            <p className="mt-2 text-sm text-neutral-400">Follow this account to see their posts.</p>
                        </div>
                    ) : userPosts.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm sm:text-base">No posts yet.</div>
                    ) : activeTab === "Insights" ? (
                        <ProfileInsights posts={userPosts} onOpenPost={showPostModal} />
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
                onView={recordPostView}
                onLike={togglePostLike}
                onArchive={isOwnProfile ? archivePost : undefined}
                onSavedChange={({ postId, saved }) => setUserPosts((posts) => posts.map((post) => (
                    post.id === postId ? { ...post, isSavedByCurrentUser: saved } : post
                )))}
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
                <span className="flex items-center gap-1.5">
                    <FaEye /> {post.viewsCount || 0}
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

function ProfileInsights({ posts, onOpenPost }) {
    const [range, setRange] = useState("all");
    const [activePoint, setActivePoint] = useState(null);
    const [insightsNow] = useState(() => Date.now());
    const rangeDays = range === "7d" ? 7 : range === "30d" ? 30 : null;
    const cutoff = rangeDays ? insightsNow - rangeDays * 24 * 60 * 60 * 1000 : null;
    const filteredPosts = posts.filter((post) => {
        if (!cutoff) return true;
        const createdAt = new Date(post.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt >= cutoff;
    });
    const chronologicalPosts = [...filteredPosts].sort(
        (left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
    );
    const rankedPosts = filteredPosts
        .map((post) => ({
            ...post,
            originalIndex: posts.findIndex((item) => item.id === post.id),
            engagement: (post.likesCount || 0) + (post.commentsCount || 0),
            performance: (post.viewsCount || 0) + (post.likesCount || 0) + (post.commentsCount || 0),
        }))
        .sort((left, right) => right.performance - left.performance);
    const totalViews = filteredPosts.reduce((total, post) => total + (post.viewsCount || 0), 0);
    const totalLikes = filteredPosts.reduce((total, post) => total + (post.likesCount || 0), 0);
    const totalComments = filteredPosts.reduce((total, post) => total + (post.commentsCount || 0), 0);
    const totalEngagement = totalLikes + totalComments;
    const engagementRate = totalViews ? (totalEngagement / totalViews) * 100 : 0;
    const averageViews = filteredPosts.length ? Math.round(totalViews / filteredPosts.length) : 0;
    const metrics = [
        { label: "Total views", value: totalViews.toLocaleString(), detail: "Unique post views", icon: FaEye },
        { label: "Engagements", value: totalEngagement.toLocaleString(), detail: `${totalLikes} likes · ${totalComments} comments`, icon: FaHeart },
        { label: "Engagement rate", value: `${engagementRate.toFixed(1)}%`, detail: "Engagements per view", icon: FaComment },
        { label: "Average views", value: averageViews.toLocaleString(), detail: "Per published post", icon: FaExpandAlt },
    ];
    const chartWidth = 920;
    const chartHeight = 320;
    const chartPadding = { top: 28, right: 28, bottom: 48, left: 54 };
    const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
    const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    const graphMaximum = Math.max(
        1,
        ...chronologicalPosts.flatMap((post) => [post.viewsCount || 0, post.likesCount || 0, post.commentsCount || 0])
    );
    const roundedMaximum = Math.max(4, Math.ceil(graphMaximum / 4) * 4);
    const getX = (index) => chronologicalPosts.length === 1
        ? chartPadding.left + plotWidth / 2
        : chartPadding.left + (index / Math.max(1, chronologicalPosts.length - 1)) * plotWidth;
    const getY = (value) => chartPadding.top + plotHeight - (value / roundedMaximum) * plotHeight;
    const series = [
        { key: "viewsCount", label: "Views", color: "#22d3ee" },
        { key: "likesCount", label: "Likes", color: "#fb7185" },
        { key: "commentsCount", label: "Comments", color: "#fcd34d" },
    ];
    const makePath = (key) => chronologicalPosts
        .map((post, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(post[key] || 0)}`)
        .join(" ");
    const selectedPoint = chronologicalPosts[activePoint ?? chronologicalPosts.length - 1];
    const formatPostDate = (date) => {
        const value = new Date(date);
        return Number.isFinite(value.getTime())
            ? value.toLocaleDateString(undefined, { month: "short", day: "numeric" })
            : "Post";
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-semibold uppercase text-cyan-400">Creator analytics</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">Content performance</h2>
                    <p className="mt-1 text-sm text-neutral-500">See how each post is reaching and engaging your audience.</p>
                </div>
                <div className="inline-flex w-fit border border-white/10 bg-neutral-950 p-1" aria-label="Insights date range">
                    {[["7d", "7 days"], ["30d", "30 days"], ["all", "All time"]].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => { setRange(value); setActivePoint(null); }}
                            className={`px-3 py-1.5 text-xs font-semibold transition ${range === value ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {metrics.map(({ label, value, detail, icon: Icon }) => (
                    <div key={label} className="border border-white/10 bg-neutral-950/70 p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium text-neutral-500">{label}</p>
                            {React.createElement(Icon, { className: "text-sm text-neutral-600" })}
                        </div>
                        <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">{value}</p>
                        <p className="mt-1 truncate text-xs text-neutral-600">{detail}</p>
                    </div>
                ))}
            </div>

            <section className="border border-white/10 bg-neutral-950/60 p-4 sm:p-6">
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="text-base font-semibold text-white">Performance trend</h3>
                        <p className="mt-1 text-xs text-neutral-500">Metrics by publishing order</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
                        {series.map((item) => (
                            <span key={item.key} className="flex items-center gap-2">
                                <span className="h-0.5 w-4" style={{ backgroundColor: item.color }} />{item.label}
                            </span>
                        ))}
                    </div>
                </div>

                {chronologicalPosts.length ? (
                    <div className="relative">
                        {selectedPoint && (
                            <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-l-2 border-cyan-400 pl-3 text-xs text-neutral-400">
                                <span className="font-semibold text-white">{formatPostDate(selectedPoint.createdAt)}</span>
                                <span>{selectedPoint.viewsCount || 0} views</span>
                                <span>{selectedPoint.likesCount || 0} likes</span>
                                <span>{selectedPoint.commentsCount || 0} comments</span>
                            </div>
                        )}
                        <svg
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            className="block min-h-56 w-full overflow-visible"
                            role="img"
                            aria-label="Line chart comparing post views, likes, and comments"
                        >
                            {[0, 1, 2, 3, 4].map((tick) => {
                                const value = Math.round((roundedMaximum / 4) * (4 - tick));
                                const y = chartPadding.top + (plotHeight / 4) * tick;
                                return (
                                    <g key={tick}>
                                        <line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
                                        <text x={chartPadding.left - 12} y={y + 4} textAnchor="end" fill="#737373" fontSize="11">{value}</text>
                                    </g>
                                );
                            })}
                            {activePoint !== null && (
                                <line
                                    x1={getX(activePoint)}
                                    x2={getX(activePoint)}
                                    y1={chartPadding.top}
                                    y2={chartPadding.top + plotHeight}
                                    stroke="rgba(255,255,255,0.18)"
                                    strokeDasharray="4 5"
                                />
                            )}
                            {series.map((item) => (
                                <g key={item.key}>
                                    <path d={makePath(item.key)} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    {chronologicalPosts.map((post, index) => (
                                        <circle
                                            key={`${item.key}-${post.id}`}
                                            cx={getX(index)}
                                            cy={getY(post[item.key] || 0)}
                                            r={activePoint === index ? 6 : 4}
                                            fill="#0a0a0a"
                                            stroke={item.color}
                                            strokeWidth="3"
                                            className="cursor-pointer outline-none"
                                            tabIndex="0"
                                            onMouseEnter={() => setActivePoint(index)}
                                            onFocus={() => setActivePoint(index)}
                                            onClick={() => setActivePoint(index)}
                                        />
                                    ))}
                                </g>
                            ))}
                            {chronologicalPosts.map((post, index) => {
                                const showLabel = chronologicalPosts.length <= 6 || index === 0 || index === chronologicalPosts.length - 1 || index % Math.ceil(chronologicalPosts.length / 5) === 0;
                                return showLabel ? (
                                    <text key={post.id} x={getX(index)} y={chartHeight - 16} textAnchor="middle" fill="#737373" fontSize="11">
                                        {formatPostDate(post.createdAt)}
                                    </text>
                                ) : null;
                            })}
                        </svg>
                    </div>
                ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-neutral-500">No posts published in this period.</div>
                )}
            </section>

            <section className="border-t border-white/10 pt-6">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">Top content</h3>
                    <p className="mt-1 text-xs text-neutral-500">Ranked by views and interactions</p>
                </div>
                {rankedPosts.map((post, rank) => (
                    <button
                        key={post.id}
                        type="button"
                        onClick={() => onOpenPost(post.originalIndex)}
                        className="group grid w-full grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 border-b border-white/10 py-4 text-left sm:grid-cols-[2rem_minmax(0,1fr)_auto]"
                    >
                        <span className="text-sm font-semibold text-neutral-600">{String(rank + 1).padStart(2, "0")}</span>
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-white group-hover:text-neutral-300">
                                {post.content || "Media post"}
                            </span>
                            <span className="mt-1 block text-xs text-neutral-600">{formatPostDate(post.createdAt)}</span>
                        </span>
                        <span className="col-start-2 flex items-center gap-4 text-xs text-neutral-400 sm:col-start-auto">
                            <span className="flex items-center gap-1"><FaEye /> {post.viewsCount || 0}</span>
                            <span className="flex items-center gap-1"><FaHeart /> {post.likesCount || 0}</span>
                            <span className="flex items-center gap-1"><FaComment /> {post.commentsCount || 0}</span>
                        </span>
                    </button>
                ))}
            </section>
        </div>
    );
}