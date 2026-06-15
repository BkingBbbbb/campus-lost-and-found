'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Item } from '@/types';
import ItemCard from '@/components/ItemCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { ArrowRight, Search, HeartHandshake, Megaphone } from 'lucide-react';

export default function Home() {
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase
      .from('items')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(8);

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
    }

    const { data } = await query;
    if (data) setRecentItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              校园失物招领平台
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10">
              方便快捷地发布和查找失物信息，让每一件失物都能回到主人身边
            </p>
            <div className="max-w-xl mx-auto mb-8">
              <SearchBar onSearch={setSearchQuery} />
            </div>
            <div className="flex justify-center gap-4">
              <Link href="/post?type=lost" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 inline-flex items-center">
                <Megaphone className="h-5 w-5 mr-2" />发布寻物
              </Link>
              <Link href="/post?type=found" className="btn-primary bg-primary-500 text-white hover:bg-primary-400 px-6 py-3 inline-flex items-center">
                <HeartHandshake className="h-5 w-5 mr-2" />发布招领
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">100+</div>
              <div className="text-sm text-gray-500">已发布信息</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">80%+</div>
              <div className="text-sm text-gray-500">认领成功率</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">24h</div>
              <div className="text-sm text-gray-500">快速响应</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">最新信息</h2>
          <div className="flex gap-4">
            <Link href="/lost" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center">
              查看全部 <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 w-full rounded mb-1"></div>
                <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">暂无信息</h3>
            <p className="text-gray-400 mb-6">还没有人发布失物或招领信息</p>
            <Link href="/post" className="btn-primary">发布第一条信息</Link>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">如何使用</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">注册登录</h3>
              <p className="text-gray-500 text-sm">注册账号并登录，即可开始使用平台的全部功能</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">发布信息</h3>
              <p className="text-gray-500 text-sm">填写失物或招领信息，上传图片，发布到平台</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">认领归还</h3>
              <p className="text-gray-500 text-sm">找到匹配的物品，发起认领申请，联系归还</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export const dynamic = 'force-dynamic';
