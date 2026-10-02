import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH   = (width - 48) / 2;

const CATEGORIES = [
  {
    id: "part_time", title: "Part Time\nJobs",  subtitle: "Daily & flexible tasks",
    icon: "time-outline",          colorKey: "primary",
    badge: "Flexible",             examples: "Garden • Cleaning • Delivery",
    route: "part-time-map",
  },
  {
    id: "full_time", title: "Full Time\nJobs",  subtitle: "Career opportunities",
    icon: "business-outline",      colorKey: "green",
    badge: "Careers",              examples: "IT • Finance • Marketing",
    route: null,
  },
  {
    id: "cv",        title: "CV\nGenerator",    subtitle: "AI powered resume",
    icon: "document-text-outline", colorKey: "orange",
    badge: "AI Powered",           examples: "Auto fill • Templates • Export",
    route: null,
  },
  {
    id: "interview", title: "Interview\nPrep",  subtitle: "Practice & schedule",
    icon: "videocam-outline",      colorKey: "purple",
    badge: "Video Ready",          examples: "Mock • Schedule • Tips",
    route: null,
  },
];

// ── CategoryCard
const CategoryCard = ({ item, onPress, animValue, T }) => (
  <Animated.View style={{
    opacity: animValue,
    transform: [{ scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
  }}>
    <TouchableOpacity
      style={[s.categoryCard, { backgroundColor: T.surface, borderColor: T[item.colorKey] + "44" }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[s.cardGlow, { backgroundColor: T[item.colorKey + "Bg"] }]} />
      <View style={s.cardTop}>
        <View style={[s.cardIconBox, { backgroundColor: T[item.colorKey + "Bg"] }]}>
          <Ionicons name={item.icon} size={26} color={T[item.colorKey]} />
        </View>
        <View style={[s.cardBadge, { backgroundColor: T[item.colorKey + "Bg"] }]}>
          <Text style={[s.cardBadgeText, { color: T[item.colorKey] }]}>{item.badge}</Text>
        </View>
      </View>
      <Text style={[s.cardTitle, { color: T.text }]}>{item.title}</Text>
      <Text style={[s.cardSubtitle, { color: T.textSub }]}>{item.subtitle}</Text>
      <Text style={[s.cardExamples, { color: T.textLight }]}>{item.examples}</Text>
      {/* Arrow with "Coming Soon" for non-part-time */}
      <View style={[s.cardArrow, { backgroundColor: T[item.colorKey] }]}>
        <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
      </View>
      {/* Part Time badge — "Tap for Map" */}
      {item.id === "part_time" && (
        <View style={[s.mapHint, { backgroundColor: T[item.colorKey] + "18" }]}>
          <Ionicons name="map-outline" size={10} color={T[item.colorKey]} />
          <Text style={[s.mapHintText, { color: T[item.colorKey] }]}> Map View</Text>
        </View>
      )}
    </TouchableOpacity>
  </Animated.View>
);

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { isDark, toggleTheme, theme: T } = useTheme();
  const router = useRouter();

  const [search,        setSearch]        = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const headerFade   = useRef(new Animated.Value(0)).current;
  const cardAnims    = useRef(CATEGORIES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.stagger(120,
      cardAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true })
      )
    ).start();
  }, []);

  const handleCategoryPress = (cat) => {
    if (cat.id === "part_time") {
      router.push("/part-time-map");
    } else {
      alert(`${cat.title.replace("\n", " ")} — Coming Soon!`);
    }
  };

  return (
    <View style={[s.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── HEADER ── */}
        <Animated.View style={[s.header, { opacity: headerFade, backgroundColor: T.bg }]}>
          <View style={s.headerLeft}>
            <View style={[s.headerLogoBox, { backgroundColor: T.primary }]}>
              <Ionicons name="briefcase" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[s.headerGreeting, { color: T.textSub }]}>Good morning 👋</Text>
              <Text style={[s.headerTitle, { color: T.text }]}>Find Your Next Job</Text>
            </View>
          </View>

          <View style={s.headerRight}>
            {/* Dark/Light toggle */}
            <TouchableOpacity
              style={[s.themeBtn, { backgroundColor: T.surface, borderColor: T.border }]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={18}
                color={isDark ? "#F59E0B" : T.primary}
              />
            </TouchableOpacity>

            {/* Bell */}
            <TouchableOpacity style={s.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color={T.text} />
              <View style={[s.bellDot, { borderColor: T.bg }]} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── SEARCH ── */}
        <View style={s.searchRow}>
          <View style={[s.searchBox, { backgroundColor: T.surface, borderColor: searchFocused ? T.primary : T.border }]}>
            <Ionicons name="search-outline" size={18} color={searchFocused ? T.primary : T.textLight} />
            <TextInput
              style={[s.searchInput, { color: T.text }]}
              placeholder="Search jobs, companies, skills..."
              placeholderTextColor={T.textLight}
              value={search}
              onChangeText={setSearch}
              editable={true}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              underlineColorAndroid="transparent"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={T.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[s.filterBtn, { backgroundColor: T.primary }]}>
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── CATEGORY CARDS ── */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: T.text }]}>What are you looking for?</Text>
          <Text style={[s.sectionSub, { color: T.textSub }]}>Select a category to get started</Text>
        </View>
        <View style={s.cardsGrid}>
          {CATEGORIES.map((cat, i) => (
            <CategoryCard
              key={cat.id} item={cat} T={T}
              animValue={cardAnims[i]}
              onPress={() => handleCategoryPress(cat)}
            />
          ))}
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <Ionicons name="shield-checkmark-outline" size={12} color={T.textLight} />
          <Text style={[s.footerText, { color: T.textLight }]}>  Secure & Private  ·  </Text>
          <Text style={[s.footerText, { color: T.textLight }]}>
            Powered by <Text style={[s.footerBrand, { color: T.primary }]}>JobEka</Text>
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerLogoBox: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", elevation: 3 },
  headerGreeting: { fontSize: 12 },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  themeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5, elevation: 2 },
  bellBtn: { position: "relative" },
  bellDot: { position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EA580C", borderWidth: 1.5 },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16, gap: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 48, gap: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, height: 48, paddingVertical: 0 },
  filterBtn: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", elevation: 3 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  sectionSub: { fontSize: 12, marginTop: 2 },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  categoryCard: { width: CARD_WIDTH, borderRadius: 20, padding: 16, borderWidth: 1.5, overflow: "hidden", elevation: 3, minHeight: 190 },
  cardGlow: { position: "absolute", top: -10, right: -10, width: 80, height: 80, borderRadius: 40 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  cardIconBox: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  cardBadgeText: { fontSize: 9, fontWeight: "700" },
  cardTitle: { fontSize: 15, fontWeight: "800", marginBottom: 3, lineHeight: 21 },
  cardSubtitle: { fontSize: 11, marginBottom: 6 },
  cardExamples: { fontSize: 10, marginBottom: 8, lineHeight: 15 },
  cardArrow: { position: "absolute", bottom: 14, right: 14, width: 26, height: 26, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  mapHint: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, marginTop: 2 },
  mapHintText: { fontSize: 9, fontWeight: "700" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20 },
  footerText: { fontSize: 12 },
  footerBrand: { fontWeight: "700", fontSize: 12 },
});
