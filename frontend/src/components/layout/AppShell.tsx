import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { toggleTheme } from '../../features/theme/themeSlice';
import { apiRequest } from '../../lib/api';

const DRAWER_WIDTH = 260;

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity 0.22s ease;
  z-index: 40;
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${DRAWER_WIDTH}px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 20px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 50;
  transform: translateX(${({ $open }) => ($open ? '0' : `-${DRAWER_WIDTH + 24}px`)});
  transition: transform 0.24s ease;
  box-shadow: ${({ $open }) => ($open ? '0 16px 40px rgba(0,0,0,0.14)' : 'none')};
`;

const Main = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 0;
  background: ${({ theme }) => theme.colors.background};
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BrandMobile = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const UserName = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IconButton = styled.button`
  height: 40px;
  min-width: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const ThemeButton = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const LogoutButton = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const Content = styled.div`
  min-height: 0;
  padding: 16px 20px 20px;
`;

const Brand = styled.div`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text};
`;

const Nav = styled.nav`
  display: grid;
  gap: 8px;
`;

const NavItem = styled(NavLink)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: background 0.16s ease, color 0.16s ease;

  &.active {
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
  }
`;

const NavLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const NavBadge = styled.span`
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const regionLabel = (value?: string | null) => {
  if (value === '77') return '77 — Москва';
  if (value === '78') return '78 — Санкт-Петербург';
  if (value === '50') return '50 — Московская область';
  return '';
};

export function AppShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAdmin, region, fullName, username } = useAppSelector((state) => state.auth);
  const tickets = useAppSelector((state) => state.feedback?.tickets ?? []);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentUserId = isAdmin ? 'admin-1' : `user-${region ?? '77'}`;

  const unreadCount = tickets
      .filter((ticket) => (isAdmin ? true : ticket.createdByUserId === currentUserId))
      .reduce(
          (acc, ticket) => acc + (isAdmin ? ticket.unreadForAdmin : ticket.unreadForUser),
          0,
      );

  const navItems = [
    { label: 'Комиссии', to: '/commissions' },
    { label: 'Долг 2-го уровня', to: '/mo' },
    { label: 'Рейтинг МО', to: '/rating' },
    { label: 'Документы', to: '/documents' },
    { label: 'Обратная связь', to: '/feedback', badge: unreadCount },
    ...(isAdmin
        ? [
          { label: 'Статистика регионов', to: '/region-stats' },
          { label: 'Админка', to: '/admin' },
        ]
        : []),
  ];

  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen]);

  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // ignore
    }

    dispatch(logout());
    setIsDrawerOpen(false);
    navigate('/login', { replace: true });
  };

  const displayName =
      fullName?.trim() ||
      (isAdmin ? 'Администратор' : regionLabel(region) || username || 'Пользователь');

  return (
      <Shell>
        <Overlay $open={isDrawerOpen} onClick={closeDrawer} />

        <Sidebar $open={isDrawerOpen}>
          <Brand>Commissions</Brand>

          <Nav>
            {navItems.map((item) => (
                <NavItem key={item.to} to={item.to} onClick={closeDrawer}>
                  <NavLabel>{item.label}</NavLabel>
                  {'badge' in item && item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
                </NavItem>
            ))}
          </Nav>
        </Sidebar>

        <Main>
          <TopBar>
            <TopBarLeft>
              <IconButton type="button" onClick={toggleDrawer} aria-label="Открыть навигацию">
                ☰
              </IconButton>
              <BrandMobile>Commissions</BrandMobile>
            </TopBarLeft>

            <TopBarRight>
              <UserName title={displayName}>
                {displayName}
                {isAdmin ? ' · Администратор' : ''}
              </UserName>

              <ThemeButton type="button" onClick={() => dispatch(toggleTheme())}>
                Сменить тему
              </ThemeButton>

              <LogoutButton type="button" onClick={handleLogout}>
                Выйти
              </LogoutButton>
            </TopBarRight>
          </TopBar>

          <Content>
            <Outlet />
          </Content>
        </Main>
      </Shell>
  );
}