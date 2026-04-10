import styled from 'styled-components';
import { PageHeader } from '../components/common/PageHeader';
import { documentsList } from '../features/documents/mockData';
import type { DocumentItem } from '../types/documents';

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.surface};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
`;

const HeadCell = styled.th`
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Cell = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
`;

const FileLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const CategoryText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 4px;
`;

const EmptyState = styled.div`
  padding: 28px 20px;
  color: ${({ theme }) => theme.colors.muted};
`;

export function DocumentsPage() {
    const data: DocumentItem[] = documentsList;

    return (
        <>
            <PageHeader
                title="Документы"
                description="Примеры оформления документов в табличном виде: слева название, справа сам документ."
            />

            {!data.length ? (
                <EmptyState>Документы отсутствуют</EmptyState>
            ) : (
                <TableWrap>
                    <Table>
                        <thead>
                        <tr>
                            <HeadCell style={{ width: '65%' }}>Название документа</HeadCell>
                            <HeadCell style={{ width: '35%' }}>Документ</HeadCell>
                        </tr>
                        </thead>

                        <tbody>
                        {data.map((item) => (
                            <tr key={item.id}>
                                <Cell>
                                    <div>{item.title}</div>
                                    {item.category ? <CategoryText>{item.category}</CategoryText> : null}
                                </Cell>

                                <Cell>
                                    <FileLink
                                        href={item.fileUrl || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        📎 {item.fileName}
                                    </FileLink>
                                </Cell>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </TableWrap>
            )}
        </>
    );
}