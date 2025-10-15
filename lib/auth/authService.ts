/**
 * Authentication Service
 * 
 * Client-side authentication functions
 */

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  error?: string;
}

/**
 * Sign up with email and password
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '회원가입에 실패했습니다',
      };
    }

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }

    return {
      success: true,
      token: result.token,
      user: result.user,
    };
  } catch (error) {
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다',
    };
  }
}

/**
 * Login with email and password
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '로그인에 실패했습니다',
      };
    }

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }

    return {
      success: true,
      token: result.token,
      user: result.user,
    };
  } catch (error) {
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다',
    };
  }
}

/**
 * Logout
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
