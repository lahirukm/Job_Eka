import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH   = (width - 48) / 2;
const BANNER_WIDTH = width - 32;

const STATS = [
  { label: "Jobs Today",  value: "248", icon: "briefcase-outline",        colorKey: "primary" },
  { label: "Near You",    value: "34",  icon: "location-outline",         colorKey: "green"   },
  { label: "Companies",   value: "89",  icon: "business-outline",         colorKey: "orange"  },
  { label: "Hired Today", value: "12",  icon: "checkmark-circle-outline", colorKey: "purple"  },
];

const CATEGORIES = [
  {
    id: "part_time", title: "Part Time\nJobs",  subtitle: "Daily & flexible tasks",
    icon: "time-outline",          colorKey: "primary",
    badge: "248 available",        examples: "Garden • Cleaning • Delivery",
    route: "part-time-map",
  },
  {
    id: "full_time", title: "Full Time\nJobs",  subtitle: "Career opportunities",
    icon: "business-outline",      colorKey: "green",
    badge: "89 companies",         examples: "IT • Finance • Marketing",
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

const BANNERS = [
  { id: "b1", title: "ABC Solutions",    subtitle: "Sri Lanka's #1 IT Company",  tag: "Featured Company", tagColorKey: "primary", icon: "business",              detail: "50+ open positions"  },
  { id: "b2", title: "Senior Developer", subtitle: "Tech Park LK · Colombo 3",   tag: "🔥 Hot Job",       tagColorKey: "orange",  icon: "laptop-outline",        detail: "LKR 150,000 / month" },
  { id: "b3", title: "QuickShip LK",     subtitle: "Leading Delivery Platform",   tag: "Now Hiring",       tagColorKey: "green",   icon: "bicycle-outline",       detail: "Riders & Supervisors"},
  { id: "b4", title: "UI/UX Designer",   subtitle: "Creative Studio · Remote",    tag: "🔥 Hot Job",       tagColorKey: "purple",  icon: "color-palette-outline", detail: "LKR 95,000 / month"  },
  { id: "b5", title: "FinServe Lanka",   subtitle: "Top Finance & Banking",       tag: "Featured Company", tagColorKey: "primary", icon: "card-outline",          detail: "20+ open positions"  },
  { id: "b6", title: "Garden Cleaner",   subtitle: "Kamal Silva · Nugegoda",      tag: "⚡ Urgent",        tagColorKey: "orange",  icon: "leaf-outline",          detail: "LKR 2,500 / day"     },
];

const RECENT_JOBS = [
  { id: "1", title: "Garden Cleaning",   company: "Kamal Silva",   pay: "LKR 2,500",   time: "2h ago", type: "Part Time", urgent: true  },
  { id: "2", title: "Software Engineer", company: "ABC Solutions", pay: "LKR 120,000", time: "3h ago", type: "Full Time", urgent: false },
  { id: "3", title: "Delivery Rider",    company: "QuickShip LK", pay: "LKR 45,000",  time: "5h ago", type: "Part Time", urgent: true  },
  { id: "4", title: "UI/UX Designer",    company: "Tech Park LK", pay: "LKR 95,000",  time: "6h ago", type: "Full Time", urgent: false },
];

// ── StatCard
const StatCard = ({ item, T }) => (
  <View style={[s.statCard, { backgroundColor: T.surface, borderColor: T.border }]}>
    <View style={[s.statIconBox, { backgroundColor: T[item.colorKey + "Bg"] }]}>
      <Ionicons name={item.icon} size={18} color={T[item.colorKey]} />
    </View>
    <Text style={[s.statValue, { color: T.text }]}>{item.value}</Text>
    <Text style={[s.statLabel, { color: T.textSub }]}>{item.label}</Text>
  </View>
);

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

// ── BannerSlide
const BannerSlide = ({ item, T }) => {
  const color = T[item.tagColorKey];
  const bg    = T[item.tagColorKey + "Bg"];
  return (
    <View style={[s.bannerSlide, { backgroundColor: bg, borderColor: color + "44" }]}>
      <View style={[s.bannerIconBox, { backgroundColor: color + "22" }]}>
        <Ionicons name={item.icon} size={28} color={color} />
      </View>
      <View style={s.bannerContent}>
        <View style={[s.bannerTag, { backgroundColor: color + "18" }]}>
          <Text style={[s.bannerTagText, { color }]}>{item.tag}</Text>
        </View>
        <Text style={[s.bannerTitle, { color: T.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[s.bannerSubtitle, { color: T.textSub }]} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={[s.bannerDetail, { color }]}>{item.detail}</Text>
      </View>
      <TouchableOpacity style={[s.bannerArrow, { backgroundColor: color }]}>
        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// ── RecentJobRow
const RecentJobRow = ({ item, onPress, T }) => (
  <TouchableOpacity
    style={[s.recentRow, { backgroundColor: T.surface, borderColor: T.border }]}
    onPress={onPress} activeOpacity={0.8}
  >
    <View style={[s.recentIconBox, { backgroundColor: item.type === "Part Time" ? T.primaryBg : T.greenBg }]}>
      <Ionicons
        name={item.type === "Part Time" ? "time-outline" : "business-outline"}
        size={18}
        color={item.type === "Part Time" ? T.primary : T.green}
      />
    </View>
    <View style={s.recentInfo}>
      <View style={s.recentTitleRow}>
        <Text style={[s.recentTitle, { color: T.text }]} numberOfLines={1}>{item.title}</Text>
        {item.urgent && (
          <View style={[s.urgentTag, { backgroundColor: T.orangeBg }]}>
            <Text style={[s.urgentTagText, { color: T.orange }]}>Urgent</Text>
          </View>
        )}
      </View>
      <Text style={[s.recentCompany, { color: T.textSub }]}>{item.company}  ·  {item.time}</Text>
    </View>
    <View style={s.recentRight}>
      <Text style={[s.recentPay, { color: T.green }]}>{item.pay}</Text>
      <Text style={[s.recentType, { color: item.type === "Part Time" ? T.primary : T.green }]}>
        {item.type}
      </Text>
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { isDark, toggleTheme, theme: T } = useTheme();
  const router = useRouter();

  const [search,        setSearch]        = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeBanner,  setActiveBanner]  = useState(0);

  const headerFade   = useRef(new Animated.Value(0)).current;
  const cardAnims    = useRef(CATEGORIES.map(() => new Animated.Value(0))).current;
  const bannerRef    = useRef(null);
  const autoSlideRef = useRef(null);

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.stagger(120,
      cardAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true })
      )
    ).start();

    autoSlideRef.current = setInterval(() => {
      setActiveBanner((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);

    return () => clearInterval(autoSlideRef.current);
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

        {/* ── STATS ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsRow}>
          {STATS.map((stat, i) => <StatCard key={i} item={stat} T={T} />)}
        </ScrollView>

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

        {/* ── BANNER ── */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: T.text }]}>Featured & Hot Jobs</Text>
          <Text style={[s.sectionSub, { color: T.textSub }]}>Companies & opportunities near you</Text>
        </View>
        <FlatList
          ref={bannerRef}
          data={BANNERS}
          keyExtractor={(item) => item.id}
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={BANNER_WIDTH + 12}
          decelerationRate="fast"
          contentContainerStyle={s.bannerList}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
            setActiveBanner(index);
          }}
          renderItem={({ item }) => <BannerSlide item={item} T={T} />}
          getItemLayout={(_, index) => ({
            length: BANNER_WIDTH + 12, offset: (BANNER_WIDTH + 12) * index, index,
          })}
        />

        {/* Dots */}
        <View style={s.dotsRow}>
          {BANNERS.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => {
              bannerRef.current?.scrollToIndex({ index: i, animated: true });
              setActiveBanner(i);
            }}>
              <View style={[s.dot, { backgroundColor: T.border },
                activeBanner === i && [s.dotActive, { backgroundColor: T.primary }]
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── RECENT JOBS ── */}
        <View style={[s.sectionHeader, { marginTop: 8 }]}>
          <Text style={[s.sectionTitle, { color: T.text }]}>Recent Jobs</Text>
          <TouchableOpacity>
            <Text style={[s.seeAll, { color: T.primary }]}>See All →</Text>
          </TouchableOpacity>
        </View>
        <View style={s.recentList}>
          {RECENT_JOBS.map((job) => (
            <RecentJobRow key={job.id} item={job} T={T}
              onPress={() => alert(`${job.title}\n${job.company}\nPay: ${job.pay}`)}
            />
          ))}
        </View>

        {/* ── AI BANNER ── */}
        <View style={[s.aiBanner, { backgroundColor: T.primaryBg, borderColor: T.primary + "44" }]}>
          <View style={s.aiBannerLeft}>
            <Text style={[s.aiBannerTitle, { color: T.text }]}>🤖 AI Match Found!</Text>
            <Text style={[s.aiBannerSub, { color: T.textSub }]}>3 jobs match your profile perfectly</Text>
          </View>
          <TouchableOpacity style={[s.aiBannerBtn, { backgroundColor: T.primary }]}>
            <Text style={s.aiBannerBtnText}>View</Text>
          </TouchableOpacity>
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
  statsRow: { paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  statCard: { borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, minWidth: 82, gap: 6, elevation: 2 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 10, textAlign: "center" },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  sectionSub: { fontSize: 12, marginTop: 2 },
  seeAll: { fontSize: 13, fontWeight: "600" },
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
  bannerList: { paddingHorizontal: 16, gap: 12 },
  bannerSlide: { width: BANNER_WIDTH, flexDirection: "row", alignItems: "center", borderRadius: 20, padding: 18, borderWidth: 1.5, gap: 14, elevation: 3 },
  bannerIconBox: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bannerContent: { flex: 1 },
  bannerTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginBottom: 5 },
  bannerTagText: { fontSize: 10, fontWeight: "700" },
  bannerTitle: { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  bannerSubtitle: { fontSize: 11, marginBottom: 3 },
  bannerDetail: { fontSize: 12, fontWeight: "600" },
  bannerArrow: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 12, marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 20, height: 6, borderRadius: 3 },
  recentList: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  recentRow: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, borderWidth: 1, gap: 12, elevation: 2 },
  recentIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recentInfo: { flex: 1 },
  recentTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  recentTitle: { fontSize: 14, fontWeight: "600", flex: 1 },
  urgentTag: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  urgentTagText: { fontSize: 9, fontWeight: "700" },
  recentCompany: { fontSize: 11 },
  recentRight: { alignItems: "flex-end", gap: 4 },
  recentPay: { fontSize: 12, fontWeight: "700" },
  recentType: { fontSize: 10, fontWeight: "600" },
  aiBanner: { marginHorizontal: 16, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1 },
  aiBannerLeft: { flex: 1 },
  aiBannerTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  aiBannerSub: { fontSize: 12 },
  aiBannerBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  aiBannerBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20 },
  footerText: { fontSize: 12 },
  footerBrand: { fontWeight: "700", fontSize: 12 },
});
