import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, Platform, BackHandler,
  TextInput, PanResponder, ActivityIndicator,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { getPartTimeJobs } from "../services/jobsApi";

const { width, height } = Dimensions.get("window");

const ONLINE_CONTENT_H = 56;
const DRAG_AREA_H      = 36;
const BOTTOM_SAFE      = Platform.OS === "ios" ? 34 : 0;
const SHEET_OPEN      = height * 0.52;
const SHEET_COLLAPSED = DRAG_AREA_H + ONLINE_CONTENT_H + BOTTOM_SAFE + 16;

const CATEGORIES = [
  { id: "All",        icon: "apps-outline"        },
  { id: "IT",         icon: "laptop-outline"       },
  { id: "Cleaning",   icon: "brush-outline"        },
  { id: "Delivery",   icon: "bicycle-outline"      },
  { id: "Repairs",    icon: "construct-outline"    },
  { id: "Security",   icon: "shield-outline"       },
  { id: "Operations", icon: "settings-outline"     },
  { id: "Design",     icon: "color-palette-outline"},
];

const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

const JobCard = ({ item, T, isDark, onPress }) => (
  <TouchableOpacity
    style={[s.jobCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={s.jobCardRow}>
      <View style={[s.jobIconBox, { backgroundColor: T.primaryBg }]}>
        <Ionicons name="briefcase-outline" size={22} color={T.primary} />
      </View>
      <View style={s.jobInfo}>
        <Text style={[s.jobTitle,   { color: T.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[s.jobCompany, { color: T.textSub }]} numberOfLines={1}>{item.location}</Text>
        <View style={s.jobMeta}>
          <Ionicons name="location-outline" size={12} color={T.textLight} />
          <Text style={[s.jobDist, { color: T.textLight }]}> {item.distanceLabel || "—"}</Text>
          <Text style={[s.jobPay, { color: T.green }]}>   {item.salary}</Text>
        </View>
      </View>
      <TouchableOpacity style={[s.applyBtn, { backgroundColor: T.primary }]} onPress={onPress}>
        <Text style={s.applyBtnText}>Apply</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function PartTimeMapScreen() {
  const { theme: T, isDark } = useTheme();
  const router = useRouter();

  const [isOnline,       setIsOnline]       = useState(false);
  const [location,       setLocation]       = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search,         setSearch]         = useState("");
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [isOpen,         setIsOpen]         = useState(true);
  const [jobs,           setJobs]           = useState([]);
  const [loadingJobs,    setLoadingJobs]    = useState(false);
  // ── Job search auto-suggest states
  const [suggestions,     setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mapRef     = useRef(null);
  const toggleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const sheetAnim  = useRef(new Animated.Value(SHEET_OPEN)).current;
  const lastVal    = useRef(SHEET_OPEN);

  const snapTo = (open) => {
    const toValue = open ? SHEET_OPEN : SHEET_COLLAPSED;
    lastVal.current = toValue;
    setIsOpen(open);
    Animated.spring(sheetAnim, { toValue, tension: 70, friction: 12, useNativeDriver: false }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  (_, g) => Math.abs(g.dy) > 8,
      onPanResponderGrant: () => { sheetAnim.stopAnimation((v) => { lastVal.current = v; }); },
      onPanResponderMove:  (_, g) => {
        const next = Math.max(SHEET_COLLAPSED, Math.min(SHEET_OPEN, lastVal.current - g.dy));
        sheetAnim.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        if (g.vy > 0.4)  { snapTo(false); return; }
        if (g.vy < -0.4) { snapTo(true);  return; }
        const cur = lastVal.current - g.dy;
        snapTo(cur > (SHEET_OPEN + SHEET_COLLAPSED) / 2);
      },
    })
  ).current;

  const loadJobs = async (userLat, userLng) => {
    setLoadingJobs(true);
    try {
      const data = await getPartTimeJobs();
      const enriched = data.map((job) => ({
        ...job,
        lat: job.latitude,
        lng: job.longitude,
        distanceLabel: userLat && job.latitude
          ? `${calcDistance(userLat, userLng, job.latitude, job.longitude)}km`
          : null,
      }));
      setJobs(enriched);
    } catch (err) {
      console.log("Jobs load error:", err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!isOpen) { snapTo(true); return true; }
      router.back(); return true;
    });
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { await loadJobs(null, null); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      await loadJobs(loc.coords.latitude, loc.coords.longitude);
    })();
    return () => back.remove();
  }, [isOpen]);

  useEffect(() => {
    if (isOnline) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isOnline]);

  const handleToggle = () => {
    const next = !isOnline;
    Animated.spring(toggleAnim, { toValue: next ? 1 : 0, tension: 60, friction: 8, useNativeDriver: false }).start();
    setIsOnline(next);
  };

  // ── Job search with auto-suggest from loaded jobs
  const handleSearch = (text) => {
    setSearch(text);
    if (text.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // Filter jobs matching typed text
    const lower = text.toLowerCase();
    const matched = jobs.filter((j) =>
      j.status === "active" && (
        j.title.toLowerCase().includes(lower) ||
        (j.location || "").toLowerCase().includes(lower) ||
        (j.category || "").toLowerCase().includes(lower)
      )
    ).slice(0, 6); // max 6 suggestions
    setSuggestions(matched);
    setShowSuggestions(matched.length > 0);
  };

  // ── User tapped a suggestion
  const handleSelectSuggestion = (job) => {
    setSearch(job.title);
    setShowSuggestions(false);
    setSuggestions([]);
    // Animate map to job location
    if (job.lat && job.lng && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude:      job.lat,
        longitude:     job.lng,
        latitudeDelta:  0.02,
        longitudeDelta: 0.02,
      }, 800);
    }
  };

  const toggleX  = toggleAnim.interpolate({ inputRange: [0, 1], outputRange: [3, 30] });
  const toggleBg = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? "#2D3748" : "#CBD5E0", T.green],
  });

  const filteredJobs = jobs
    .filter((j) => {
      if (j.status !== "active") return false;
      if (!isOnline) return false;
      const matchCat    = activeCategory === "All" || j.category === activeCategory;
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                          (j.location || "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      // Sort by distance — nearest first
      const distA = parseFloat(a.distanceLabel) || 9999;
      const distB = parseFloat(b.distanceLabel) || 9999;
      return distA - distB;
    });

  const defaultRegion = {
    latitude:  location?.latitude  || 6.9271,
    longitude: location?.longitude || 79.8612,
    latitudeDelta: 0.04, longitudeDelta: 0.04,
  };

  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  const arrowRotate = sheetAnim.interpolate({
    inputRange: [SHEET_COLLAPSED, SHEET_OPEN],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={[s.root, { backgroundColor: "#000" }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor="transparent" translucent />

      {/* ── FULL SCREEN MAP ── */}
      <View style={StyleSheet.absoluteFill}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={defaultRegion}
          showsUserLocation
          showsMyLocationButton={false}
          userInterfaceStyle={isDark ? "dark" : "light"}
        >
          <Circle
            center={{ latitude: location?.latitude || 6.9271, longitude: location?.longitude || 79.8612 }}
            radius={3000}
            fillColor={T.primary + "10"}
            strokeColor={T.primary + "55"}
            strokeWidth={1.5}
          />
          {isOnline && filteredJobs.filter((j) => j.lat && j.lng).map((job) => (
            <Marker
              key={job._id}
              coordinate={{ latitude: job.lat, longitude: job.lng }}
              title={job.title}
              description={`${job.salary} · ${job.location}`}
            >
              <View style={[s.marker, { backgroundColor: T.primary }]}>
                <Ionicons name="briefcase" size={12} color="#FFFFFF" />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* ── BACK BUTTON ── */}
      <TouchableOpacity style={[s.backBtn, { backgroundColor: T.surface }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={T.text} />
      </TouchableOpacity>

      {/* ── SEARCH BAR + AUTO-SUGGEST DROPDOWN ── */}
      <View style={[s.searchWrapper]}>
        {/* Search input */}
        <View style={[s.mapSearch, {
          backgroundColor: T.surface + "F8",
          borderColor: searchFocused ? T.primary : chipBorder,
        }]}>
          <Ionicons name="search-outline" size={15} color={searchFocused ? T.primary : T.textLight} />
          <TextInput
            style={[s.mapSearchInput, { color: T.text }]}
            placeholder="Search jobs, location..."
            placeholderTextColor={T.textLight}
            value={search}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => {
              setSearchFocused(false);
              setShowSuggestions(false);
            }, 150)}
            returnKeyType="search"
            underlineColorAndroid="transparent"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearch("");
              setSuggestions([]);
              setShowSuggestions(false);
            }}>
              <Ionicons name="close-circle" size={16} color={T.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Auto-suggest dropdown ── */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={[s.suggestionsBox, {
            backgroundColor: T.surface,
            borderColor: isDark ? "#1E2D40" : "#E5E7EB",
          }]}>
            {suggestions.map((job, i) => (
              <TouchableOpacity
                key={job._id || i}
                style={[s.suggestionItem, {
                  borderBottomWidth: i < suggestions.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? "#1E2D40" : "#F3F4F6",
                }]}
                onPress={() => handleSelectSuggestion(job)}
                activeOpacity={0.7}
              >
                <View style={[s.suggestionIcon, { backgroundColor: T.primaryBg }]}>
                  <Ionicons name="briefcase-outline" size={14} color={T.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.suggestionTitle, { color: T.text }]} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <Ionicons name="location-outline" size={11} color={T.textLight} />
                    <Text style={[s.suggestionSub, { color: T.textSub }]} numberOfLines={1}>
                      {job.location}
                    </Text>
                    <Text style={[s.suggestionPay, { color: T.green }]}>
                      · {job.salary}
                    </Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={14} color={T.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── BADGE + MY LOCATION ── */}
      <View style={[s.mapBadge, { backgroundColor: T.surface + "F5", borderColor: chipBorder }]}>
        <View style={[s.badgeDot, { backgroundColor: isOnline ? T.green : chipColor }]} />
        <Text style={[s.mapBadgeText, { color: T.text }]}>
          {loadingJobs ? "Loading..." : isOnline ? `${filteredJobs.length} jobs nearby` : "Go online to see jobs"}
        </Text>
      </View>

      <TouchableOpacity
        style={[s.myLocBtn, { backgroundColor: T.surface, borderColor: chipBorder }]}
        onPress={() => {
          if (location && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: location.latitude, longitude: location.longitude,
              latitudeDelta: 0.02, longitudeDelta: 0.02,
            }, 800);
          }
        }}
      >
        <Ionicons name="navigate" size={20} color={T.primary} />
      </TouchableOpacity>

      {/* ── BOTTOM SHEET ── */}
      <Animated.View style={[s.sheet, {
        backgroundColor: T.surface,
        height: sheetAnim,
        shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15, shadowRadius: 10, elevation: 20,
      }]}>
        <TouchableOpacity
          {...panResponder.panHandlers}
          onPress={() => snapTo(!isOpen)}
          style={s.dragArea}
          activeOpacity={1}
        >
          <View style={[s.dragHandle, { backgroundColor: chipBorder }]} />
          <Animated.View style={{ transform: [{ rotate: arrowRotate }] }}>
            <Ionicons name="chevron-up" size={18} color={chipColor} />
          </Animated.View>
        </TouchableOpacity>

        {isOpen && (
          <>
            {/* Category chips */}
            <View style={s.chipRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsScroll} keyboardShouldPersistTaps="handled">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[s.chip, { backgroundColor: isActive ? T.primary : chipBg, borderColor: isActive ? T.primary : chipBorder }]}
                      onPress={() => setActiveCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={cat.icon} size={13} color={isActive ? "#FFFFFF" : chipColor} />
                      <Text style={[s.chipText, { color: isActive ? "#FFFFFF" : chipColor }]}>{" "}{cat.id}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={s.countRow}>
              <Text style={[s.countText, { color: T.text }]}>
                <Text style={{ fontWeight: "800" }}>{filteredJobs.length}</Text>
                <Text style={{ color: T.textSub }}>{" "}available jobs</Text>
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={[s.sortBtn, { backgroundColor: isDark ? "#0D1A35" : "#EEF2FF", borderColor: isDark ? "#1E2D40" : "#BFDBFE" }]}>
                  <Ionicons name="navigate-outline" size={13} color={T.primary} />
                  <Text style={[s.sortText, { color: T.primary }]}> Nearest</Text>
                </View>
                <TouchableOpacity
                  style={[s.sortBtn, { backgroundColor: isDark ? T.surface2 : "#F9FAFB", borderColor: chipBorder }]}
                  onPress={() => loadJobs(location?.latitude, location?.longitude)}
                >
                  <Ionicons name="refresh-outline" size={13} color={T.textSub} />
                  <Text style={[s.sortText, { color: T.textSub }]}> Refresh</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Jobs list */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {loadingJobs ? (
                <View style={s.emptyBox}>
                  <ActivityIndicator size="large" color={T.primary} />
                  <Text style={[s.emptyText, { color: T.textSub }]}>Loading jobs...</Text>
                </View>
              ) : !isOnline ? (
                <View style={s.emptyBox}>
                  <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: isDark ? "#1E2D40" : "#F3F4F6", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                    <Ionicons name="wifi-outline" size={28} color={chipColor} />
                  </View>
                  <Text style={[s.emptyText, { color: T.text }]}>You are Offline</Text>
                  <Text style={{ color: T.textSub, fontSize: 12, textAlign: "center" }}>
                    Toggle Online to see available{"\n"}part time jobs near you
                  </Text>
                </View>
              ) : filteredJobs.length === 0 ? (
                <View style={s.emptyBox}>
                  <Ionicons name="briefcase-outline" size={36} color={chipBorder} />
                  <Text style={[s.emptyText, { color: T.textSub }]}>No active jobs found</Text>
                  <Text style={{ color: T.textLight, fontSize: 12, textAlign: "center" }}>
                    All jobs may be filled or no jobs{"\n"}in your category right now
                  </Text>
                </View>
              ) : (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    item={job}
                    T={T}
                    isDark={isDark}
                    onPress={() => {
                      if (job.lat && job.lng && mapRef.current) {
                        mapRef.current.animateToRegion({
                          latitude: job.lat, longitude: job.lng,
                          latitudeDelta: 0.01, longitudeDelta: 0.01,
                        }, 500);
                      }
                      setTimeout(() => {
                        router.push({
                          pathname: "/job-detail",
                          params: { job: JSON.stringify(job) },
                        });
                      }, 300);
                    }}
                  />
                ))
              )}
              <View style={{ height: 8 }} />
            </ScrollView>
          </>
        )}

        {/* Online bar */}
        <View style={[s.onlineBar, {
          backgroundColor: T.surface,
          borderTopColor: isDark ? "#1E2D40" : "#E5E7EB",
          paddingBottom: BOTTOM_SAFE > 0 ? BOTTOM_SAFE : 14,
        }]}>
          <View style={s.onlineLeft}>
            {isOnline && (
              <Animated.View style={[s.pulseRing, { borderColor: T.green + "88", transform: [{ scale: pulseAnim }] }]} />
            )}
            <View style={[s.statusDot, { backgroundColor: isOnline ? T.green : (isDark ? "#4A5568" : "#9CA3AF") }]} />
            <View>
              <Text style={[s.statusTitle, { color: T.text }]}>
                {isOnline ? "You are Online" : "You are Offline"}
              </Text>
              <Text style={[s.statusSub, { color: T.textSub }]}>
                {isOnline ? "Employers can find you 🎉" : "Tap to go online"}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleToggle} activeOpacity={0.8} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} style={s.toggleWrap}>
            <Animated.View style={[s.track, { backgroundColor: toggleBg }]}>
              <Animated.View style={[s.thumb, { transform: [{ translateX: toggleX }] }]} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  marker: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF", elevation: 5 },
  backBtn: { position: "absolute", top: 50, left: 14, width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", elevation: 8, zIndex: 10 },

  // Search wrapper — positions search + dropdown together
  searchWrapper: { position: "absolute", top: 50, left: 64, right: 14, zIndex: 20 },
  mapSearch: { flexDirection: "row", alignItems: "center", borderRadius: 14, paddingHorizontal: 12, height: 42, borderWidth: 1.5, gap: 8, elevation: 8 },
  mapSearchInput: { flex: 1, fontSize: 13, height: 42, paddingVertical: 0 },

  // Auto-suggest dropdown
  suggestionsBox:   { marginTop: 4, borderRadius: 14, borderWidth: 1, elevation: 20, overflow: "hidden" },
  suggestionItem:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  suggestionIcon:   { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  suggestionTitle:  { fontSize: 13, fontWeight: "700" },
  suggestionSub:    { fontSize: 11 },
  suggestionPay:    { fontSize: 11, fontWeight: "700" },

  mapBadge: { position: "absolute", top: 104, left: 14, flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, elevation: 7, zIndex: 10 },
  badgeDot: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  mapBadgeText: { fontSize: 13, fontWeight: "600" },
  myLocBtn: { position: "absolute", top: 104, right: 14, width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 7, zIndex: 10 },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  dragArea: { height: DRAG_AREA_H, alignItems: "center", justifyContent: "center", gap: 4 },
  dragHandle: { width: 40, height: 5, borderRadius: 3 },
  chipRow: { height: 54, justifyContent: "center" },
  chipsScroll: { paddingHorizontal: 14, alignItems: "center", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", height: 36, paddingHorizontal: 13, borderRadius: 18, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: "600" },
  countRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 44 },
  countText: { fontSize: 15 },
  sortBtn: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  sortText: { fontSize: 13 },
  jobCard: { marginHorizontal: 16, marginBottom: 11, borderRadius: 16, padding: 15, borderWidth: 1, elevation: 2 },
  jobCardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  jobIconBox: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  jobCompany: { fontSize: 12, marginBottom: 4 },
  jobMeta: { flexDirection: "row", alignItems: "center" },
  jobDist: { fontSize: 11 },
  jobPay: { fontSize: 13, fontWeight: "700" },
  applyBtn: { borderRadius: 11, paddingHorizontal: 14, paddingVertical: 9 },
  applyBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  emptyBox: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, fontWeight: "600" },
  onlineBar: { height: ONLINE_CONTENT_H + 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, borderTopWidth: 1 },
  onlineLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  pulseRing: { position: "absolute", left: -8, top: -8, width: 28, height: 28, borderRadius: 14, borderWidth: 2 },
  statusDot: { width: 13, height: 13, borderRadius: 7 },
  statusTitle: { fontSize: 14, fontWeight: "700" },
  statusSub: { fontSize: 11, marginTop: 2 },
  toggleWrap: { padding: 10 },
  track: { width: 62, height: 32, borderRadius: 16, justifyContent: "center", paddingHorizontal: 3 },
  thumb: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#FFFFFF", elevation: 4 },
});
