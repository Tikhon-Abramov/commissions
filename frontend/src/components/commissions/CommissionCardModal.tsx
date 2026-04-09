import styled from 'styled-components';
import type { CommissionCompanyCard, CommissionEditForm } from '../../types/commission';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  justify-content: flex-end;
  z-index: 20;
`;

const Panel = styled.div`
  width: min(760px, 100%);
  height: 100%;
  overflow: auto;
  background: ${({ theme }) => theme.colors.background};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0 0 6px;
`;

const Sub = styled.div`
  color: ${({ theme }) => theme.colors.muted};
`;

const CloseButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 16px;
`;

const Label = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 8px;
`;

const Value = styled.div`
  font-size: 15px;
  line-height: 1.5;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 18px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 14px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
`;

const controlStyle = `
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`${controlStyle}`;
const Select = styled.select`${controlStyle}`;
const TextArea = styled.textarea`${controlStyle}; min-height: 110px; resize: vertical;`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
`;

const HistoryList = styled.div`
  display: grid;
  gap: 10px;
`;

const HistoryItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const SecondaryButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
`;

const PrimaryButton = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
`;

const FullWidth = styled.div`
  grid-column: 1 / -1;
`;

const currency = (value?: number | null) =>
  typeof value === 'number' ? `${value.toLocaleString('ru-RU')} ₽` : '—';

interface Props {
  open: boolean;
  card: CommissionCompanyCard | null;
  form: CommissionEditForm;
  onClose: () => void;
  onSave: () => void;
  onChange: (patch: Partial<CommissionEditForm>) => void;
}

const commissionStatusOptions = ['', 'Не требуется проведение комиссии', 'Комиссия проведена', 'Неявка на комиссию'];
const interactionStatusOptions = [
  '',
  'Долг погашен',
  'Погасит в течение месяца',
  'Погасит в течение квартала',
  'Согласие на оплату после поступления денежных средств от дебитора',
  'Есть решение об отложении мер взыскания',
  'На особом контроле',
  'Отказ от погашения долга',
  'Долг подлежит списанию',
];

export function CommissionCardModal({ open, card, form, onClose, onSave, onChange }: Props) {
  if (!open || !card) {
    return null;
  }

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(event) => event.stopPropagation()}>
        <Header>
          <div>
            <Title>Просмотр ИНН</Title>
            <Sub>{card.name} · ИНН {card.inn}</Sub>
          </div>
          <CloseButton type="button" onClick={onClose}>
            Закрыть
          </CloseButton>
        </Header>

        <Grid>
          <Card><Label>Код НО</Label><Value>{card.kno || '—'}</Value></Card>
          <Card><Label>ОКТМО</Label><Value>{card.oktmo || '—'}</Value></Card>
          <Card><Label>Адрес</Label><Value>{card.address || '—'}</Value></Card>
          <Card><Label>ОКВЭД</Label><Value>{card.okved || '—'}</Value></Card>
          <Card><Label>Сотрудники с задолженностью</Label><Value>{card.workersWithDebt ?? '—'}</Value></Card>
          <Card><Label>Задолженность сотрудников</Label><Value>{currency(card.workersDebt)}</Value></Card>
          <Card><Label>Объекты недвижимости</Label><Value>{card.propertiesCount ?? '—'}</Value></Card>
          <Card><Label>Земельные участки</Label><Value>{card.landCount ?? '—'}</Value></Card>
          <Card><Label>Транспортные средства</Label><Value>{card.transportCount ?? '—'}</Value></Card>
          <Card><Label>Среднесписочная численность 2024</Label><Value>{card.averageHeadcount?.['2024'] ?? '—'}</Value></Card>
        </Grid>

        <Section>
          <SectionTitle>Сальдо ЕНС и динамика</SectionTitle>
          <Grid>
            {card.balances?.map((balance) => (
              <Card key={balance.date}>
                <Label>{balance.date}</Label>
                <Value>
                  Сальдо ЕНС: {currency(balance.amount * 1000)}
                  <br />
                  Долг перед регионом: {currency((balance.debtToRegion ?? 0) * 1000)}
                </Value>
              </Card>
            ))}
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Проведение комиссии</SectionTitle>
          <FormGrid>
            <Field>
              Статус комиссии
              <Select value={form.commissionStatus} onChange={(event) => onChange({ commissionStatus: event.target.value })}>
                {commissionStatusOptions.map((option) => (
                  <option key={option} value={option}>{option || '--Выберите статус комиссии--'}</option>
                ))}
              </Select>
            </Field>
            <Field>
              Результат взаимодействия с НП
              <Select value={form.interactionStatus} onChange={(event) => onChange({ interactionStatus: event.target.value })}>
                {interactionStatusOptions.map((option) => (
                  <option key={option} value={option}>{option || '--Выберите статус--'}</option>
                ))}
              </Select>
            </Field>
            <Field>
              Дата проведения комиссии
              <Input type="date" value={form.commissionDate} onChange={(event) => onChange({ commissionDate: event.target.value })} />
            </Field>
            <Field>
              Файл протокола
              <Input
                type="text"
                placeholder="Например: protocol-7701234567.pdf"
                value={form.protocolFileName}
                onChange={(event) => onChange({ protocolFileName: event.target.value })}
              />
            </Field>
            <FullWidth>
              <Field>
                Примечание к комиссии
                <TextArea value={form.note} onChange={(event) => onChange({ note: event.target.value })} />
              </Field>
            </FullWidth>
          </FormGrid>
          <CheckboxRow>
            <input type="checkbox" checked={form.measures} onChange={(event) => onChange({ measures: event.target.checked })} />
            Меры воздействия со стороны региональных / местных органов власти, прокуратуры, правоохранительных органов, ФССП и ФОИВ
          </CheckboxRow>

          <Actions>
            <SecondaryButton type="button" onClick={onClose}>Закрыть</SecondaryButton>
            <PrimaryButton type="button" onClick={onSave}>Сохранить</PrimaryButton>
          </Actions>
        </Section>

        <Section>
          <SectionTitle>История изменений</SectionTitle>
          <HistoryList>
            {card.history?.length ? card.history.map((item) => (
              <HistoryItem key={item.id}>
                <strong>{item.date}</strong> · {item.username}
                <div>{item.action}</div>
              </HistoryItem>
            )) : <Sub>Изменения еще не вносились.</Sub>}
          </HistoryList>
        </Section>
      </Panel>
    </Overlay>
  );
}
