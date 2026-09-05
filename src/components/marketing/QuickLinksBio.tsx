import React from "react";
import { BioLinkSnippet } from "../../types/marketing";
import { Link2, Copy, ExternalLink, MapPin, Globe, CreditCard } from "lucide-react";

interface QuickLinksBioProps {
  links: BioLinkSnippet[];
  onPasteLinkToChat: (text: string) => void;
}

export const QuickLinksBio: React.FC<QuickLinksBioProps> = ({ links, onPasteLinkToChat }) => {
  const getCategoryIcon = (category: BioLinkSnippet["category"]) => {
    switch (category) {
      case "UBICACION":
        return <MapPin className="w-3.5 h-3.5 text-red-500" />;
      case "DATOS_PAGO":
        return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const handleShare = (link: BioLinkSnippet) => {
    const formatted = `🔗 *${link.title}*\n${link.displayText}\n👉 ${link.url}`;
    onPasteLinkToChat(formatted);
  };

  return (
    <div className="flex flex-col gap-2 text-xs">
      <h5 className="font-bold text-slate-800 text-xs px-1 flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5 text-slate-500" />
        Snippets de Enlaces & BioLinks
      </h5>

      <div className="grid grid-cols-1 gap-1.5">
        {links.map((link) => (
          <div
            key={link.id}
            className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                {getCategoryIcon(link.category)}
              </span>
              <div className="min-w-0">
                <span className="font-semibold text-slate-900 block text-xs truncate">
                  {link.title}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">{link.displayText}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                title="Abrir enlace"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => handleShare(link)}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] font-medium transition-colors"
                title="Pegar en WhatsApp Web"
              >
                <Copy className="w-3 h-3 text-slate-600" />
                Pegar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
