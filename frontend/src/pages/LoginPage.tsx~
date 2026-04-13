import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: ${({ theme }) => theme.colors.background};
`;

const Card = styled.div`
  width: min(480px, 100%);
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px 24px 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.p`
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  line-height: 1.5;
`;

const MaintenanceBox = styled.div`
  margin: 0 24px 16px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(245, 158, 11, 0.28);
  background: rgba(245, 158, 11, 0.1);
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  line-height: 1.5;
`;

const Form = styled.form`
  padding: 0 24px 24px;
  display: grid;
  gap: 14px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  height: 46px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const PrimaryButton = styled.button`
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

const SecondaryButton = styled.button`
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  cursor: pointer;
`;

const regionLabel = (value: string) => {
    if (value === '77') return '77 — Москва';
    if (value === '78') return '78 — Санкт-Петербург';
    if (value === '50') return '50 — Московская область';
    return 'Регион';
};

export function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { userKey } = useAppSelector((state) => state.auth);
    const { users, serviceMode } = useAppSelector((state) => state.admin);

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [adminOnlyAttempt, setAdminOnlyAttempt] = useState(serviceMode.enabled);
    const [error, setError] = useState('');

    const redirectTo = useMemo(() => {
        const fromState = location.state as { from?: string } | null;
        return fromState?.from || '/commissions';
    }, [location.state]);

    if (userKey) {
        return <Navigate to={redirectTo} replace />;
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const foundUser = users.find(
            (user) =>
                user.login === login.trim() &&
                user.password === password &&
                user.isActive,
        );

        if (!foundUser) {
            setError('Неверный логин или пароль, либо аккаунт деактивирован.');
            return;
        }

        if (serviceMode.enabled && foundUser.role !== 'admin') {
            setError('Сервис временно недоступен для пользователей. Войти может только администратор.');
            return;
        }

        if (adminOnlyAttempt && foundUser.role !== 'admin') {
            setError('В режиме доступа администратора войти может только администратор.');
            return;
        }

        dispatch(
            setCredentials({
                userKey: `session-${foundUser.id}-${Date.now()}`,
                username: foundUser.login,
                fullName: `${foundUser.lastName} ${foundUser.firstName} ${foundUser.middleName}`.trim(),
                isAdmin: foundUser.role === 'admin',
                role: foundUser.role,
                region: foundUser.role === 'admin' ? null : foundUser.region,
            }),
        );

        navigate(foundUser.role === 'admin' ? '/admin' : redirectTo, { replace: true });
    };

    return (
        <Page>
            <Card>
                <Header>
                    <Title>Вход в сервис</Title>
                    <Description>
                        Авторизуйтесь, чтобы продолжить работу в системе.
                    </Description>
                </Header>

                {serviceMode.enabled ? (
                    <MaintenanceBox>
                        <strong>Технические работы.</strong>
                        <br />
                        {serviceMode.message}
                    </MaintenanceBox>
                ) : null}

                <Form onSubmit={handleSubmit}>
                    <Field>
                        Логин
                        <Input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Введите логин" />
                    </Field>

                    <Field>
                        Пароль
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                        />
                    </Field>

                    {error ? <ErrorText>{error}</ErrorText> : null}

                    <Actions>
                        <PrimaryButton type="submit">
                            Войти
                        </PrimaryButton>

                        {serviceMode.enabled ? (
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    setAdminOnlyAttempt(true);
                                    setError('');
                                }}
                            >
                                Вход для администратора
                            </SecondaryButton>
                        ) : null}
                    </Actions>

                    {!serviceMode.enabled ? (
                        <Description>
                            Тестовые аккаунты пользователей привязаны к регионам: {regionLabel('77')}, {regionLabel('78')}, {regionLabel('50')}.
                        </Description>
                    ) : null}
                </Form>
            </Card>
        </Page>
    );
}