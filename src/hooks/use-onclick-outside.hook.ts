import React, { useEffect } from 'react';

type useOnClickOutsideProps = {
  ref: React.RefObject<HTMLElement>;
  handler: (e: any) => void;
}

const useOnClickOutside = ({ ref, handler }: useOnClickOutsideProps) => {
  useEffect(() => {
      const listener = (e: MouseEvent | TouchEvent) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(e.target as Node)) {
          return;
        }
        handler(e);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}

export default useOnClickOutside;