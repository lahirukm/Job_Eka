import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const RECENT = [
  "Software Engineer",
  "Part Time Garden",
  "Government Jobs",
  "UI/UX Designer",
  "Internship IT",
];

const POPULAR = [
  { label: "IT Jobs",       icon: "laptop-outline",    color: "#2563EB", route: "/full-time-jobs"   },
  { label: "Part Time",     icon: "time-outline",      color: "#7C3AED", route: "/part-time-map"    },
  { label: "Government",    icon: "business-outline",  color: "#059669", route: "/government-jobs"  },
  { label: "Internship",    icon: "school-outline",    color: "#EA580C", route: "/internship"       },
  { label: "Finance",       icon: "card-outline",      color: "#D97706", route: "/full-time-jobs"   },
  { label: "Marketing",     icon: "megaphone-outline", color: "#DB2777", route: "/full-time-jobs"   },
];

export default function SearchScreen() {
  const { theme: T, isDark } = useTheme();
  const router = useRouter();
  const [search,  setSearch]  = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      <View style={[s.header, { backgroundColor: T.bg }]}>
        <Text style={[s.title, { color: T.text }]}>Search Jobs</Text>
        <Text style={[s.sub,   { color: T.textSub }]}>Find your perfect opportunity</Text>
      </View>

      {/* Search bar */}
      <View style={[s.searchBox, {
        backgroundColor: T.surface,
        borderColor: focused ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
      }]}>
        <Ionicons name="search-outline" size={20} color={focused ? T.primary : T.textLight} />
        <TextInput
          style={[s.searchInput, { color: T.text }]}
          placeholder="Search jobs, companies, skills..."
          placeholderTextColor={T.textLight}
          value={search}
          onChangeText={setSearch}
          editable={true}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          underlineColorAndroid="transparent"
          returnKeyType="search"
          onSubmitEditing={() => { if (search.trim()) router.push("/full-time-jobs"); }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={T.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Recent */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: T.text }]}>Recent Searches</Text>
          <TouchableOpacity><Text style={[s.clearText, { color: T.primary }]}>Clear all</Text></TouchableOpacity>
        </View>
        {RECENT.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[s.recentRow, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
            onPress={() => setSearch(item)}
          >
            <Ionicons name="time-outline" size={16} color={T.textLight} />
            <Text style={[s.recentText, { color: T.textSub }]}>{item}</Text>
            <Ionicons name="arrow-forward-outline" size={14} color={T.textLight} />
          </TouchableOpacity>
        ))}

        {/* Popular */}
        <Text style={[s.sectionTitle, { color: T.text, marginTop: 20, marginBottom: 12 }]}>Popular Categories</Text>
        <View style={s.grid}>
          {POPULAR.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[s.gridCard, {
                backgroundColor: cat.color + (isDark ? "22" : "15"),
                borderColor: cat.color + "44",
              }]}
              onPress={() => router.push(cat.route)}
            >
              <Ionicons name={cat.icon} size={24} color={cat.color} />
              <Text style={[s.gridLabel, { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_W = (width - 44) / 2;

const s = StyleSheet.create({
  root:          { flex: 1 },
  header:        { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  title:         { fontSize: 24, fontWeight: "800" },
  sub:           { fontSize: 13, marginTop: 3 },
  searchBox:     { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 16, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 14, height: 50, gap: 10, elevation: 2 },
  searchInput:   { flex: 1, fontSize: 15, height: 50 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle:  { fontSize: 16, fontWeight: "700" },
  clearText:     { fontSize: 13, fontWeight: "600" },
  recentRow:     { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 8 },
  recentText:    { flex: 1, fontSize: 14 },
  grid:          { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard:      { width: CARD_W, borderRadius: 16, padding: 16, borderWidth: 1.5, alignItems: "center", gap: 8 },
  gridLabel:     { fontSize: 13, fontWeight: "700" },
});
