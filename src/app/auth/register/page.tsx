'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少6位');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });

    if (authError) {
      setError(authError.message === 'User already registered' ? '该邮箱已注册' : authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">注册成功</h1>
          <p className="text-gray-500 mb-6">请查看您的邮箱，点击验证链接完成注册</p>
          <Link href="/auth/login" className="btn-primary inline-block">去登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Search className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">注册</h1>
          <p className="text-gray-500 text-sm mt-1">创建校园失物招领平台账号</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入学校邮箱" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少6位密码" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入密码" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            注册
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？<Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">立即登录</Link>
        </p>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
