-- =====================================================
-- 校园失物招领平台 - Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中运行此脚本
-- =====================================================

-- 1. 创建物品分类表
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建物品表
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  location TEXT,
  event_date DATE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_wechat TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'resolved', 'closed')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建认领申请表
CREATE TABLE IF NOT EXISTS claims (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL,
  claimant_phone TEXT,
  claimant_wechat TEXT,
  claim_reason TEXT,
  proof_description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 插入默认分类
INSERT INTO categories (name) VALUES
  ('电子产品'),
  ('证件卡包'),
  ('钥匙'),
  ('书包/行李'),
  ('服饰鞋帽'),
  ('水杯/餐具'),
  ('书籍/文具'),
  ('生活用品'),
  ('其他')
ON CONFLICT (name) DO NOTHING;

-- 5. 开启 RLS (Row Level Security)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- 6. 创建存储桶用于图片上传
-- 在 Supabase Dashboard - Storage 中手动创建名为 'item-images' 的 public bucket

-- 7. 设置 RLS 策略

-- 物品表策略
-- 所有人可查看已审核通过和已认领的物品
CREATE POLICY "Anyone can view approved items" ON items
  FOR SELECT USING (status IN ('approved', 'resolved'));

-- 用户可查看自己发布的所有物品（包括待审核）
CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可发布新物品
CREATE POLICY "Users can create items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可更新自己的物品
CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可删除自己的物品（仅待审核状态）
CREATE POLICY "Users can delete own pending items" ON items
  FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- 认领表策略
-- 用户可查看自己的认领申请
CREATE POLICY "Users can view own claims" ON claims
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可创建认领申请
CREATE POLICY "Users can create claims" ON claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 物品发布者可查看对自己物品的认领申请
CREATE POLICY "Item owners can view claims" ON claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = claims.item_id AND items.user_id = auth.uid()
    )
  );

-- 物品发布者可更新认领状态
CREATE POLICY "Item owners can update claims" ON claims
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = claims.item_id AND items.user_id = auth.uid()
    )
  );

-- 8. Storage RLS
-- 在 Supabase Dashboard - Storage - item-images - Policies 中添加：
-- - 允许公开读取
-- - 仅认证用户可上传
-- SQL: 
-- CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
-- CREATE POLICY "Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');
