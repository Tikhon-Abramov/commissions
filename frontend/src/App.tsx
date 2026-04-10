import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { AppLayout } from './components/layout/AppLayout';
import { CommissionsPage } from './pages/CommissionsPage';
import { SecondLevelDebtPage } from './pages/SecondLevelDebtPage';
import { RatingPage } from './pages/RatingPage';

const AppShell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

export default function App() {
    return (
        <BrowserRouter>
            <AppShell>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/commissions" replace />} />
                        <Route path="/commissions" element={<CommissionsPage />} />
                        <Route path="/second-level-debt" element={<SecondLevelDebtPage />} />
                        <Route path="/rating" element={<RatingPage />} />
                        <Route path="*" element={<Navigate to="/commissions" replace />} />
                    </Routes>
                </AppLayout>
            </AppShell>
        </BrowserRouter>
    );
}