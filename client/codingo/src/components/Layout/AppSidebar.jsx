import { useState } from 'react';
import {
  FaBars,
  FaChartLine,
  FaEllipsisH,
  FaFacebookMessenger,
  FaFlagCheckered,
  FaGraduationCap,
  FaMedal,
  FaRegStar,
  FaTimes,
  FaTrophy,
  FaUser,
  FaUserFriends,
  FaUsers
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setDesktopCollapsed, setMobileMenuOpen } from '../../redux/slices/sideBarSlice';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: FaRegStar, to: '/dashboard', match: ['/dashboard'] },
  { key: 'learn', label: 'Learn', icon: FaGraduationCap, to: '/learn', match: ['/learn', '/levels', '/language'] },
  { key: 'community', label: 'Community', icon: FaUsers, to: '/community', match: ['/community'] },
  { key: 'friends', label: 'Friends', icon: FaUserFriends, to: '/friends', match: ['/friends'] },
  { key: 'messages', label: 'Messages', icon: FaFacebookMessenger, to: '/messages', match: ['/messages'] },
  { key: 'challenges', label: 'Challenges', icon: FaFlagCheckered, to: '/challenges', match: ['/challenges'] },
  { key: 'leaderboards', label: 'Leaderboards', icon: FaTrophy, to: '/leaderboard', match: ['/leaderboard'] },
  { key: 'profile', label: 'Profile', icon: FaMedal, to: '/profile', match: ['/profile'] },
  { key: 'progress', label: 'Progress', icon: FaChartLine, to: '/progress', match: ['/progress'] },
  { key: 'more', label: 'More', icon: FaEllipsisH, to: '/dashboard', match: [] }
];

function SidebarItem({ item, isActive, collapsed, onClick, iconOnly = false }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      title={item.label}
      onClick={() => onClick(item.to)}
      className={`w-full rounded-lg transition border text-cyan-300 ${
        isActive ? 'bg-cyan-600/30 border-cyan-600/50' : 'border-transparent hover:bg-[#243547]'
      } ${
        iconOnly || collapsed
          ? 'h-10 flex items-center justify-center'
          : 'h-10 px-3 flex items-center gap-3 text-sm font-semibold'
      }`}
    >
      <Icon className="text-sm" />
      {iconOnly || collapsed ? null : <span>{item.label}</span>}
    </button>
  );
}

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDesktopCollapsed = useSelector(state => state.sideBar.isDesktopCollapsed);
  const isMobileMenuOpen = useSelector(state => state.sideBar.isMobileMenuOpen);

  const handleNavigate = (to) => {
    dispatch(setMobileMenuOpen(false));
    navigate(to);
  };

  const isActiveItem = (item) => item.match.some((routePrefix) => location.pathname.startsWith(routePrefix));

  return (
    <>
      <aside className="hidden lg:block shrink-0">
        <div
        onMouseEnter={() => dispatch(setDesktopCollapsed(false))}
        onMouseLeave={() => dispatch(setDesktopCollapsed(true))}
          className={`sticky top-14 h-[calc(100vh-3.5rem)] bg-[#1a2332] border-r border-[#2a3a4a] py-4 transition-all duration-200 ${
            isDesktopCollapsed ? 'w-20 px-2' : 'w-50 px-2'
          }`}
        >
          <div className="flex items-center justify-center mb-6">
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                isActive={isActiveItem(item)}
                collapsed={isDesktopCollapsed}
                onClick={handleNavigate}
              />
            ))}
          </nav>
        </div>
      </aside>

      <aside className="lg:hidden w-14 shrink-0 bg-[#1a2332] border-r border-[#2a3a4a]">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] py-3 px-2 flex flex-col gap-2 items-center">
          <button
            type="button"
            onClick={() => dispatch(setMobileMenuOpen(true))}
            className="h-10 w-10 rounded-lg text-cyan-300 hover:bg-[#243547] transition grid place-items-center"
            aria-label="Open sidebar menu"
            title="Open menu"
          >
            <FaBars />
          </button>

          {navItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              isActive={isActiveItem(item)}
              collapsed={false}
              onClick={handleNavigate}
              iconOnly
            />
          ))}
        </div>
      </aside>

      {isMobileMenuOpen ? (
        <div className="fixed top-14 left-0 right-0 bottom-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => dispatch(setMobileMenuOpen(false))}
            aria-label="Close sidebar menu backdrop"
          />

          <div className="absolute left-0 top-0 h-full w-64 bg-[#1a2332] border-r border-[#2a3a4a] p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="text-xl font-extrabold text-cyan-400">Codify</div>
              <button
                type="button"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="h-9 w-9 rounded-lg text-cyan-300 hover:bg-[#243547] transition grid place-items-center"
                aria-label="Close sidebar menu"
              >
                <FaTimes />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <SidebarItem
                  key={`mobile-${item.key}`}
                  item={item}
                  isActive={isActiveItem(item)}
                  collapsed={false}
                  onClick={handleNavigate}
                />
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}