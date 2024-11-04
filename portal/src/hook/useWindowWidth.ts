import { useCallback, useEffect, useState } from "react";

function useWindowWidth(screenSize: number) {
  const [onSmallScreen, setOnSmallScreen] = useState(false);

  const checkScreenSize = useCallback(() => {
    setOnSmallScreen(window?.innerWidth < screenSize);
  }, [screenSize]);

  useEffect(() => {
    checkScreenSize();
    window?.addEventListener("resize", checkScreenSize);
    return () => window?.removeEventListener("resize", checkScreenSize);
  }, [checkScreenSize]);

  return onSmallScreen;
}

export default useWindowWidth;
