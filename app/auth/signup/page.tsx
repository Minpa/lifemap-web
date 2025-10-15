'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cloudKitService } from '@/lib/cloudkit/service';
import { cloudKitUserToAuthUser } from '@/lib/cloudkit/types';
import { useAuthStore } from '@/lib/stores/authStore';
import { signup as emailSignup } from '@/lib/auth/authService';
import styles from './page.module.css';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const login = useAuthStore((state) => state.login);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);

  const handleAppleSignUp = async () => {
    if (!agreed) {
      setError('이용약관과 개인정보처리방침에 동의해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sign in with CloudKit (signup uses same flow as login)
      const userIdentity = await cloudKitService.signIn();
      
      // Convert to AuthUser and update store
      const authUser = cloudKitUserToAuthUser(userIdentity);
      login(authUser);

      // Redirect to original destination or default
      const redirectTo = searchParams.get('redirect') || '/app/map';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.message || '가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      setError('이용약관과 개인정보처리방침에 동의해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await emailSignup({ email, password, name });
      
      if (!result.success) {
        setError(result.error || '회원가입에 실패했습니다');
        return;
      }

      // Create auth user and update store
      const authUser = {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name || undefined,
        authProvider: 'email' as const,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      
      login(authUser);

      // Redirect
      const redirectTo = searchParams.get('redirect') || '/app/map';
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다');
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
            <h1 className={styles.title}>LifeMap 시작하기</h1>
          </div>
          <p className={styles.subtitle}>
            당신만의 인생 지도를 만들어보세요
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔒</span>
            <span className={styles.featureText}>완전한 프라이버시 보장</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>☁️</span>
            <span className={styles.featureText}>iCloud 자동 동기화</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📱</span>
            <span className={styles.featureText}>모든 기기에서 접근</span>
          </div>
        </div>

        <div className={styles.content}>
          <button
            onClick={handleAppleSignUp}
            disabled={isLoading || !agreed}
            className={styles.appleButton}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <span className={styles.appleIcon}>🍎</span>
            )}
            <span>Apple로 가입하기</span>
          </button>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <label className={styles.agreement}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.agreementText}>
              <Link href="/terms" className={styles.link}>
                이용약관
              </Link>
              과{' '}
              <Link href="/privacy-policy" className={styles.link}>
                개인정보처리방침
              </Link>
              에 동의합니다
            </span>
          </label>

          <div className={styles.divider}>
            <span className={styles.dividerText}>또는</span>
          </div>

          <button onClick={handleGuestMode} className={styles.guestButton}>
            게스트로 체험하기
          </button>

          <div className={styles.info}>
            <p className={styles.infoText}>
              <span className={styles.infoIcon}>📱</span>
              게스트 모드에서는 데이터가 이 기기에만 저장됩니다
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className={styles.link}>
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
