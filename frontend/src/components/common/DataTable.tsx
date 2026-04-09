import styled from 'styled-components';
import type { ReactNode } from 'react';

type Align = 'left' | 'center' | 'right';

export type DataTableColumn<T> = {
  key: string;
  title: ReactNode;
  render: (row: T) => ReactNode;
  width?: string;
  minWidth?: string;
  align?: Align;
  sticky?: boolean;
};

type GroupHeader = {
  title: ReactNode;
  span: number;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyText?: string;
  groupHeaders?: GroupHeader[];
};

const Wrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
`;

const GroupHeadCell = styled.th`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 8px 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
`;

const HeadCell = styled.th<{
  $align?: Align;
  $width?: string;
  $minWidth?: string;
}>`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  font-weight: 700;
  white-space: normal;
  text-align: ${({ $align }) => $align ?? 'left'};
  width: ${({ $width }) => $width ?? 'auto'};
  min-width: ${({ $minWidth }) => $minWidth ?? 'auto'};
  line-height: 1.2;
`;

const BodyRow = styled.tr`
  &:hover td {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const BodyCell = styled.td<{
  $align?: Align;
  $width?: string;
  $minWidth?: string;
}>`
  background: ${({ theme }) => theme.colors.surface};
  padding: 10px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
  text-align: ${({ $align }) => $align ?? 'left'};
  width: ${({ $width }) => $width ?? 'auto'};
  min-width: ${({ $minWidth }) => $minWidth ?? 'auto'};
  font-size: 12px;
  line-height: 1.25;
`;

const EmptyState = styled.div`
  padding: 28px 20px;
  color: ${({ theme }) => theme.colors.muted};
`;

export function DataTable<T>({
                               columns,
                               data,
                               emptyText = 'Нет данных',
                               groupHeaders,
                             }: DataTableProps<T>) {
  if (!data.length) {
    return <EmptyState>{emptyText}</EmptyState>;
  }

  return (
      <Wrapper>
        <Table>
          <thead>
          {groupHeaders?.length ? (
              <tr>
                {groupHeaders.map((group, index) => (
                    <GroupHeadCell key={index} colSpan={group.span}>
                      {group.title}
                    </GroupHeadCell>
                ))}
              </tr>
          ) : null}

          <tr>
            {columns.map((column) => (
                <HeadCell
                    key={column.key}
                    $align={column.align}
                    $width={column.width}
                    $minWidth={column.minWidth}
                >
                  {column.title}
                </HeadCell>
            ))}
          </tr>
          </thead>

          <tbody>
          {data.map((row, rowIndex) => (
              <BodyRow key={rowIndex}>
                {columns.map((column) => (
                    <BodyCell
                        key={column.key}
                        $align={column.align}
                        $width={column.width}
                        $minWidth={column.minWidth}
                    >
                      {column.render(row)}
                    </BodyCell>
                ))}
              </BodyRow>
          ))}
          </tbody>
        </Table>
      </Wrapper>
  );
}