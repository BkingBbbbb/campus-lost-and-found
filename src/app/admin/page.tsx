'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Item, Claim } from '@/types';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pendingItems' | 'allItems' | 'claims'>('pendingItems');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirect=/admin');
        return;
      }
      setUser(user);
      fetchData();
    };
    checkUser();
  }, []);

  const fetchData = async () => {
    const [itemsRes, claimsRes] = await Promise.all([
      supabase.from('items').select('*').order('created_at', { ascending: false }),
      supabase.from('claims').select('*, items(*)').order('created_at', { ascending: false }),
    ]);
    if (itemsRes.data) setItems(itemsRes.data);
    if (claimsRes.data) setClaims(claimsRes.data);
    setLoading(false);
  };

  const updateItemStatus = async (id: number, status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('items').update as any)({ status }).eq('id', id);
    fetchData();
  };

  const updateClaimStatus = async (id: number, status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('claims').update as any)({ status }).eq('id', id);
    fetchData();
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', resolved: 'bg-blue-100 text-blue-800', closed: 'bg-gray-100 text-gray-500' };
    const labels: Record<string, string> = { pending: '待审核', approved: '已通过', resolved: '已认领', closed: '已关闭' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;

  const pendingItems = items.filter(i => i.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-primary-600 mr-2" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
          <p className="text-sm text-gray-500">审核与管理平台内容</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
          <div className="text-sm text-gray-500">待审核</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'approved').length}</div>
          <div className="text-sm text-gray-500">已通过</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{claims.filter(c => c.status === 'pending').length}</div>
          <div className="text-sm text-gray-500">待处理认领</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button onClick={() => setTab('pendingItems')} className={`pb-3 px-1 text-sm font-medium border-b-2 ${tab === 'pendingItems' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>待审核 ({pendingItems.length})</button>
        <button onClick={() => setTab('allItems')} className={`pb-3 px-1 text-sm font-medium border-b-2 ${tab === 'allItems' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>全部物品 ({items.length})</button>
        <button onClick={() => setTab('claims')} className={`pb-3 px-1 text-sm font-medium border-b-2 ${tab === 'claims' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>认领申请 ({claims.length})</button>
      </div>

      {tab !== 'claims' && (
        <div className="space-y-3">
          {(tab === 'pendingItems' ? pendingItems : items).length === 0 ? (
            <p className="text-center py-12 text-gray-500">暂无数据</p>
          ) : (
            (tab === 'pendingItems' ? pendingItems : items).map((item) => (
              <div key={item.id} className="card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{item.type === 'lost' ? '寻物' : '招领'}</span>
                    {statusBadge(item.status)}
                  </div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.contact_name} · {format(new Date(item.created_at), 'MM-dd HH:mm')}</p>
                </div>
                <div className="flex gap-2">
                  {item.status === 'pending' && (
                    <>
                      <button onClick={() => updateItemStatus(item.id, 'approved')} className="inline-flex items-center text-sm text-green-600 hover:text-green-700 px-3 py-1.5"><CheckCircle className="h-4 w-4 mr-1" />通过</button>
                      <button onClick={() => updateItemStatus(item.id, 'closed')} className="inline-flex items-center text-sm text-red-600 hover:text-red-700 px-3 py-1.5"><XCircle className="h-4 w-4 mr-1" />拒绝</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'claims' && (
        <div className="space-y-3">
          {claims.length === 0 ? (
            <p className="text-center py-12 text-gray-500">暂无认领申请</p>
          ) : (
            claims.map((claim) => (
              <div key={claim.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{claim.claimant_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : claim.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {claim.status === 'pending' ? '待处理' : claim.status === 'approved' ? '已通过' : '已拒绝'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{format(new Date(claim.created_at), 'yyyy-MM-dd HH:mm')}</span>
                </div>
                {claim.items && <p className="text-sm text-gray-600">物品：{claim.items.title}</p>}
                {claim.claim_reason && <p className="text-sm text-gray-500 mt-1">理由：{claim.claim_reason}</p>}
                {claim.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => updateClaimStatus(claim.id, 'approved')} className="text-sm text-green-600 hover:text-green-700 inline-flex items-center"><CheckCircle className="h-4 w-4 mr-1" />通过</button>
                    <button onClick={() => updateClaimStatus(claim.id, 'rejected')} className="text-sm text-red-600 hover:text-red-700 inline-flex items-center"><XCircle className="h-4 w-4 mr-1" />拒绝</button>
                  </div>
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
