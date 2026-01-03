import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // SSR 安全的初始值
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    // 安全检查
    if (typeof window === 'undefined') return;

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // 使用 matchMedia 如果可用
    if (window.matchMedia) {
      try {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        // 兼容旧版 Safari
        if (mql.addEventListener) {
          mql.addEventListener("change", onChange);
        } else if (mql.addListener) {
          mql.addListener(onChange);
        }
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return () => {
          if (mql.removeEventListener) {
            mql.removeEventListener("change", onChange);
          } else if (mql.removeListener) {
            mql.removeListener(onChange);
          }
        };
      } catch {
        // 降级到 resize 事件
        window.addEventListener('resize', onChange);
        return () => window.removeEventListener('resize', onChange);
      }
    } else {
      // 降级到 resize 事件
      window.addEventListener('resize', onChange);
      return () => window.removeEventListener('resize', onChange);
    }
  }, []);

  return isMobile;
}
