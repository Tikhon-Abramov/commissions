import styled, { keyframes } from 'styled-components';
import type { CommissionDetailsResponse } from '../../types/commissionDetails';

const overlayFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const drawerIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 1200;
  animation: ${overlayFade} 0.22s ease;
`;

const Drawer = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  width: min(920px, 100vw);
  height: 100dvh;
  background: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: -16px 0 40px rgba(0, 0, 0, 0.14);
  z-index: 1201;
  display: grid;
  grid-template-rows: auto 1fr auto;
  animation: ${drawerIn} 0.24s ease;
`;

const Header = styled.div`
  padding: 20px 20px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

const Body = styled.div`
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px 20px 20px;
  display: grid;
  gap: 18px;
`;

const Footer = styled.div`
  padding: 14px 20px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $primary }) => ($primary ? '#fff' : theme.colors.text)};
  cursor: pointer;
`;

const Section = styled.section`
  display: grid;
  gap: 10px;
`;

const SectionTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.background};
  padding: 12px;
  min-width: 0;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Value = styled.div`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  line-height: 1.35;
  word-break: break-word;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
`;

const FieldLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Textarea = styled.textarea`
  min-height: 96px;
  resize: vertical;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Row = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.text};
`;

const HistoryList = styled.div`
  display: grid;
  gap: 8px;
`;

const HistoryItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background};
  padding: 10px 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const FileRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

const LoadingText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

const displayOrDash = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
};

const formatMoney = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    return Number.isFinite(num) ? `${num.toLocaleString('ru-RU')} ₽` : String(value);
};

export const COMMISSION_STATUS_OPTIONS = [
    '',
    'Не требуется проведение комиссии',
    'Комиссия проведена',
    'Неявка на комиссию',
] as const;

export const INTERACTION_STATUS_OPTIONS = [
    '',
    'Долг погашен',
    'Погасит в течение месяца',
    'Погасит в течение квартала',
    'Согласие на оплату после поступления денежных средств от дебитора',
    'Представлена уточненная НД с суммой, превышающей начисления',
    'Рассматривается вопрос о предоставлении отсрочки/рассрочки',
    'Есть решение об отложении мер взыскания',
    'НП "На особом контроле"',
    'Клиент "Площадки реструктуризации долга"',
    'Задолженность оспаривается',
    'Отказ от погашения долга',
    'Долг подлежит списанию',
    'НП в отчетном квартале - мигрировал',
    'НП в отчетном квартале - ликвидирован',
    'НП в отчетном квартале - исключен в связи со смертью',
    'НП в отчетном квартале - гражданин признан банкротом/реализация имущества',
    'НП в отчетном квартале - конкурсное производство',
] as const;

type Details = CommissionDetailsResponse['data'];

type Props = {
    open: boolean;
    loading: boolean;
    saving: boolean;
    error: string;
    details: Details | null;
    onClose: () => void;
    onSave: () => void;
    onChange: (updater: (prev: Details) => Details) => void;
    onPickFile: (file: File | null) => void;
    onDownloadFile: (fileId: number | null) => void;
};

export function CommissionDetailsDrawer({
                                            open,
                                            loading,
                                            saving,
                                            error,
                                            details,
                                            onClose,
                                            onSave,
                                            onChange,
                                            onPickFile,
                                            onDownloadFile,
                                        }: Props) {
    if (!open) return null;

    return (
        <>
            <Overlay onClick={onClose} />
            <Drawer>
                <Header>
                    <Title>Просмотр ИНН</Title>
                    <Button type="button" onClick={onClose}>Закрыть</Button>
                </Header>

                <Body>
                    {loading ? <LoadingText>Загрузка...</LoadingText> : null}
                    {error ? <ErrorText>{error}</ErrorText> : null}

                    {details ? (
                        <>
                            <Section>
                                <SectionTitle>Основная информация</SectionTitle>
                                <InfoGrid>
                                    <Card><Label>ИНН</Label><Value>{displayOrDash(details.inn)}</Value></Card>
                                    <Card><Label>Код НО</Label><Value>{displayOrDash(details.kno)}</Value></Card>
                                    <Card><Label>ОКТМО</Label><Value>{displayOrDash(details.oktmo)}</Value></Card>
                                    <Card><Label>Сотрудники с задолженностью</Label><Value>{displayOrDash(details.employeesWithDebt)}</Value></Card>
                                    <Card><Label>Кол-во объектов недвижимости</Label><Value>{displayOrDash(details.realEstateCount)}</Value></Card>
                                    <Card><Label>Кол-во земельных участков</Label><Value>{displayOrDash(details.landCount)}</Value></Card>
                                    <Card><Label>Кол-во транспортных средств</Label><Value>{displayOrDash(details.transportCount)}</Value></Card>
                                    <Card><Label>Адрес</Label><Value>{displayOrDash(details.address)}</Value></Card>
                                    <Card><Label>ОКВЭД</Label><Value>{displayOrDash(details.okved)}</Value></Card>
                                    <Card><Label>Наименование</Label><Value>{displayOrDash(details.name)}</Value></Card>
                                </InfoGrid>
                            </Section>

                            <Section>
                                <SectionTitle>Выручка</SectionTitle>
                                <InfoGrid>
                                    <Card><Label>2024</Label><Value>{formatMoney(details.revenue?.['2024'])}</Value></Card>
                                    <Card><Label>2023</Label><Value>{formatMoney(details.revenue?.['2023'])}</Value></Card>
                                    <Card><Label>2022</Label><Value>{formatMoney(details.revenue?.['2022'])}</Value></Card>
                                    <Card><Label>2021</Label><Value>{formatMoney(details.revenue?.['2021'])}</Value></Card>
                                </InfoGrid>
                            </Section>

                            <Section>
                                <SectionTitle>Среднесписочная численность</SectionTitle>
                                <InfoGrid>
                                    <Card><Label>2024</Label><Value>{displayOrDash(details.avgHeadcount?.['2024'])}</Value></Card>
                                    <Card><Label>2023</Label><Value>{displayOrDash(details.avgHeadcount?.['2023'])}</Value></Card>
                                    <Card><Label>2022</Label><Value>{displayOrDash(details.avgHeadcount?.['2022'])}</Value></Card>
                                    <Card><Label>2021</Label><Value>{displayOrDash(details.avgHeadcount?.['2021'])}</Value></Card>
                                </InfoGrid>
                            </Section>

                            <Section>
                                <SectionTitle>Текущие показатели</SectionTitle>
                                <InfoGrid>
                                    <Card><Label>Сальдо ЕНС</Label><Value>{formatMoney(details.currentSaldoEns)}</Value></Card>
                                    <Card><Label>Задолженность перед регионом с учетом пени, справочная информация</Label><Value>{formatMoney(details.currentRegionDebt)}</Value></Card>
                                </InfoGrid>
                            </Section>

                            <Section>
                                <SectionTitle>Данные за предыдущие периоды</SectionTitle>
                                <InfoGrid>
                                    <Card>
                                        <Label>Сальдо ЕНС</Label>
                                        <HistoryList>
                                            {(details.previousPeriodsSaldo ?? []).length ? (
                                                details.previousPeriodsSaldo!.map((row) => (
                                                    <HistoryItem key={`saldo-${row.date}`}>
                                                        {row.date} — {formatMoney(row.value)}
                                                    </HistoryItem>
                                                ))
                                            ) : (
                                                <Value>Нет данных</Value>
                                            )}
                                        </HistoryList>
                                    </Card>
                                    <Card>
                                        <Label>Задолженность перед регионом</Label>
                                        <HistoryList>
                                            {(details.previousPeriodsKnsum ?? []).length ? (
                                                details.previousPeriodsKnsum!.map((row) => (
                                                    <HistoryItem key={`knsum-${row.date}`}>
                                                        {row.date} — {formatMoney(row.value)}
                                                    </HistoryItem>
                                                ))
                                            ) : (
                                                <Value>Нет данных</Value>
                                            )}
                                        </HistoryList>
                                    </Card>
                                </InfoGrid>
                            </Section>

                            <Section>
                                <SectionTitle>Меры взыскания</SectionTitle>
                                <InfoGrid>
                                    <Card><Label>Наличие требования</Label><Value>{displayOrDash(details.enforcement?.demandExists)}</Value></Card>
                                    <Card><Label>Наличие решения 46ст</Label><Value>{displayOrDash(details.enforcement?.decision46Exists)}</Value></Card>
                                    <Card><Label>Кол-во постановлений 47ст</Label><Value>{displayOrDash(details.enforcement?.post47Count)}</Value></Card>
                                    <Card><Label>Остаток задолженности по 47ст</Label><Value>{formatMoney(details.enforcement?.post47DebtRest)}</Value></Card>
                                    <Card><Label>Кол-во ЗВСП по 48ст</Label><Value>{displayOrDash(details.enforcement?.zvsp48Count)}</Value></Card>
                                    <Card><Label>Остаток задолженности по ЗВСП</Label><Value>{formatMoney(details.enforcement?.zvspDebtRest)}</Value></Card>
                                </InfoGrid>
                            </Section>

                            <Section>
                                <Field>
                                    <FieldLabel>Проведение комиссии</FieldLabel>
                                    <Select
                                        value={details.commission.comEvents || ''}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                commission: { ...prev.commission, comEvents: e.target.value },
                                            }))
                                        }
                                    >
                                        {COMMISSION_STATUS_OPTIONS.map((item) => (
                                            <option key={item} value={item}>
                                                {item || '--Выберите статус комиссии--'}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>

                                <Field>
                                    <FieldLabel>Результат взаимодействия с НП</FieldLabel>
                                    <Select
                                        value={details.event.events || ''}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                event: { ...prev.event, events: e.target.value },
                                            }))
                                        }
                                    >
                                        {INTERACTION_STATUS_OPTIONS.map((item) => (
                                            <option key={item} value={item}>
                                                {item || '--Выберите статус--'}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>

                                <Field>
                                    <FieldLabel>Дата проведения комиссии</FieldLabel>
                                    <Input
                                        type="date"
                                        value={details.commission.comDate || ''}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                commission: { ...prev.commission, comDate: e.target.value },
                                            }))
                                        }
                                    />
                                </Field>

                                <Row>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(Number(details.commission.impactMeasures || 0))}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                commission: {
                                                    ...prev.commission,
                                                    impactMeasures: e.target.checked ? '1' : '0',
                                                },
                                            }))
                                        }
                                    />
                                    Меры воздействия со стороны региональных / местных органов власти, прокуратура, правоохранительные органы, ФССП и ФОИВ
                                </Row>

                                <Row>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(Number(details.commission.ogvOmsuParticipation || 0))}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                commission: {
                                                    ...prev.commission,
                                                    ogvOmsuParticipation: e.target.checked ? '1' : '0',
                                                },
                                            }))
                                        }
                                    />
                                    Участие в комиссии представителей органов государственной власти (ОГВ) и органов местного самоуправления (ОМСУ)
                                </Row>

                                <Field>
                                    <FieldLabel>Примечание к комиссии</FieldLabel>
                                    <Textarea
                                        value={details.commission.note || ''}
                                        onChange={(e) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                commission: { ...prev.commission, note: e.target.value },
                                            }))
                                        }
                                    />
                                </Field>
                            </Section>

                            <Section>
                                <SectionTitle>Файл протокола</SectionTitle>
                                <FileRow>
                                    {details.file.originalFilename ? (
                                        <>
                                            <Value>{details.file.originalFilename}</Value>
                                            <Button
                                                type="button"
                                                onClick={() => onDownloadFile(details.file.id)}
                                            >
                                                Скачать файл
                                            </Button>
                                        </>
                                    ) : (
                                        <Value>Не загружен</Value>
                                    )}

                                    <HiddenFileInput
                                        id="commission-protocol-file"
                                        type="file"
                                        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            document.getElementById('commission-protocol-file')?.click()
                                        }
                                    >
                                        {details.file.originalFilename ? 'Заменить файл' : 'Загрузить файл'}
                                    </Button>
                                </FileRow>
                            </Section>

                            <Section>
                                <SectionTitle>История изменений</SectionTitle>
                                <HistoryList>
                                    {(details.changesHistory ?? []).length ? (
                                        details.changesHistory!.map((row, index) => (
                                            <HistoryItem key={`${row.changedAt}-${index}`}>
                                                <div><b>{displayOrDash(row.changedAt)}</b></div>
                                                <div>{displayOrDash(row.text)}</div>
                                            </HistoryItem>
                                        ))
                                    ) : (
                                        <Value>Нет данных</Value>
                                    )}
                                </HistoryList>
                            </Section>
                        </>
                    ) : null}
                </Body>

                <Footer>
                    <Button type="button" onClick={onClose}>Закрыть</Button>
                    <Button type="button" $primary onClick={onSave} disabled={saving || loading || !details}>
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </Footer>
            </Drawer>
        </>
    );
}