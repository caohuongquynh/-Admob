import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';

import { useRouter, type Href } from 'expo-router';

import {
    AdEventType,
    InterstitialAd,
    TestIds,
} from 'react-native-google-mobile-ads';

import mobileAds from 'react-native-google-mobile-ads';

const AD_INTERVAL = 3 * 60 * 1000;

type AdNavigationContextType = {
  navigateWithAd: (route: Href) => void;
};

const AdNavigationContext =
  createContext<AdNavigationContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function AdNavigationProvider({ children }: Props) {
  const router = useRouter();

  const [interstitial] = useState(() =>
    InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL)
  );

  const [adReady, setAdReady] = useState(false);

  const lastShownAt = useRef(0);
  const pendingRoute = useRef<Href | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        if (active) {
          setAdReady(true);
        }
      }
    );

    const unsubscribeOpened = interstitial.addAdEventListener(
      AdEventType.OPENED,
      () => {
        lastShownAt.current = Date.now();

        if (active) {
          setAdReady(false);
        }
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        const route = pendingRoute.current;
        pendingRoute.current = null;

        if (active && route !== null) {
          router.push(route);
        }

        if (active) {
          interstitial.load();
        }
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      () => {
        if (active) {
          setAdReady(false);
        }

        const route = pendingRoute.current;
        pendingRoute.current = null;

        if (active && route !== null) {
          router.push(route);
        }

        if (active) {
          interstitial.load();
        }
      }
    );

    mobileAds()
      .initialize()
      .then(() => {
        if (active) {
          interstitial.load();
        }
      })
      .catch((error: unknown) => {
        console.warn('Không thể khởi tạo AdMob:', error);
      });

    return () => {
      active = false;
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [interstitial, router]);

  const navigateWithAd = useCallback(
    (route: Href) => {
      // Không xử lý thêm nếu đang chờ quảng cáo đóng.
      if (pendingRoute.current !== null) {
        return;
      }

      const now = Date.now();
      const elapsed = now - lastShownAt.current;

      // Chưa đủ 3 phút kể từ lần hiển thị trước:
      // chuyển màn hình mà không hiện quảng cáo.
      if (lastShownAt.current !== 0 && elapsed < AD_INTERVAL) {
        router.push(route);
        return;
      }

      // Quảng cáo chưa tải xong thì chuyển màn hình.
      if (!adReady) {
        interstitial.load();
        router.push(route);
        return;
      }

      // Lưu màn hình cần chuyển đến sau khi đóng quảng cáo.
      pendingRoute.current = route;
      setAdReady(false);

      try {
        interstitial.show();
      } catch (error: unknown) {
        pendingRoute.current = null;
        router.push(route);
        interstitial.load();

        console.warn('Không thể hiển thị quảng cáo:', error);
      }
    },
    [adReady, interstitial, router]
  );

  return (
    <AdNavigationContext.Provider value={{ navigateWithAd }}>
      {children}
    </AdNavigationContext.Provider>
  );
}

export function useAdNavigation() {
  const context = useContext(AdNavigationContext);

  if (!context) {
    throw new Error(
      'useAdNavigation phải được sử dụng bên trong AdNavigationProvider'
    );
  }

  return context;
}