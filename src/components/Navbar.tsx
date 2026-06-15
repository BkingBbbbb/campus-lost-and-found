'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Search, Bell, Menu, X, Shield } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('items').select('id').limit(1);
        if (data) setIsAdmin(true);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">校园失物招领</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-1">
              <NavLink href="/" active={isActive('/')}>首页</NavLink>
              <NavLink href="/lost" active={isActive('/lost')}>寻物启事</NavLink>
              <NavLink href="/found" active={isActive('/found')}>失物招领</NavLink>
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/post" className="btn-primary text-sm">发布信息</Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  {user.email?.split('@')[0] || '用户中心'}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />管理
                  </Link>
                )}
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">退出</button>
              </div>
            ) : (
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">登录</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>首页</MobileNavLink>
            <MobileNavLink href="/lost" onClick={() => setMobileOpen(false)}>寻物启事</MobileNavLink>
            <MobileNavLink href="/found" onClick={() => setMobileOpen(false)}>失物招领</MobileNavLink>
            <MobileNavLink href="/post" onClick={() => setMobileOpen(false)}>发布信息</MobileNavLink>
            {user ? (
              <>
                <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>用户中心</MobileNavLink>
                {isAdmin && <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>管理后台</MobileNavLink>}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">退出登录</button>
              </>
            ) : (
              <MobileNavLink href="/auth/login" onClick={() => setMobileOpen(false)}>登录</MobileNavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
      {children}
    </Link>
  );
}
