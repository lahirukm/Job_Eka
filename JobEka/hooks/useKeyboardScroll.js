import { useEffect, useRef, useState } from "react";
import { Keyboard, TextInput, Dimensions, Platform } from "react-native";

/**
 * Keeps the focused TextInput visible above the keyboard inside a ScrollView.
 *
 * Usage:
 *   const kb = useKeyboardScroll();
 *   <ScrollView {...kb.scrollProps}
 *     contentContainerStyle={[styles.content, { paddingBottom: 40 + kb.keyboardHeight }]}>
 */
export default function useKeyboardScroll(gap = 40) {
  const scrollRef   = useRef(null);
  const scrollY     = useRef(0);
  const kbHeightRef = useRef(0);
  const lastInput   = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Scroll so the currently focused input sits just above the keyboard
  const ensureVisible = () => {
    const input = TextInput.State.currentlyFocusedInput?.();
    if (!input || !scrollRef.current || !kbHeightRef.current) return;

    input.measureInWindow((x, y, w, h) => {
      const windowH       = Dimensions.get("window").height;
      const visibleBottom = windowH - kbHeightRef.current - gap;
      const overflow      = y + h - visibleBottom;

      if (overflow > 0) {
        // field is hidden behind the keyboard → scroll up
        scrollRef.current.scrollTo({ y: scrollY.current + overflow, animated: true });
      } else if (y < 80) {
        // field is hidden under the top of the screen → scroll down
        scrollRef.current.scrollTo({ y: Math.max(0, scrollY.current + y - 120), animated: true });
      }
    });
  };

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvt, (e) => {
      kbHeightRef.current = e.endCoordinates.height;
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(ensureVisible, 150);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      kbHeightRef.current = 0;
      lastInput.current = null;
      setKeyboardHeight(0);
    });

    // When the user moves to another field while the keyboard is already open,
    // no keyboard event fires — so check which input is focused a few times a second.
    const timer = setInterval(() => {
      if (!kbHeightRef.current) return;
      const current = TextInput.State.currentlyFocusedInput?.();
      if (current && current !== lastInput.current) {
        lastInput.current = current;
        setTimeout(ensureVisible, 50);
      }
    }, 250);

    return () => { showSub.remove(); hideSub.remove(); clearInterval(timer); };
  }, []);

  const onScroll = (e) => { scrollY.current = e.nativeEvent.contentOffset.y; };

  return {
    scrollRef,
    keyboardHeight,
    ensureVisible,
    scrollProps: {
      ref: scrollRef,
      onScroll,
      scrollEventThrottle: 16,
      keyboardShouldPersistTaps: "handled",
    },
  };
}
