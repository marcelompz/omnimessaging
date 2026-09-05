import React from "react";

interface OrderFlowIconProps {
  className?: string;
  size?: number;
}

export const OrderFlowIcon: React.FC<OrderFlowIconProps> = ({ className = "w-7 h-7", size }) => {
  return (
    <img
      src="/assets/orderflow-icon.svg"
      alt="OrderFlow"
      style={size ? { width: size, height: size } : undefined}
      className={`inline-block object-contain shrink-0 ${className}`}
    />
  );
};

interface OrderFlowLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export const OrderFlowLogo: React.FC<OrderFlowLogoProps> = ({
  className = "h-8",
  showSubtitle = true,
}) => {
  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className="flex items-baseline font-black italic tracking-tighter leading-none text-lg">
        <span className="text-[#3E1B59]">Order</span>
        <span className="text-[#009DA0]">Flow</span>
      </div>
      {showSubtitle && (
        <div className="flex items-center gap-1 mt-0.5">
          <div className="h-[1.5px] w-3 bg-[#3E1B59]" />
          <span className="text-[7.5px] font-bold tracking-[2.5px] text-slate-500 uppercase leading-none font-mono">
            HIGH-SPEED OMNI-SYSTEM
          </span>
          <div className="h-[1.5px] w-6 bg-[#009DA0]" />
        </div>
      )}
    </div>
  );
};
