'use client';

/**
 * Email/Password Signup Page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/lib/auth/authService';
import { useAuthStore } from '@/lib/stores/authStore';

export default function EmailSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signup({ email, password, name });
      
      if (!result.success) {
        setError(result.error || '회원가입에 실패했습니다');
        return;
      }

      // Create auth user
      const authUser = {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name || undefined,
        authProvider: 'email' as const,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      
      login(authUser);
      router.push('/app/map');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>이메일로 가입하기</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>이름 (선택)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>이메일 *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>비밀번호 *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="최소 8자, 대소문자, 숫자 포함"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            최소 8자, 대문자, 소문자, 숫자 포함
          </small>
        </div>

        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '5px', color: '#c00' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px',
            backgroundColor: isLoading ? '#ccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
          }}
        >
          {isLoading ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/auth/signup" style={{ color: '#3b82f6' }}>
          ← Apple로 가입하기
        </Link>
        {' | '}
        <Link href="/auth/login" style={{ color: '#3b82f6' }}>
          로그인
        </Link>
      </div>
    </div>
  );
}
