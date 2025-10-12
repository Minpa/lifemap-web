'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from './Header.module.css';

const navLinks = [
  { href: '/app/map', label: 'Map', ariaLabel: '내 지도' },
  { href: '/runs', label: 'Running', ariaLabel: '러닝' },
  { href: '/journal', label: 'Journal', ariaLabel: '일기' },
  { href: '/photos', label: 'Photos', ariaLabel: '사진' },
  { href: '/palette', label: 'Palette', ariaLabel: '팔레트' },
  { href: '/privacy', label: 'Privacy', ariaLabel: '프라이버시' },
  { href: '/settings', label: '⚙︎', ariaLabel: '설정' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Subscribe to auth store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const hasAccess = isAuthenticated || isGuest;

  // Hide header on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header role="banner" className={styles.header} data-component="Header">
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <span aria-hidden="true" className={styles.icon}>
            🌍
          </span>
          <span className={styles.brandText}>LifeMap</span>
        </Link>

        {hasAccess ? (
          <>
            <nav aria-label="주요 메뉴" className={styles.nav}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    aria-label={link.ariaLabel}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            
            <div className={styles.userSection}>
              {isGuest && (
                <span className={styles.guestBadge}>게스트</span>
              )}
              {isAuthenticated && user && (
                <span className={styles.userName}>
                  {user.firstName || '사용자'}
                </span>
              )}
              <button onClick={handleLogout} className={styles.logoutButton}>
                로그아웃
              </button>
            </div>
          </>
        ) : (
          <div className={styles.authButtons}>
            <Link href="/auth/login" className={styles.loginButton}>
              로그인
            </Link>
            <Link href="/auth/signup" className={styles.signupButton}>
              가입하기
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
