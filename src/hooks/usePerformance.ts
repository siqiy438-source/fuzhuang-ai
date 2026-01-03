import { useEffect } from 'react';

/**
 * 性能优化 Hook
 * 用于移动端性能优化
 */
export const usePerformance = () => {
  useEffect(() => {
    // 安全检查
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    try {
      // 检测是否为移动设备
      const userAgent = navigator.userAgent || '';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) 
        || window.innerWidth < 768;

      if (isMobile && document.body) {
        // 移动端优化：减少重绘
        document.body.style.transform = 'translateZ(0)';
        
        // 禁用某些动画以提升性能
        const style = document.createElement('style');
        style.textContent = `
          @media (max-width: 768px) {
            * {
              animation-duration: 0.3s !important;
              transition-duration: 0.2s !important;
            }
          }
        `;
        document.head.appendChild(style);

        return () => {
          try {
            if (style.parentNode) {
              document.head.removeChild(style);
            }
          } catch {
            // 忽略清理错误
          }
        };
      }
    } catch (error) {
      console.warn('性能优化初始化失败:', error);
    }
  }, []);
};

/**
 * 图片懒加载优化
 */
export const useLazyImage = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach((img) => {
          if (img instanceof HTMLImageElement) {
            img.src = img.dataset.src || img.src;
          }
        });
      } else if ('IntersectionObserver' in window) {
        // 降级方案：使用 Intersection Observer
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src || img.src;
              imageObserver.unobserve(img);
            }
          });
        });

        const images = document.querySelectorAll('img[data-src]');
        images.forEach((img) => imageObserver.observe(img));

        return () => {
          images.forEach((img) => imageObserver.unobserve(img));
        };
      }
      // 如果都不支持，图片会正常加载，无需特殊处理
    } catch (error) {
      console.warn('懒加载初始化失败:', error);
    }
  }, []);
};



