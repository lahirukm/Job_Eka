import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView,
  StatusBar, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { isDark, toggleTheme, theme: T } = useTheme();

  const [search,        setSearch]        = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const headerFade   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

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
