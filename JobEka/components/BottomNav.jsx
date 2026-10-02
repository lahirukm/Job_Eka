import { useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

// Logo colours
const ORANGE      = "#F97316";
const ORANGE_DARK = "#EA580C";

const LEFT_TABS = [
  { id: "home",   label: "Home",   icon: "home-outline",   iconActive: "home",   href: "/(tabs)/"       },
  { id: "search", label: "Search", icon: "search-outline", iconActive: "search", href: "/(tabs)/search" },
];
const CENTER_TAB = { id: "jobs", label: "Jobs", icon: "briefcase", href: "/(tabs)/jobs" };
const RIGHT_TABS = [
  { id: "cv",      label: "CV",      icon: "document-text-outline", iconActive: "document-text", href: "/cv-generator"   },
  { id: "profile", label: "Profile", icon: "person-outline",        iconActive: "person",        href: "/(tabs)/profile" },
];

// ── Side tab: icon + label. Tapping makes a small round blue circle "pop" and fade away.
const SideTab = ({ tab, active, onPress, colors }) => {
  const pop   = useRef(new Animated.Value(1)).current;  // 0 → 1 runs the pop; 1 = hidden
  const press = useRef(new Animated.Value(1)).current;  // icon squeeze on tap

  const handlePress = () => {
    pop.setValue(0);
    Animated.parallel([
      Animated.timing(pop, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(press, { toValue: 0.85, duration: 90,  useNativeDriver: true }),
        Animated.spring(press, { toValue: 1, tension: 160, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();
    onPress();
  };

  const circleScale   = pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.15] });
  const circleOpacity = pop.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.28, 0.22, 0] });

  return (
    <TouchableOpacity style={s.sideTab} onPress={handlePress} activeOpacity={1}>
      <View style={s.iconArea}>
        <Animated.View
          pointerEvents="none"
          style={[s.popCircle, { backgroundColor: colors.active, opacity: circleOpacity, transform: [{ scale: circleScale }] }]}
        />
        <Animated.View style={{ transform: [{ scale: press }] }}>
          <Ionicons
            name={active ? tab.iconActive : tab.icon}
            size={22}
            color={active ? colors.active : colors.inactive}
          />
        </Animated.View>
      </View>
      <Text style={[s.tabLabel, { color: active ? colors.active : colors.inactive, fontWeight: active ? "800" : "600" }]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
};

export default function BottomNav() {
  const { theme: T, isDark } = useTheme();
  const router   = useRouter();
  const segments = useSegments();
  const insets   = useSafeAreaInsets();

  const centerScale = useRef(new Animated.Value(1)).current;
  const centerPulse = useRef(new Animated.Value(0)).current;

  const colors = {
    bar:      isDark ? "#111827" : "#FFFFFF",
    border:   isDark ? "#1E2D40" : "#E5E7EB",
    active:   isDark ? "#7B93FF" : "#2563EB",
    inactive: isDark ? "#4B5B78" : "#9CA3AF",
    ring:     T.bg,
  };

  const getActiveId = () => {
    const seg = segments.join("/");
    if (seg.includes("cv-generator")) return "cv";
    if (seg.includes("search"))       return "search";
    if (seg.includes("jobs"))         return "jobs";
    if (seg.includes("profile"))      return "profile";
    return "home";
  };
  const current = getActiveId();

  // Soft glow behind the centre button while Jobs is active
  useEffect(() => {
    if (current === "jobs") {
      Animated.loop(Animated.sequence([
        Animated.timing(centerPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(centerPulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])).start();
    } else {
      centerPulse.stopAnimation();
      centerPulse.setValue(0);
    }
  }, [current]);

  // navigate (not push) so tapping tabs doesn't pile up screens in history
  const go = (tab) => {
    if (tab.id === current) return;
    router.navigate(tab.href);
  };

  const pressCenter = () => {
    Animated.sequence([
      Animated.spring(centerScale, { toValue: 0.88, tension: 120, friction: 5, useNativeDriver: true }),
      Animated.spring(centerScale, { toValue: 1,    tension: 120, friction: 5, useNativeDriver: true }),
    ]).start();
    go(CENTER_TAB);
  };

  const jobsActive  = current === "jobs";
  const glowScale   = centerPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const glowOpacity = centerPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View
      pointerEvents="box-none"
      style={[s.wrapper, {
        backgroundColor: colors.bar,
        borderColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 6),
        shadowOpacity: isDark ? 0.5 : 0.1,
      }]}
    >
      <View style={s.bar}>
        <View style={s.side}>
          {LEFT_TABS.map((t) => (
            <SideTab key={t.id} tab={t} active={current === t.id} onPress={() => go(t)} colors={colors} />
          ))}
        </View>

        {/* space under the raised centre button, with its label */}
        <View style={s.centerGap}>
          <Text style={[s.centerLabel, { color: jobsActive ? ORANGE : colors.inactive, fontWeight: jobsActive ? "800" : "600" }]}>
            {CENTER_TAB.label}
          </Text>
        </View>

        <View style={s.side}>
          {RIGHT_TABS.map((t) => (
            <SideTab key={t.id} tab={t} active={current === t.id} onPress={() => go(t)} colors={colors} />
          ))}
        </View>
      </View>

      {/* ── Raised centre "Jobs" button in the logo's orange ── */}
      <View pointerEvents="box-none" style={s.centerHolder}>
        <Animated.View pointerEvents="none" style={[s.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
        <Animated.View style={{ transform: [{ scale: centerScale }] }}>
          <TouchableOpacity
            onPress={pressCenter}
            activeOpacity={0.85}
            style={[s.centerBtn, { borderColor: colors.ring, backgroundColor: jobsActive ? ORANGE_DARK : ORANGE }]}
          >
            <Ionicons name={CENTER_TAB.icon} size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const BAR_H    = 66;
const CENTER_D = 62;

const s = StyleSheet.create({
  // Docked to the bottom of the screen: part of the page layout, not floating over it
  wrapper: {
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    borderWidth: 1, borderBottomWidth: 0,
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: -4 }, shadowRadius: 14, elevation: 20,
    zIndex: 10,
  },
  bar: { height: BAR_H, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 },
  side:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  sideTab:  { flex: 1, height: BAR_H, justifyContent: "center", alignItems: "center", gap: 2 },
  iconArea: { width: 44, height: 34, alignItems: "center", justifyContent: "center" },
  popCircle: { position: "absolute", width: 44, height: 44, borderRadius: 22 },
  tabLabel: { fontSize: 11, letterSpacing: 0.3 },

  centerGap:   { width: CENTER_D + 18, height: BAR_H, alignItems: "center", justifyContent: "flex-end", paddingBottom: 8 },
  centerLabel: { fontSize: 11, letterSpacing: 0.3 },

  centerHolder: {
    position: "absolute", left: 0, right: 0, top: -CENTER_D / 2 + 4,
    alignItems: "center", justifyContent: "center",
  },
  centerBtn: {
    width: CENTER_D, height: CENTER_D, borderRadius: CENTER_D / 2, borderWidth: 5,
    alignItems: "center", justifyContent: "center",
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 12,
  },
  glow: {
    position: "absolute", width: CENTER_D + 6, height: CENTER_D + 6, borderRadius: (CENTER_D + 6) / 2,
    backgroundColor: ORANGE,
  },
});
