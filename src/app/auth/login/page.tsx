'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? '邮箱或密码错误' : authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="card max-w-md w-full">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Search className="h-10 w-10 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">登录</h1>
        <p className="text-gray-500 text-sm mt-1">登录校园失物招领平台</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入邮箱" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          登录
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        还没有账号？<Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">立即注册</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-gray-500">加载中...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
