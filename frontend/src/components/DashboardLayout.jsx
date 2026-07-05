import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar />
          <main style={{ padding: 24, flex: 1 }}>
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
