import React, { useState } from "react";
import { ActiveGiveaway } from "../../types/marketing";
import { Sparkles, Ticket, Send, CheckCircle2 } from "lucide-react";

interface GiveawayRegistrarProps {
  giveaways: ActiveGiveaway[];
  customerPhone: string;
  customerName: string;
  onPasteCouponToChat: (couponText: string) => void;
}

export const GiveawayRegistrar: React.FC<GiveawayRegistrarProps> = ({
  giveaways,
  customerPhone,
  customerName,
  onPasteCouponToChat,
}) => {
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  const handleEnrollAndSendTicket = (gw: ActiveGiveaway) => {
    const ticketCode = `${gw.couponPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    setEnrolledIds((prev) => [...prev, gw.id]);

    let text = `🎉 *¡ESTÁS PARTICIPANDO DEL SORTEO!* 🎉\n`;
    text += `Estimado/a ${customerName || "Cliente"}:\n\n`;
    text += `Te confirmamos tu inscripción en: *${gw.title}*\n`;
    text += `🎁 *Premio:* ${gw.prizeDescription}\n`;
    text += `🎟️ *Tu Cupón Digital:* \`${ticketCode}\`\n`;
    text += `📅 *Fecha de Sorteo:* ${gw.endDate}\n\n`;
    text += `_¡Muchos éxitos de parte de todo el equipo de OmniFlow!_`;

    onPasteCouponToChat(text);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl shadow-xs">
        <h4 className="font-bold flex items-center gap-1.5 leading-tight">
          <Sparkles className="w-4 h-4" />
          Sorteos & Cupones Activos
        </h4>
        <p className="text-[11px] text-pink-100 mt-0.5">
          Inscribe al cliente y envíale su cupón digital numerado directo por WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {giveaways.map((gw) => {
          const isEnrolled = enrolledIds.includes(gw.id);
          return (
            <div
              key={gw.id}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col gap-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">{gw.title}</h5>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">{gw.prizeDescription}</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                  Hasta {gw.endDate}
                </span>
              </div>

              <p className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                {gw.termsSummary}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  {gw.totalParticipants + (isEnrolled ? 1 : 0)} participantes
                </span>

                <button
                  type="button"
                  onClick={() => handleEnrollAndSendTicket(gw)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold text-xs transition-colors shadow-2xs ${
                    isEnrolled
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {isEnrolled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Ticket className="w-3.5 h-3.5" />}
                  {isEnrolled ? "Reenviar Cupón" : "Inscribir y Enviar Cupón"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
