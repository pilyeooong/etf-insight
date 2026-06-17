import { HashRouter, Route, Routes } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { DetailPage } from '@/pages/DetailPage';

function App() {
  return (
    <HashRouter>
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#fff' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/etf/:code" element={<DetailPage />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
}

export default App;
