import { useWindowWidth } from './useWindowWidth';
export function useIsMobile() {
  return useWindowWidth() < 768;
}