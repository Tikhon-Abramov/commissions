import { NavLink, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme } from '../../features/theme/themeSlice';

const Shell = styled.div`
  min-height: 100vh;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 5;
  backdrop-filter: blur(12px);
  background: ${({ theme }) => theme.headerBackground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderInner = styled.div`
  max-width: ${({ theme }) => theme.container};
  margin: 0 auto;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const Brand = styled.div`
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Nav = styled.nav`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const NavItem = styled(NavLink)`
  padding: 10px 14px;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.muted};
  &.active {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.primarySoft};
  }
`;

const ThemeButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
`;

const Main = styled.main`
  max-width: ${({ theme }) => theme.container};
  margin: 0 auto;
  padding: 28px 24px 48px;
`;

export function AppShell() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <Brand>Top Debts Platform</Brand>
          <RightGroup>
            <Nav>
              <NavItem to="/commissions">Комиссии</NavItem>
              <NavItem to="/mo">Долг 2-го уровня</NavItem>
              <NavItem to="/rating">Рейтинг МО</NavItem>
              <NavItem to="/documents">Документы</NavItem>
              <NavItem to="/feedback">Обратная связь</NavItem>
            </Nav>
            <ThemeButton type="button" onClick={() => dispatch(toggleTheme())}>
              {mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            </ThemeButton>
          </RightGroup>
        </HeaderInner>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  );
}
