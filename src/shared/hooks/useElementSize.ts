import { useLayoutEffect, useRef, useState } from "react";

export type ElementSize = { width: number; height: number };

export const useElementSize = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const width = Number.isFinite(rect.width) ? rect.width : 0;
      const height = Number.isFinite(rect.height) ? rect.height : 0;
      setSize((prev) => {
        if (Math.abs(prev.width - width) < 0.5 && Math.abs(prev.height - height) < 0.5) return prev;
        return { width, height };
      });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return { ref, size };
};
