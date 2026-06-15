'use client';

import Link from 'next/link';
import type { Item } from '@/types';
import { MapPin, Calendar, Clock, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function ItemCard({ item }: { item: Item }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    resolved: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-500',
  };

  const statusLabels = {
    pending: '待审核',
    approved: '审核通过',
    resolved: '已认领',
    closed: '已关闭',
  };

  return (
    <Link href={`/item/${item.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {item.type === 'lost' ? '寻物' : '招领'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
            {statusLabels[item.status]}
          </span>
        </div>

        {item.image_url && (
          <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 h-40 flex items-center justify-center">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {!item.image_url && (
          <div className="mb-3 rounded-lg bg-gray-100 h-32 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}

        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
        )}

        <div className="flex flex-col space-y-1 text-xs text-gray-400">
          {item.location && (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{item.location}</span>
            </div>
          )}
          {item.event_date && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{format(new Date(item.event_date), 'yyyy-MM-dd')}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          <span>{format(new Date(item.created_at), 'MM-dd HH:mm', { locale: zhCN })}</span>
        </div>
      </div>
    </Link>
  );
}
