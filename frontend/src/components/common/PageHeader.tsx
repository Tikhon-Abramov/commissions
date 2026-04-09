import styled from 'styled-components';

const Wrapper = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0 0 10px;
  font-size: clamp(28px, 3vw, 42px);
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 860px;
  line-height: 1.6;
`;

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Wrapper>
  );
}
