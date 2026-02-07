import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";

export default function MainLayout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header style={styles.header}>
        {/* 左侧 Logo */}
        <div style={styles.left}>
          <a href="/" style={styles.logo}>
            <img src="/meowmory.png" alt="Logo" style={{ height: "40px" }} />
          </a>
        </div>

        {/* 中间导航 */}
        <nav style={styles.nav}>
          <NavLink
            to="/"
            style={({ isActive }: { isActive: boolean }) =>
              isActive ? styles.navItemActive : styles.navItem
            }
          >
            HOME
          </NavLink>
          <NavLink
            to="/words"
            style={({ isActive }: { isActive: boolean }) =>
              isActive ? styles.navItemActive : styles.navItem
            }
          >
            VOCABULARY
          </NavLink>
          <NavLink
            to="/stories"
            style={({ isActive }: { isActive: boolean }) =>
              isActive ? styles.navItemActive : styles.navItem
            }
          ></NavLink>
        </nav>

        {/* 右侧状态区 */}
        <div style={styles.right}>
          {/* 连续登录 */}
          <div style={styles.streak}>
            🔥 <span>5</span>
          </div>

          {/* 用户菜单 */}
          <div style={styles.user}>
            <button
              style={styles.userButton}
              onClick={() => setOpen(!open)}
            >
              USER ▾
            </button>

            {open && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownItem}>Profile</div>
                <div style={styles.dropdownItem}>Settings</div>
                <div style={styles.dropdownDivider} />
                <div style={styles.dropdownItem}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 页面主体 */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },

  left: {
    display: "flex",
    alignItems: "center",
  },

  logo: {
    fontSize: 24,
    textDecoration: "none",
  },

  nav: {
    display: "flex",
    gap: 32,
    fontWeight: 600,
    letterSpacing: "0.04em",
  },

  navItem: {
    textDecoration: "none",
    color: "#6b7280",
    paddingBottom: 4,
  },

  navItemActive: {
    textDecoration: "none",
    color: "#111827",
    borderBottom: "2px solid #111827",
    paddingBottom: 4,
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },

  streak: {
    fontSize: 14,
    color: "#374151",
  },

  user: {
    position: "relative",
  },

  userButton: {
    background: "none",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 14,
  },

  dropdown: {
    position: "absolute",
    top: "110%",
    right: 0,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
    minWidth: 140,
    zIndex: 100,
  },

  dropdownItem: {
    padding: "10px 14px",
    fontSize: 14,
    cursor: "pointer",
    color: "#111827",
  },

  dropdownDivider: {
    height: 1,
    background: "#e5e7eb",
    margin: "4px 0",
  },

  main: {
    padding: 24,
    backgroundColor: "#fafafa",
    minHeight: "calc(100vh - 64px)",
  },
};
