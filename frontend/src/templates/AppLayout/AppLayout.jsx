import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Sidebar } from '../../components/organisms/Sidebar/Sidebar';

const LayoutWrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
`;

export const AppLayout = () => {
  return (
    <LayoutWrapper>
      <Sidebar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutWrapper>
  );
};

export default AppLayout;