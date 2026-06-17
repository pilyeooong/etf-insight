import { useLocation, useNavigate } from 'react-router-dom';

const ITEMS = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/search', label: '검색', icon: '🔍' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: '1px solid #f2f4f6',
        background: '#fff',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 10,
      }}
    >
      {ITEMS.map((it) => {
        const active = it.path === '/' ? pathname === '/' : pathname.startsWith(it.path);
        return (
          <button
            key={it.path}
            onClick={() => navigate(it.path)}
            style={{
              flex: 1,
              padding: '10px 0 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? '#3182f6' : '#8b95a1',
              fontWeight: active ? 700 : 500,
            }}
          >
            <div style={{ fontSize: 20, lineHeight: 1.2 }}>{it.icon}</div>
            <div style={{ fontSize: 11, marginTop: 2 }}>{it.label}</div>
          </button>
        );
      })}
    </nav>
  );
}
