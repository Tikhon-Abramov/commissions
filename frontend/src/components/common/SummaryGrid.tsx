import styled from 'styled-components';
import type { SummaryMetric } from '../../types/common';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Label = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 12px;
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
`;

const Hint = styled.div`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
`;

export function SummaryGrid({ metrics }: { metrics: SummaryMetric[] }) {
  return (
    <Grid>
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <Label>{metric.label}</Label>
          <Value>{metric.value}</Value>
          {metric.hint ? <Hint>{metric.hint}</Hint> : null}
        </Card>
      ))}
    </Grid>
  );
}
