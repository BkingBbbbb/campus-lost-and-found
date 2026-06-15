export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'pending' | 'approved' | 'resolved' | 'closed';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Item {
  id: number;
  type: ItemType;
  title: string;
  description: string | null;
  category_id: number | null;
  location: string | null;
  event_date: string | null;
  contact_name: string;
  contact_phone: string | null;
  contact_wechat: string | null;
  image_url: string | null;
  status: ItemStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Claim {
  id: number;
  item_id: number;
  claimant_name: string;
  claimant_phone: string | null;
  claimant_wechat: string | null;
  claim_reason: string | null;
  proof_description: string | null;
  status: ClaimStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  items?: Item;
}

export interface Database {
  public: {
    Tables: {
      categories: { Row: Category; Insert: Omit<Category, 'id' | 'created_at'>; Update: Partial<Omit<Category, 'id'>> };
      items: { Row: Item; Insert: Omit<Item, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Item, 'id' | 'created_at' | 'updated_at'>> };
      claims: { Row: Claim; Insert: Omit<Claim, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Claim, 'id' | 'created_at' | 'updated_at'>> };
    };
  };
}
