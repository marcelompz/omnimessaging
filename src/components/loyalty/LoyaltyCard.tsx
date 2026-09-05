import React, { useState } from "react";
import { LoyaltyAccount, LoyaltyTier, RewardItem } from "../../types/loyalty";
import { Award, Gift, Sparkles, Plus, Check, Clock } from "lucide-react";

interface LoyaltyCardProps {
  loyalty: LoyaltyAccount | null;
  customerName: string;
  onApplyRewardDiscount: (discountAmount: number, pointsCost: number) => void;
  onCreditCourtesyPoints: (points: number, reason: string) => void;
}

const AVAILABLE_REWARDS: RewardItem[] = [
  { id: "rw_1", title: "Cupón Descuento 50.000 Gs", pointsCost: 500, monetaryEquivalent: 50000, category: "DESCUENTO", description: "Válido para compras de cosmecéutica o sesiones" },
  { id: "rw_2", title: "Cupón Descuento 100.000 Gs", pointsCost: 950, monetaryEquivalent: 100000, category: "DESCUENTO", description: "Descuento en compras superiores a 300.000 Gs" },
  { id: "rw_3", title: "Mascarilla Hidratante LED de Cortesía", pointsCost: 1200, monetaryEquivalent: 150000, category: "SERVICIO_CORTESIA", description: "Sesión de 20 min en cabina estética" },
];

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  loyalty,
  customerName,
  onApplyRewardDiscount,
  onCreditCourtesyPoints,
}) => {
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(150);
  const [reason, setReason] = useState("Cortesía por demora o fidelización");

  if (!loyalty) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs flex flex-col items-center gap-2">
        <Award className="w-8 h-8 text-amber-500" />
        <p className="font-semibold text-slate-800">Sin cuenta Loyalty vinculada</p>
        <p className="text-[11px] text-slate-500">Este cliente aún no ha acumulado puntos en OmniFlow LoyaltyHub.</p>
      </div>
    );
  }

  const getTierColor = (tier: LoyaltyTier) => {
    switch (tier) {
      case "BLACK":
        return "bg-slate-900 text-amber-400 border-amber-500/40";
      case "PLATINUM":
        return "bg-slate-800 text-slate-200 border-slate-400";
      case "GOLD":
        return "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400";
      case "SILVER":
        return "bg-slate-300 text-slate-800 border-slate-400";
      default:
        return "bg-amber-800/80 text-amber-100 border-amber-700";
    }
  };

  const formatGs = (val: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(val);

  const handleApply = (reward: RewardItem) => {
    if (loyalty.currentPoints < reward.pointsCost) {
      alert("Puntos insuficientes para este canje");
      return;
    }
    onApplyRewardDiscount(reward.monetaryEquivalent, reward.pointsCost);
  };

  const handleConfirmCredit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreditCourtesyPoints(Number(pointsToAdd), reason);
    setShowCreditModal(false);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Tier & Points summary card */}
      <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl shadow-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">OmniFlow Loyalty Hub</h4>
              <p className="text-[10px] text-slate-500">Puntos de {customerName}</p>
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border shadow-2xs ${getTierColor(loyalty.tier)}`}>
            Nivel {loyalty.tier}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 bg-white/90 rounded-xl border border-amber-100">
            <span className="text-[10px] text-slate-500 block">Puntos Disponibles</span>
            <span className="text-base font-extrabold text-amber-600 font-mono">
              {loyalty.currentPoints.toLocaleString()} pts
            </span>
          </div>

          <div className="p-2 bg-white/90 rounded-xl border border-amber-100 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 block">Puntos por Vencer</span>
            <span className="text-xs font-semibold text-slate-700">
              {loyalty.expiringPoints} pts ({loyalty.expirationDate})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreditModal(true)}
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 text-amber-800 rounded-lg border border-amber-200 font-semibold text-[11px] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Acreditar puntos de cortesía
        </button>
      </div>

      {/* Rewards Catalog */}
      <div className="flex flex-col gap-2">
        <h5 className="font-bold text-slate-800 text-xs px-1 flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-amber-600" />
          Catálogo de Recompensas Canjeables
        </h5>

        <div className="flex flex-col gap-2">
          {AVAILABLE_REWARDS.map((r) => {
            const canRedeem = loyalty.currentPoints >= r.pointsCost;
            return (
              <div
                key={r.id}
                className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <h6 className="font-semibold text-slate-900 text-xs">{r.title}</h6>
                  <p className="text-[10px] text-slate-500 truncate">{r.description}</p>
                  <span className="font-mono text-[11px] font-bold text-amber-600 mt-0.5 block">
                    {r.pointsCost} puntos
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!canRedeem}
                  onClick={() => handleApply(r)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    canRedeem
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {canRedeem ? "Canjear" : "Faltan pts"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent History */}
      <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col gap-1.5">
        <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          Últimos Movimientos de Puntos
        </span>
        <div className="flex flex-col gap-1 text-[10px] text-slate-600">
          {loyalty.history.map((h) => (
            <div key={h.id} className="flex justify-between py-1 border-b border-slate-100 last:border-none">
              <span>{h.description}</span>
              <span className={`font-mono font-bold ${h.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {h.points > 0 ? `+${h.points}` : h.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Courtesy modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form onSubmit={handleConfirmCredit} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-4 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Acreditación Manual de Cortesía</h4>
            <div className="mb-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cantidad de puntos:</label>
              <input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Motivo / Justificación:</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs"
              >
                Acreditar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
