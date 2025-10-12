'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cloudKitService } from '@/lib/cloudkit/service';
import { cloudKitUserToAuthUser } from '@/lib/cloudkit/types';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = useAuthStore((state) => state.login);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with CloudKit
      const userIdentity = await cloudKitService.signIn();
      
      // Convert to AuthUser and update store
      const authUser = cloudKitUserToAuthUser(userIdentity);
      login(authUser);

      // Redirect to original destination or default
      const redirectTo = searchParams.get('redirect') || '/app/map';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    // Set guest mode in store
    loginAsGuest();
    
    // Redirect to original destination or default
    const redirectTo = searchParams.get('redirect') || '/app/map';
    router.push(redirectTo);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.icon}>🌍</span>
            <h1 className={styles.title}>LifeMap</h1>
          </div>
          <p className={styles.subtitle}>
            당신의 인생 여정을 아름답게 시각화합니다
          </p>
        </div>

        <div className={styles.content}>
          <button
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className={styles.appleButton}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <span className={styles.appleIcon}></span>
            )}
            <span>Apple로 로그인</span>
          </button>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.divider}>
            <span className={styles.dividerText}>또는</span>
          </div>

          <button onClick={handleGuestMode} className={styles.guestButton}>
            게스트로 계속하기
          </button>

          <div className={styles.info}>
            <p className={styles.infoText}>
              <span className={styles.infoIcon}>🔒</span>
              Apple로 로그인하면 iCloud를 통해 기기 간 동기화가 가능합니다
            </p>
            <p className={styles.infoText}>
              <span className={styles.infoIcon}>📱</span>
              게스트 모드는 이 기기에만 데이터가 저장됩니다
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className={styles.link}>
              가입하기
            </Link>
          </p>
          <p className={styles.privacy}>
            로그인하면{' '}
            <a href="/privacy-policy" className={styles.link}>
              개인정보 처리방침
            </a>
            에 동의하는 것으로 간주됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
