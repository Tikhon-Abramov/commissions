import styled from 'styled-components';
import type { MouseEvent } from 'react';
import type { DebtCard } from '../../types/secondLevelDebt';

type Props = {
    open: boolean;
    card: DebtCard | null;
    onClose: () => void;
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Panel = styled.div`
  width: min(720px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 22px;
`;

const Subtitle = styled.div`
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
`;

const Body = styled.div`
  padding: 20px 24px;
  display: grid;
  gap: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Item = styled.div`
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  padding: 14px;
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  margin-bottom: 6px;
`;

const Value = styled.div`
  font-size: 14px;
  line-height: 1.35;
`;

const Footer = styled.div`
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button`
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const formatAmount = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

export function DebtCardModal({ open, card, onClose }: Props) {
    if (!open || !card) return null;

    const stop = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    return (
        <Overlay onClick={onClose}>
            <Panel onClick={stop}>
                <Header>
                    <Title>ИНН</Title>
                    <Subtitle>
                        {card.inn} · {card.name}
                    </Subtitle>
                </Header>

                <Body>
                    <Grid>
                        <Item>
                            <Label>ИНН</Label>
                            <Value>{card.inn}</Value>
                        </Item>
                        <Item>
                            <Label>Код НО</Label>
                            <Value>{card.kno || '—'}</Value>
                        </Item>
                        <Item>
                            <Label>ОКТМО</Label>
                            <Value>{card.oktmo || '—'}</Value>
                        </Item>
                        <Item>
                            <Label>Адрес</Label>
                            <Value>{card.address || '—'}</Value>
                        </Item>
                        <Item>
                            <Label>ОКВЭД</Label>
                            <Value>{card.okved || '—'}</Value>
                        </Item>
                        <Item>
                            <Label>Сотрудники</Label>
                            <Value>
                                Всего: {card.employeesCount}
                                <br />
                                Должников: {card.debtorsCount}
                                <br />
                                Сумма задолженности: {formatAmount(card.debtAmount)}
                            </Value>
                        </Item>
                    </Grid>
                </Body>

                <Footer>
                    <Button type="button" onClick={onClose}>
                        Закрыть
                    </Button>
                </Footer>
            </Panel>
        </Overlay>
    );
}