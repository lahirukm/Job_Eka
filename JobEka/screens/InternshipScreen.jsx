import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const FIELDS    = ["All", "IT", "Engineering", "Business", "Medicine", "Law", "Design", "Finance"];
const DURATIONS = ["All", "1 Month", "3 Months", "6 Months", "1 Year"];

const INTERNSHIPS = [
  {
    id: "1",
    title: "Software Engineering Intern",
    company: "Dialog Axiata",
    field: "IT",
    duration: "6 Months",
    stipend: "LKR 25,000",
    location: "Colombo 3",
    deadline: "2025-06-01",
    posted: "1d ago",
    logo: "laptop-outline",
    color: "#2563EB",
    openings: 10,
    description: "Join Dialog's tech team as a Software Engineering Intern. Work on real projects using React, Node.js, and cloud technologies.",
    requirements: ["Undergraduate in IT/CS", "Basic programming knowledge", "Enthusiastic learner", "Sinhala/English proficiency"],
    perks: ["Monthly stipend", "Mentorship program", "Certificate of completion", "PPF eligible"],
  },
  {
    id: "2",
    title: "Medical Intern",
    company: "Colombo National Hospital",
    field: "Medicine",
    duration: "1 Year",
    stipend: "LKR 45,000",
    location: "Colombo 10",
    deadline: "2025-05-30",
    posted: "3h ago",
    logo: "medical-outline",
    color: "#059669",
    openings: 50,
    description: "Mandatory medical internship for MBBS graduates. Rotations across all departments including Surgery, Medicine, Paediatrics.",
    requirements: ["MBBS degree", "SLMC provisional registration", "Sri Lankan citizen"],
    perks: ["Government stipend", "Accommodation assistance", "Full training", "Permanent job pathway"],
  },
  {
    id: "3",
    title: "Business Development Intern",
    company: "John Keells Holdings",
    field: "Business",
    duration: "3 Months",
    stipend: "LKR 20,000",
    location: "Colombo 3",
    deadline: "2025-06-15",
    posted: "2d ago",
    logo: "trending-up-outline",
    color: "#D97706",
    openings: 5,
    description: "Support JKH's business development team with market research, presentations, and client management.",
    requirements: ["Business/Management undergraduate", "Strong Excel skills", "Good communication", "Team player"],
    perks: ["Stipend", "JKH employee benefits", "Networking opportunities", "Reference letter"],
  },
  {
    id: "4",
    title: "UI/UX Design Intern",
    company: "WSO2",
    field: "Design",
    duration: "6 Months",
    stipend: "LKR 30,000",
    location: "Colombo 3",
    deadline: "2025-07-01",
    posted: "5h ago",
    logo: "color-palette-outline",
    color: "#7C3AED",
    openings: 3,
    description: "Work with WSO2's product design team to create intuitive user interfaces for enterprise software products.",
    requirements: ["Design undergraduate", "Figma proficiency", "Portfolio required", "Basic HTML/CSS"],
    perks: ["Competitive stipend", "Remote work option", "International exposure", "PPF contribution"],
  },
  {
    id: "5",
    title: "Finance & Accounting Intern",
    company: "Commercial Bank",
    field: "Finance",
    duration: "3 Months",
    stipend: "LKR 18,000",
    location: "Colombo 1",
    deadline: "2025-06-20",
    posted: "1d ago",
    logo: "card-outline",
    color: "#0284C7",
    openings: 15,
    description: "Gain hands-on experience in banking operations, financial analysis, and customer service at Commercial Bank.",
    requirements: ["Finance/Accounting undergraduate", "A/L Mathematics", "Good analytical skills", "Attention to detail"],
    perks: ["Stipend", "Banking experience", "Certificate", "Job opportunity after graduation"],
  },
  {
    id: "6",
    title: "Civil Engineering Intern",
    company: "Road Development Authority",
    field: "Engineering",
    duration: "6 Months",
    stipend: "LKR 22,000",
    location: "Colombo 7",
    deadline: "2025-05-25",
    posted: "4d ago",
    logo: "construct-outline",
    color: "#EA580C",
    openings: 20,
    description: "Field experience in road construction and infrastructure development projects across Sri Lanka.",
    requirements: ["Civil Engineering undergraduate", "Year 3 or above", "AutoCAD knowledge", "Willingness to travel"],
    perks: ["Government stipend", "Field experience", "Travel allowance", "Certificate"],
  },
];

// ── Internship Card — outside
const InternshipCard = ({ item, T, isDark, onPress }) => {
  const daysLeft = Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7;

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top */}
      <View style={s.cardTop}>
        <View style={[s.logoBox, { backgroundColor: item.color + (isDark ? "22" : "15") }]}>
          <Ionicons name={item.logo} size={24} color={item.color} />
        </View>
        <View style={s.cardMeta}>
          <Text style={[s.cardTitle, { color: T.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[s.cardCompany, { color: item.color }]}>{item.company}</Text>
          <View style={s.cardRow}>
            <Ionicons name="location-outline" size={11} color={T.textLight} />
            <Text style={[s.cardLocation, { color: T.textLight }]}> {item.location}</Text>
          </View>
        </View>
        <View style={s.cardRight}>
          <Text style={[s.cardStipend, { color: T.green }]}>{item.stipend}/mo</Text>
          <View style={[s.durationBadge, { backgroundColor: item.color + (isDark ? "22" : "15") }]}>
            <Text style={[s.durationText, { color: item.color }]}>{item.duration}</Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      <View style={s.tagsRow}>
        <View style={[s.tag, { backgroundColor: isDark ? "#1E2D40" : "#F3F4F6" }]}>
          <Ionicons name="school-outline" size={10} color={T.textSub} />
          <Text style={[s.tagText, { color: T.textSub }]}> {item.field}</Text>
        </View>
        <View style={[s.tag, { backgroundColor: isDark ? "#1E2D40" : "#F3F4F6" }]}>
          <Ionicons name="people-outline" size={10} color={T.textSub} />
          <Text style={[s.tagText, { color: T.textSub }]}> {item.openings} openings</Text>
        </View>
        <View style={[s.tag, {
          backgroundColor: isUrgent ? (isDark ? "#2D1A0D" : "#FFF7ED") : (isDark ? "#1E2D40" : "#F3F4F6"),
        }]}>
          <Ionicons name="time-outline" size={10} color={isUrgent ? T.orange : T.textSub} />
          <Text style={[s.tagText, { color: isUrgent ? T.orange : T.textSub }]}>
            {" "}{isUrgent ? `${daysLeft}d left!` : item.deadline}
          </Text>
        </View>
        <TouchableOpacity style={[s.applyBtn, { backgroundColor: T.primary }]} onPress={onPress}>
          <Text style={s.applyBtnText}>Apply</Text>
          <Ionicons name="arrow-forward" size={11} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ── Apply Modal — outside
const InternshipModal = ({ item, visible, onClose, T, isDark }) => {
  const slideAnim = useRef(new Animated.Value(200)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (visible) {
      setStep(1);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View style={[s.modalSheet, {
          backgroundColor: T.surface,
          transform: [{ translateY: slideAnim }],
        }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[s.modalHandle, { backgroundColor: isDark ? "#2D4060" : "#D1D5DB" }]} />

            {step === 2 ? (
              // ── Success
              <View style={s.successBox}>
                <View style={[s.successIcon, { backgroundColor: T.greenBg }]}>
                  <Ionicons name="checkmark-circle" size={60} color={T.green} />
                </View>
                <Text style={[s.successTitle, { color: T.text }]}>Application Sent! 🎉</Text>
                <Text style={[s.successSub, { color: T.textSub }]}>
                  Your internship application for{"\n"}{item.company} has been submitted!
                </Text>
                <TouchableOpacity style={[s.doneBtn, { backgroundColor: T.primary }]} onPress={onClose}>
                  <Text style={s.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Header */}
                <View style={[s.modalHeader, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
                  <View style={[s.modalLogo, { backgroundColor: item.color + (isDark ? "22" : "15") }]}>
                    <Ionicons name={item.logo} size={28} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.modalTitle, { color: T.text }]}>{item.title}</Text>
                    <Text style={[s.modalCompany, { color: item.color }]}>{item.company}</Text>
                    <Text style={[s.modalLocation, { color: T.textSub }]}>
                      {item.location}  ·  {item.duration}
                    </Text>
                  </View>
                </View>

                {/* Info grid */}
                <View style={[s.infoGrid, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
                  {[
                    { icon: "cash-outline",   label: "Stipend",   value: item.stipend + "/mo", color: T.green   },
                    { icon: "people-outline", label: "Openings",  value: `${item.openings}`,   color: T.primary },
                    { icon: "time-outline",   label: "Duration",  value: item.duration,         color: T.orange  },
                    { icon: "calendar-outline",label: "Deadline", value: item.deadline,          color: T.textSub },
                  ].map((info, i) => (
                    <View key={i} style={s.infoItem}>
                      <Ionicons name={info.icon} size={16} color={info.color} />
                      <Text style={[s.infoLabel, { color: T.textLight }]}>{info.label}</Text>
                      <Text style={[s.infoValue, { color: info.color }]}>{info.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Description */}
                <Text style={[s.sectionLabel, { color: T.text }]}>About this internship</Text>
                <Text style={[s.descText, { color: T.textSub }]}>{item.description}</Text>

                {/* Requirements */}
                <Text style={[s.sectionLabel, { color: T.text }]}>Requirements</Text>
                {item.requirements.map((req, i) => (
                  <View key={i} style={s.reqRow}>
                    <View style={[s.reqDot, { backgroundColor: item.color }]} />
                    <Text style={[s.reqText, { color: T.textSub }]}>{req}</Text>
                  </View>
                ))}

                {/* Perks */}
                <Text style={[s.sectionLabel, { color: T.text }]}>What you get</Text>
                <View style={s.perksGrid}>
                  {item.perks.map((perk, i) => (
                    <View key={i} style={[s.perkItem, { backgroundColor: isDark ? "#0D1525" : "#F8FAFC", borderColor: isDark ? "#1E2D40" : "#E2E8F0" }]}>
                      <Ionicons name="star-outline" size={13} color={item.color} />
                      <Text style={[s.perkText, { color: T.textSub }]}> {perk}</Text>
                    </View>
                  ))}
                </View>

                {/* Apply button */}
                <TouchableOpacity
                  style={[s.submitBtn, { backgroundColor: T.primary }]}
                  onPress={() => setStep(2)}
                >
                  <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                  <Text style={s.submitBtnText}>Apply for Internship</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[s.closeBtn, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={onClose}>
                  <Text style={[s.closeBtnText, { color: T.textSub }]}>Close</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
export default function InternshipScreen() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [search,      setSearch]      = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [activeField, setActiveField] = useState("All");
  const [activeDur,   setActiveDur]   = useState("All");
  const [selected,    setSelected]    = useState(null);

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filtered = INTERNSHIPS.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                        j.company.toLowerCase().includes(search.toLowerCase());
    const matchField  = activeField === "All" || j.field === activeField;
    const matchDur    = activeDur   === "All" || j.duration === activeDur;
    return matchSearch && matchField && matchDur;
  });

  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      {/* Header */}
      <Animated.View style={[s.header, { backgroundColor: T.bg, opacity: headerFade }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={T.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerTitleRow}>
            <Ionicons name="school" size={20} color={T.primary} />
            <Text style={[s.headerTitle, { color: T.text }]}> Internships</Text>
          </View>
          <Text style={[s.headerSub, { color: T.textSub }]}>{filtered.length} opportunities found</Text>
        </View>
        <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={toggleTheme}>
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={17} color={isDark ? "#F59E0B" : T.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Search */}
      <View style={s.searchRow}>
        <View style={[s.searchBox, { backgroundColor: T.surface, borderColor: searchFocus ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB") }]}>
          <Ionicons name="search-outline" size={17} color={searchFocus ? T.primary : T.textLight} />
          <TextInput
            style={[s.searchInput, { color: T.text }]}
            placeholder="Search internships, companies..."
            placeholderTextColor={T.textLight}
            value={search}
            onChangeText={setSearch}
            editable={true}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            underlineColorAndroid="transparent"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={T.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Field chips */}
      <View style={{ height: 48, justifyContent: "center" }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: "center" }}>
          {FIELDS.map((f) => {
            const isActive = activeField === f;
            return (
              <TouchableOpacity
                key={f}
                style={[s.chip, { backgroundColor: isActive ? T.primary : chipBg, borderColor: isActive ? T.primary : chipBorder }]}
                onPress={() => setActiveField(f)}
              >
                <Text style={[s.chipText, { color: isActive ? "#FFFFFF" : chipColor }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Duration chips */}
      <View style={{ height: 44, justifyContent: "center", marginBottom: 4 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: "center" }}>
          {DURATIONS.map((d) => {
            const isActive = activeDur === d;
            return (
              <TouchableOpacity
                key={d}
                style={[s.dChip, {
                  backgroundColor: isActive ? (isDark ? T.primaryBg : "#EEF2FF") : "transparent",
                  borderColor: isActive ? T.primary : chipBorder,
                }]}
                onPress={() => setActiveDur(d)}
              >
                <Ionicons name="time-outline" size={12} color={isActive ? T.primary : chipColor} />
                <Text style={[s.dChipText, { color: isActive ? T.primary : chipColor }]}> {d}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="school-outline" size={48} color={isDark ? "#1E2D40" : "#E5E7EB"} />
            <Text style={[s.emptyTitle, { color: T.text }]}>No internships found</Text>
            <Text style={[s.emptySub, { color: T.textSub }]}>Try different filters</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <InternshipCard key={item.id} item={item} T={T} isDark={isDark} onPress={() => setSelected(item)} />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <InternshipModal item={selected} visible={!!selected} onClose={() => setSelected(null)} T={T} isDark={isDark} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  headerCenter: { flex: 1 },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  searchRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8, gap: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 46, gap: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, height: 46, paddingVertical: 0 },
  chip: { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  chipText: { fontSize: 13, fontWeight: "600" },
  dChip: { flexDirection: "row", alignItems: "center", height: 30, paddingHorizontal: 12, borderRadius: 15, borderWidth: 1.5 },
  dChipText: { fontSize: 12, fontWeight: "600" },

  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 16, borderWidth: 1, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  logoBox: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardMeta: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2, lineHeight: 20 },
  cardCompany: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  cardLocation: { fontSize: 11 },
  cardRight: { alignItems: "flex-end", gap: 6 },
  cardStipend: { fontSize: 12, fontWeight: "700" },
  durationBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  durationText: { fontSize: 10, fontWeight: "700" },
  tagsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: "600" },
  applyBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, gap: 4, marginLeft: "auto" },
  applyBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  emptyBox: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: height * 0.9, elevation: 30 },
  modalHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", gap: 14, borderBottomWidth: 1, paddingBottom: 16, marginBottom: 16 },
  modalLogo: { width: 52, height: 52, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 3, lineHeight: 22 },
  modalCompany: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  modalLocation: { fontSize: 12 },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 12, marginBottom: 16, gap: 8 },
  infoItem: { width: (width - 80) / 2, alignItems: "center", paddingVertical: 8, gap: 4 },
  infoLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
  infoValue: { fontSize: 12, fontWeight: "700", textAlign: "center" },

  sectionLabel: { fontSize: 14, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  descText: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  reqRow: { flexDirection: "row", alignItems: "center", marginBottom: 7, gap: 8 },
  reqDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  reqText: { fontSize: 13, flex: 1 },

  perksGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  perkItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  perkText: { fontSize: 12 },

  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 14, gap: 10, elevation: 4, marginBottom: 10 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  closeBtn: { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  closeBtnText: { fontSize: 14, fontWeight: "600" },

  successBox: { alignItems: "center", paddingVertical: 30, gap: 12 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontWeight: "800" },
  successSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  doneBtn: { height: 50, paddingHorizontal: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  doneBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
