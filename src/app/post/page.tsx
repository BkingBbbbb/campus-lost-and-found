'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Category, ItemType } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

export default function PostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as ItemType) || 'lost';
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    type: initialType,
    title: '',
    description: '',
    category_id: '',
    location: '',
    event_date: '',
    contact_name: '',
    contact_phone: '',
    contact_wechat: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirect=/post');
        return;
      }
      setUser(user);
    };
    checkUser();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('id');
    if (data) setCategories(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('items').insert({
        type: form.type as ItemType,
        title: form.title,
        description: form.description || null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        location: form.location || null,
        event_date: form.event_date || null,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone || null,
        contact_wechat: form.contact_wechat || null,
        image_url: imageUrl,
        status: 'pending',
        user_id: user.id,
      });

      if (error) throw error;
      router.push(form.type === 'lost' ? '/lost' : '/found');
      router.refresh();
    } catch (err: any) {
      alert('发布失败：' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> 返回首页
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">发布信息</h1>
      <p className="text-gray-500 mb-8">请填写物品详细信息，发布后需要管理员审核</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 信息类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">信息类型</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'lost' })}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-center font-medium transition-colors ${
                form.type === 'lost'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              寻物启事（我丢了东西）
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'found' })}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-center font-medium transition-colors ${
                form.type === 'found'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              失物招领（我捡到了东西）
            </button>
          </div>
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">物品名称 *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="例如：黑色双肩包、苹果手机"
            className="input-field"
          />
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="请尽量详细描述物品特征、颜色、品牌等信息"
            className="input-field resize-none"
          />
        </div>

        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">物品分类</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="input-field"
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* 地点和日期 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="如：图书馆三楼、一食堂"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* 联系方式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">联系方式</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                required
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="联系人 *"
                className="input-field"
              />
            </div>
            <div>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="手机号"
                className="input-field"
              />
            </div>
            <div>
              <input
                type="text"
                value={form.contact_wechat}
                onChange={(e) => setForm({ ...form, contact_wechat: e.target.value })}
                placeholder="微信号"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* 图片上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">图片（可选）</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <div>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">点击上传图片</p>
                <p className="text-xs text-gray-400">支持 JPG、PNG 格式</p>
              </div>
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/" className="btn-secondary">取消</Link>
          <button type="submit" disabled={submitting} className="btn-primary inline-flex items-center">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            提交审核
          </button>
        </div>
      </form>
    </div>
  );
}
