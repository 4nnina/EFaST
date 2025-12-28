import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ChatExplainWidget() {

  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const isExplainPage = location.pathname === "/explain";

  useEffect(() => {
    if (!isExplainPage) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isExplainPage]);

  if (!visible || isExplainPage) return null;

  return (
    <div
      onClick={() => window.open("/explain", "_blank")}
      className="
        fixed bottom-6 right-6 z-[999]
        flex items-center gap-3 cursor-pointer select-none

        bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]
        text-white shadow-xl
        rounded-full pl-4 pr-6 py-3

        hover:scale-[1.03] active:scale-[0.97]
        transition-transform animate-fade-in
      "
    >
      {/* Bulb icon */}
      <div
        className="
          w-12 h-12 rounded-full flex items-center justify-center
          text-3xl bg-[#E9D5FF]/40
          shadow-md animate-pulse
        "
      >
        💡
      </div>

      {/* Text */}
      <div className="text-sm font-semibold leading-snug text-white">
        <span className="font-bold">Need an explanation?</span><br />
        AI can walk you through <br/> these results, click here!
      </div>
    </div>
  );
}
