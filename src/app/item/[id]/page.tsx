'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Item, Claim } from '@/types';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, User, Phone, MessageCircle, ImageIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [item, setItem] = useState<Item | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState({ name: '', phone: '', wechat: '', reason: '', proof: '' });
  const [submitting, setSubmitting] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    fetchItem();
    checkUser();
  }, []);

  const fetchItem = async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('id', params.id)
      .single();
    if (data) setItem(data);
    setLoading(false);
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase
        .from('claims')
        .select('id')
        .eq('item_id', params.id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setHasClaimed(true);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !item) return;
    setSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('claims').insert as any)({
        item_id: item.id,
        claimant_name: claimForm.name,
        claimant_phone: claimForm.phone || null,
        claimant_wechat: claimForm.wechat || null,
        claim_reason: claimForm.reason || null,
        proof_description: claimForm.proof || null,
        status: 'pending',
        user_id: user.id,
      });

      if (error) throw error;
      setHasClaimed(true);
      setShowClaimForm(false);
      alert('认领申请已提交，请等待发布者审核确认');
    } catch (err: any) {
      alert('提交失败：' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 h-8 w-1/3 rounded"></div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
        <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
      </div>
    </div>
  );

  if (!item) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500">找不到该物品信息</p>
      <Link href="/" className="btn-primary mt-4 inline-block">返回首页</Link>
    </div>
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    resolved: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-500',
  };
  const statusLabels: Record<string, string> = {
    pending: '待审核', approved: '审核通过', resolved: '已认领', closed: '已关闭',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={item.type === 'lost' ? '/lost' : '/found'} className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> 返回{item.type === 'lost' ? '寻物' : '招领'}列表
      </Link>

      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {item.type === 'lost' ? '寻物启事' : '失物招领'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status]}`}>
            {statusLabels[item.status]}
          </span>
        </div>

        {/* Image */}
        {item.image_url ? (
          <div className="mb-6 rounded-lg overflow-hidden bg-gray-100">
            <img src={item.image_url} alt={item.title} className="w-full max-h-96 object-contain mx-auto" />
          </div>
        ) : (
          <div className="mb-6 rounded-lg bg-gray-100 h-48 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Title & Description */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h1>
        {item.description && (
          <p className="text-gray-600 mb-6 whitespace-pre-wrap">{item.description}</p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {item.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>地点：{item.location}</span>
            </div>
          )}
          {item.event_date && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>日期：{format(new Date(item.event_date), 'yyyy年MM月dd日')}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            <span>联系人：{item.contact_name}</span>
          </div>
          {item.contact_phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>电话：{item.contact_phone}</span>
            </div>
          )}
          {item.contact_wechat && (
            <div className="flex items-center text-sm text-gray-600">
              <MessageCircle className="h-4 w-4 mr-2 text-gray-400" />
              <span>微信：{item.contact_wechat}</span>
            </div>
          )}
        </div>

        {/* Published time */}
        <div className="text-xs text-gray-400 mb-6">
          发布时间：{format(new Date(item.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
        </div>

        {/* Claim Button */}
        {user && item.status === 'approved' && !hasClaimed && (
          <button
            onClick={() => setShowClaimForm(true)}
            className="btn-primary w-full"
          >
            申请认领
          </button>
        )}
        {user && hasClaimed && (
          <p className="text-center text-sm text-green-600 font-medium">✓ 您已经提交了认领申请</p>
        )}
        {!user && (
          <Link href={`/auth/login?redirect=/item/${item.id}`} className="btn-primary w-full text-center block">
            登录后申请认领
          </Link>
        )}
      </div>

      {/* Claim Form Modal */}
      {showClaimForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">申请认领</h2>
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">您的姓名 *</label>
                <input type="text" required value={claimForm.name} onChange={(e) => setClaimForm({...claimForm, name: e.target.value})} className="input-field" placeholder="请输入真实姓名" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                  <input type="tel" value={claimForm.phone} onChange={(e) => setClaimForm({...claimForm, phone: e.target.value})} className="input-field" placeholder="选填" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">微信号</label>
                  <input type="text" value={claimForm.wechat} onChange={(e) => setClaimForm({...claimForm, wechat: e.target.value})} className="input-field" placeholder="选填" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">认领理由</label>
                <textarea rows={3} value={claimForm.reason} onChange={(e) => setClaimForm({...claimForm, reason: e.target.value})} className="input-field resize-none" placeholder="请描述为什么这是您的物品" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">证明信息</label>
                <textarea rows={2} value={claimForm.proof} onChange={(e) => setClaimForm({...claimForm, proof: e.target.value})} className="input-field resize-none" placeholder="可提供物品特征、照片等证明信息" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowClaimForm(false)} className="btn-secondary">取消</button>
                <button type="submit" disabled={submitting} className="btn-primary inline-flex items-center">
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  提交申请
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
