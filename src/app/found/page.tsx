'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Item, Category } from '@/types';
import ItemCard from '@/components/ItemCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

export default function FoundPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [searchQuery, selectedCategory]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('id');
    if (data) setCategories(data);
  };

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase
      .from('items')
      .select('*')
      .eq('type', 'found')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
    }
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;
    if (data) setItems(data);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> 返回首页
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">失物招领</h1>
          <p className="text-gray-500 text-sm">查看同学们拾到的物品</p>
        </div>
        <Link href="/post?type=found" className="btn-primary inline-flex items-center">
          <Plus className="h-4 w-4 mr-1" /> 发布招领
        </Link>
      </div>

      <div className="space-y-4 mb-8">
        <SearchBar onSearch={setSearchQuery} />
        <CategoryFilter categories={categories} selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 w-full rounded mb-1"></div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">暂无招领信息</p>
          <Link href="/post?type=found" className="btn-primary">发布招领信息</Link>
        </div>
      )}
    </div>
  );
}
