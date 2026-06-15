'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import type { Item, Claim } from '@/types';
import { Package, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'items' | 'claims'>('items');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirect=/dashboard');
        return;
      }
      setUser(user);
      fetchItems(user.id);
      fetchClaims(user.id);
    };
    checkUser();
  }, []);

  const fetchItems = async (userId: string) => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const fetchClaims = async (userId: string) => {
    const { data } = await supabase
      .from('claims')
      .select('*, items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setClaims(data);
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('确定要删除这条信息吗？')) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('items').delete as any)().eq('id', id);
    if (!error) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', resolved: 'bg-blue-100 text-blue-800', closed: 'bg-gray-100 text-gray-500' };
    const labels: Record<string, string> = { pending: '待审核', approved: '已通过', resolved: '已认领', closed: '已关闭' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">用户中心</h1>
      <p className="text-gray-500 mb-6">{user?.email}</p>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('items')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${tab === 'items' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          我的发布 ({items.length})
        </button>
        <button
          onClick={() => setTab('claims')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${tab === 'claims' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          我的认领 ({claims.length})
        </button>
      </div>

      {tab === 'items' && (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">还没有发布过信息</p>
              <Link href="/post" className="btn-primary mt-4 inline-block">立即发布</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="card flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {item.type === 'lost' ? '寻物' : '招领'}
                    </span>
                    {statusBadge(item.status)}
                  </div>
                  <Link href={`/item/${item.id}`} className="font-medium text-gray-900 hover:text-primary-600">{item.title}</Link>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/item/${item.id}`} className="btn-secondary text-xs py-1.5 px-3">查看</Link>
                  {item.status === 'pending' && (
                    <button onClick={() => handleDeleteItem(item.id)} className="btn-danger text-xs py-1.5 px-3">删除</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'claims' && (
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">还没有认领过物品</p>
            </div>
          ) : (
            claims.map((claim) => (
              <div key={claim.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{claim.claimant_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : claim.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {claim.status === 'pending' ? '待确认' : claim.status === 'approved' ? '已通过' : '已拒绝'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{format(new Date(claim.created_at), 'yyyy-MM-dd')}</span>
                </div>
                {claim.items && (
                  <p className="text-sm text-gray-500">认领物品：<Link href={`/item/${claim.item_id}`} className="text-primary-600 hover:underline">{claim.items.title}</Link></p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
export const dynamic = 'force-dynamic';
