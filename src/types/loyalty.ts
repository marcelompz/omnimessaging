export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "BLACK";

export interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  monetaryEquivalent: number;
  category: "DESCUENTO" | "PRODUCTO_GRATIS" | "SERVICIO_CORTESIA";
  description: string;
}

export interface LoyaltyAccount {
  customerPhone: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  expiringPoints: number;
  expirationDate: string;
  history: Array<{
    id: string;
    type: "EARNED" | "REDEEMED" | "MANUAL_ADJUSTMENT";
    points: number;
    description: string;
    date: string;
  }>;
}
