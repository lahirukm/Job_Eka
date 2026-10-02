import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const JOB_CATEGORIES = [
  { id: "part_time",  title: "Part Time\nJobs",     icon: "time-outline",            color: "#2563EB", route: "/part-time-map",   count: "248 jobs"    },
  { id: "full_time",  title: "Full Time\nJobs",     icon: "business-outline",        color: "#059669", route: "/full-time-jobs",  count: "89 jobs"     },
  { id: "govt",       title: "Government\nJobs",    icon: "shield-outline",          color: "#D97706", route: "/government-jobs", count: "150+ posts"  },
  { id: "intern",     title: "Internships",          icon: "school-outline",          color: "#7C3AED", route: "/internship",      count: "50+ programs"},
  { id: "cv",         title: "CV\nGenerator",        icon: "document-text-outline",   color: "#EA580C", route: "/cv-generator",    count: "AI Powered"  },
  { id: "interview",  title: "Interview\nPrep",      icon: "videocam-outline",        color: "#0284C7", route: "/interview",       count: "35 tips"     },
];

export default function JobsScreen() {
  const { theme: T, isDark } = useTheme();
  const router = useRouter();

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      <View style={[s.header, { backgroundColor: T.bg }]}>
        <Text style={[s.title, { color: T.text }]}>All Categories</Text>
        <Text style={[s.sub,   { color: T.textSub }]}>Choose what you're looking for</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={s.grid}>
          {JOB_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[s.card, { backgroundColor: T.surface, borderColor: cat.color + "44" }]}
              onPress={() => router.push(cat.route)}
              activeOpacity={0.85}
            >
              {/* Glow */}
              <View style={[s.cardGlow, { backgroundColor: cat.color + (isDark ? "11" : "0A") }]} />

              <View style={[s.cardIcon, { backgroundColor: cat.color + (isDark ? "22" : "15") }]}>
                <Ionicons name={cat.icon} size={28} color={cat.color} />
              </View>
              <Text style={[s.cardTitle, { color: T.text }]}>{cat.title}</Text>
              <Text style={[s.cardCount, { color: cat.color }]}>{cat.count}</Text>

              <View style={[s.cardArrow, { backgroundColor: cat.color }]}>
                <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1 },
  header:    { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  title:     { fontSize: 24, fontWeight: "800" },
  sub:       { fontSize: 13, marginTop: 3 },
  grid:      { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card:      { width: CARD_W, borderRadius: 20, padding: 18, borderWidth: 1.5, elevation: 3, minHeight: 165, position: "relative", overflow: "hidden" },
  cardGlow:  { position: "absolute", top: -10, right: -10, width: 80, height: 80, borderRadius: 40 },
  cardIcon:  { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4, lineHeight: 20 },
  cardCount: { fontSize: 12, fontWeight: "600" },
  cardArrow: { position: "absolute", bottom: 14, right: 14, width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
