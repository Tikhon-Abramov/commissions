import styled from 'styled-components';

const Wrap = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
`;

const BaseControl = `
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
`;

const Control = styled.input`${BaseControl}`;
const Select = styled.select`${BaseControl}`;

export interface FilterField {
  key: string;
  label: string;
  type?: 'text' | 'select';
  placeholder?: string;
  value: string;
  options?: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export function FilterBar({ fields }: { fields: FilterField[] }) {
  return (
    <Wrap>
      {fields.map((field) => (
        <Field key={field.key}>
          {field.label}
          {field.type === 'select' ? (
            <Select value={field.value} onChange={(event) => field.onChange(event.target.value)}>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : (
            <Control
              placeholder={field.placeholder}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
            />
          )}
        </Field>
      ))}
    </Wrap>
  );
}
