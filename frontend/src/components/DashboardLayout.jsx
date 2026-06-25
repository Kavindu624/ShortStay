import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-w)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ marginTop: 64, padding: 24, flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
