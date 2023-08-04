//import { isBrowser } from "#is-browser";
import { useLayoutEffect } from "../vendor/react";
const isBrowser = true;


const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : () => {};

export default useIsomorphicLayoutEffect;
