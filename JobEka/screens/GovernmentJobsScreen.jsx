import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, Modal, Linking, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const MINISTRIES = ["All", "Education", "Health", "Finance", "Defence", "Agriculture", "Justice", "Transport"];
const DEPARTMENTS = ["All", "Dept. of Education", "Ministry HQ", "Provincial Office", "National Hospital", "Treasury", "Police", "Customs"];
const DISTRICTS   = ["All", "Colombo", "Gampaha", "Kandy", "Galle", "Matara", "Jaffna", "Kurunegala", "Anuradhapura"];

const GOVT_JOBS = [
  {
    id: "1",
    title: "Assistant Director of Education",
    ministry: "Education",
    department: "Dept. of Education",
    district: "Colombo",
    grade: "Grade II",
    salary: "LKR 47,000 - 85,000",
    deadline: "2025-05-30",
    posted: "2d ago",
    applyType: "both",         // "direct" | "gazette" | "both"
    gazetteUrl: "https://www.documents.gov.lk/gazette/2025/gazette_1.pdf",
    vacancies: 45,
    description: "Responsible for coordinating educational activities and implementing Ministry policies at district level. Candidates must hold a relevant degree.",
    requirements: ["Bachelor's degree in Education", "Age 22-45", "Computer literacy", "Fluency in Sinhala/Tamil"],
    logo: "school-outline",
    color: "#2563EB",
  },
  {
    id: "2",
    title: "Medical Officer",
    ministry: "Health",
    department: "National Hospital",
    district: "Colombo",
    grade: "Grade I",
    salary: "LKR 75,000 - 130,000",
    deadline: "2025-06-15",
    posted: "1d ago",
    applyType: "gazette",
    gazetteUrl: "https://www.documents.gov.lk/gazette/2025/gazette_2.pdf",
    vacancies: 120,
    description: "Provide medical services at government hospitals. MBBS qualified candidates are invited to apply through official gazette notification.",
    requirements: ["MBBS degree", "SLMC registration", "Age below 40", "2 years internship"],
    logo: "medical-outline",
    color: "#059669",
  },
  {
    id: "3",
    title: "Revenue Officer",
    ministry: "Finance",
    department: "Treasury",
    district: "Gampaha",
    grade: "Grade III",
    salary: "LKR 33,000 - 55,000",
    deadline: "2025-05-20",
    posted: "3d ago",
    applyType: "direct",
    gazetteUrl: null,
    vacancies: 200,
    description: "Handle revenue collection and financial administration at district level. Applications are accepted online directly.",
    requirements: ["A/L qualified", "Age 18-30", "Sri Lankan citizen", "No criminal record"],
    logo: "cash-outline",
    color: "#D97706",
  },
  {
    id: "4",
    title: "Police Constable",
    ministry: "Defence",
    department: "Police",
    district: "All Island",
    grade: "Constable",
    salary: "LKR 28,000 - 45,000",
    deadline: "2025-07-01",
    posted: "5h ago",
    applyType: "gazette",
    gazetteUrl: "https://www.documents.gov.lk/gazette/2025/gazette_3.pdf",
    vacancies: 3000,
    description: "Sri Lanka Police invites applications for Police Constable vacancies. Physical fitness test required. Gazette notification attached.",
    requirements: ["O/L 6 passes", "Age 18-28", "Height 5'2\" (male)", "Medical fitness"],
    logo: "shield-outline",
    color: "#1E40AF",
  },
  {
    id: "5",
    title: "Agricultural Instructor",
    ministry: "Agriculture",
    department: "Provincial Office",
    district: "Kandy",
    grade: "Grade II",
    salary: "LKR 38,000 - 65,000",
    deadline: "2025-06-10",
    posted: "1d ago",
    applyType: "both",
    gazetteUrl: "https://www.documents.gov.lk/gazette/2025/gazette_4.pdf",
    vacancies: 80,
    description: "Provide agricultural guidance and support to farmers. Both direct online application and gazette application accepted.",
    requirements: ["BSc Agriculture", "Age 22-40", "Driving license", "Field experience preferred"],
    logo: "leaf-outline",
    color: "#059669",
  },
  {
    id: "6",
    title: "Customs Officer",
    ministry: "Finance",
    department: "Customs",
    district: "Colombo",
    grade: "Grade III",
    salary: "LKR 42,000 - 70,000",
    deadline: "2025-05-25",
    posted: "4h ago",
    applyType: "direct",
    gazetteUrl: null,
    vacancies: 150,
    description: "Manage customs clearance, inspect goods, and enforce customs regulations at ports of entry.",
    requirements: ["Degree or equivalent", "Age 22-35", "English proficiency", "Computer skills"],
    logo: "boat-outline",
    color: "#7C3AED",
  },
  {
    id: "7",
    title: "Judicial Service Officer",
    ministry: "Justice",
    department: "Ministry HQ",
    district: "Colombo",
    grade: "Grade I",
    salary: "LKR 65,000 - 115,000",
    deadline: "2025-06-30",
    posted: "2d ago",
    applyType: "gazette",
    gazetteUrl: "https://www.documents.gov.lk/gazette/2025/gazette_5.pdf",
    vacancies: 25,
    description: "Serve in the judicial system as a junior officer. LLB qualified candidates only. Gazette notification mandatory.",
    requirements: ["LLB degree", "Attorney-at-Law", "Age below 45", "Good character"],
    logo: "hammer-outline",
    color: "#DC2626",
  },
  {
    id: "8",
    title: "Bus Driver (SLTB)",
    ministry: "Transport",
    department: "Provincial Office",
    district: "Galle",
    grade: "Grade IV",
    salary: "LKR 25,000 - 38,000",
    deadline: "2025-05-28",
    posted: "6h ago",
    applyType: "direct",
    gazetteUrl: null,
    vacancies: 500,
    description: "Drive SLTB buses on assigned routes. Valid heavy vehicle license required. Apply online directly.",
    requirements: ["O/L qualified", "Heavy vehicle license", "Age 25-45", "5 years driving experience"],
    logo: "bus-outline",
    color: "#EA580C",
  },
];

// ── Gazette/Apply type badge
const ApplyTypeBadge = ({ type, T, isDark }) => {
  if (type === "direct") return (
    <View style={[applyBadgeStyle.badge, { backgroundColor: isDark ? "#0D2518" : "#ECFDF5", borderColor: "#A7F3D0" }]}>
      <Ionicons name="globe-outline" size={11} color="#059669" />
      <Text style={[applyBadgeStyle.text, { color: "#059669" }]}> Direct Apply</Text>
    </View>
  );
  if (type === "gazette") return (
    <View style={[applyBadgeStyle.badge, { backgroundColor: isDark ? "#1E1A0D" : "#FFFBEB", borderColor: "#FDE68A" }]}>
      <Ionicons name="document-text-outline" size={11} color="#D97706" />
      <Text style={[applyBadgeStyle.text, { color: "#D97706" }]}> Gazette Only</Text>
    </View>
  );
  return (
    <View style={[applyBadgeStyle.badge, { backgroundColor: isDark ? "#0D1A35" : "#EEF2FF", borderColor: "#BFDBFE" }]}>
      <Ionicons name="layers-outline" size={11} color="#2563EB" />
      <Text style={[applyBadgeStyle.text, { color: "#2563EB" }]}> Both Options</Text>
    </View>
  );
};
const applyBadgeStyle = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  text: { fontSize: 10, fontWeight: "700" },
});

// ── Job Card — outside
const GovtJobCard = ({ item, T, isDark, onPress }) => {
  const daysLeft = Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7;

  return (
    <TouchableOpacity
      style={[s.jobCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
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
          <Text style={[s.cardMinistry, { color: item.color }]}>{item.ministry}</Text>
          <View style={s.cardRow}>
            <Ionicons name="business-outline" size={11} color={T.textLight} />
            <Text style={[s.cardDept, { color: T.textLight }]} numberOfLines={1}> {item.department}</Text>
          </View>
        </View>
        <View style={s.cardRight}>
          <Text style={[s.cardSalary, { color: T.green }]}>{item.salary}</Text>
          <View style={s.cardRow}>
            <Ionicons name="location-outline" size={11} color={T.textLight} />
            <Text style={[s.cardDistrict, { color: T.textLight }]}> {item.district}</Text>
          </View>
        </View>
      </View>

      {/* Tags row */}
      <View style={s.tagsRow}>
        <ApplyTypeBadge type={item.applyType} T={T} isDark={isDark} />
        <View style={[s.tag, { backgroundColor: isDark ? "#1E2D40" : "#F3F4F6" }]}>
          <Ionicons name="people-outline" size={10} color={T.textSub} />
          <Text style={[s.tagText, { color: T.textSub }]}> {item.vacancies} vacancies</Text>
        </View>
        <View style={[s.tag, { backgroundColor: isUrgent ? (isDark ? "#2D1A0D" : "#FFF7ED") : (isDark ? "#1E2D40" : "#F3F4F6") }]}>
          <Ionicons name="time-outline" size={10} color={isUrgent ? T.orange : T.textSub} />
          <Text style={[s.tagText, { color: isUrgent ? T.orange : T.textSub }]}>
            {" "}{isUrgent ? `${daysLeft}d left!` : `Closes ${item.deadline}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Detail Modal — outside
const GovtJobModal = ({ job, visible, onClose, T, isDark }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (visible) {
      setApplying(false);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1,  duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0,  tension: 60, friction: 12, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!job) return null;

  const handleGazette = async () => {
    if (!job.gazetteUrl) return;
    Alert.alert(
      "Download Gazette",
      `Download official gazette for:\n${job.title}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download PDF",
          onPress: async () => {
            try {
              await Linking.openURL(job.gazetteUrl);
            } catch {
              Alert.alert("Error", "Could not open gazette PDF.");
            }
          },
        },
      ]
    );
  };

  const handleDirectApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      Alert.alert(
        "Application Submitted ✅",
        `Your application for\n${job.title}\nhas been submitted successfully!`,
        [{ text: "OK", onPress: onClose }]
      );
    }, 1500);
  };

  const daysLeft = Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[s.modalSheet, {
            backgroundColor: T.surface,
            transform: [{ translateY: slideAnim }],
          }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Handle */}
            <View style={[s.modalHandle, { backgroundColor: isDark ? "#2D4060" : "#D1D5DB" }]} />

            {/* Header */}
            <View style={[s.modalHeader, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
              <View style={[s.modalLogo, { backgroundColor: job.color + (isDark ? "22" : "15") }]}>
                <Ionicons name={job.logo} size={30} color={job.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.modalTitle, { color: T.text }]}>{job.title}</Text>
                <Text style={[s.modalMinistry, { color: job.color }]}>{job.ministry}</Text>
                <Text style={[s.modalDept, { color: T.textSub }]}>{job.department}  ·  {job.district}</Text>
              </View>
            </View>

            {/* Info grid */}
            <View style={[s.infoGrid, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
              {[
                { icon: "cash-outline",    label: "Salary",     value: job.salary,              color: T.green   },
                { icon: "people-outline",  label: "Vacancies",  value: `${job.vacancies} posts`, color: T.primary },
                { icon: "ribbon-outline",  label: "Grade",      value: job.grade,                color: T.orange  },
                { icon: "time-outline",    label: "Deadline",   value: job.deadline,             color: daysLeft <= 7 ? T.orange : T.textSub },
              ].map((info, i) => (
                <View key={i} style={s.infoItem}>
                  <Ionicons name={info.icon} size={16} color={info.color} />
                  <Text style={[s.infoLabel, { color: T.textLight }]}>{info.label}</Text>
                  <Text style={[s.infoValue, { color: info.color }]}>{info.value}</Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <Text style={[s.sectionLabel, { color: T.text }]}>About this vacancy</Text>
            <Text style={[s.descText, { color: T.textSub }]}>{job.description}</Text>

            {/* Requirements */}
            <Text style={[s.sectionLabel, { color: T.text }]}>Requirements</Text>
            {job.requirements.map((req, i) => (
              <View key={i} style={s.reqRow}>
                <View style={[s.reqDot, { backgroundColor: job.color }]} />
                <Text style={[s.reqText, { color: T.textSub }]}>{req}</Text>
              </View>
            ))}

            {/* Apply type notice */}
            <View style={[s.noticeBox, { backgroundColor: isDark ? "#0D1525" : "#F8FAFC", borderColor: isDark ? "#1E2D40" : "#E2E8F0" }]}>
              <Ionicons name="information-circle-outline" size={16} color={T.primary} />
              <Text style={[s.noticeText, { color: T.textSub }]}>
                {job.applyType === "direct" && "  This position accepts direct online applications only."}
                {job.applyType === "gazette" && "  This position requires gazette notification. Download PDF and follow instructions."}
                {job.applyType === "both" && "  This position accepts both direct applications and gazette applications."}
              </Text>
            </View>

            {/* ── Action Buttons ── */}
            <View style={s.actionButtons}>

              {/* Gazette Download */}
              {(job.applyType === "gazette" || job.applyType === "both") && (
                <TouchableOpacity
                  style={[s.gazetteBtn, { borderColor: "#D97706", backgroundColor: isDark ? "#1E1A0D" : "#FFFBEB" }]}
                  onPress={handleGazette}
                  activeOpacity={0.8}
                >
                  <Ionicons name="download-outline" size={20} color="#D97706" />
                  <View>
                    <Text style={[s.gazetteBtnTitle, { color: "#D97706" }]}>Download Gazette</Text>
                    <Text style={[s.gazetteBtnSub, { color: isDark ? "#92400E" : "#B45309" }]}>Official PDF notification</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Direct Apply */}
              {(job.applyType === "direct" || job.applyType === "both") && (
                <TouchableOpacity
                  style={[s.applyBtn, { backgroundColor: applying ? T.green + "AA" : T.primary }]}
                  onPress={handleDirectApply}
                  disabled={applying}
                  activeOpacity={0.85}
                >
                  {applying ? (
                    <>
                      <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                      <Text style={s.applyBtnText}>Submitting...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={20} color="#FFFFFF" />
                      <Text style={s.applyBtnText}>Apply Online</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Close */}
            <TouchableOpacity
              style={[s.closeBtn, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
              onPress={onClose}
            >
              <Text style={[s.closeBtnText, { color: T.textSub }]}>Close</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── Filter Sheet — outside
const FilterSheet = ({ visible, onClose, T, isDark, filters, setFilters }) => {
  if (!visible) return null;
  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  const FilterGroup = ({ label, options, key }) => (
    <View style={s.filterGroup}>
      <Text style={[s.filterGroupLabel, { color: T.textSub }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {options.map((opt) => {
          const isActive = filters[key] === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[s.filterChip, {
                backgroundColor: isActive ? T.primary : chipBg,
                borderColor: isActive ? T.primary : chipBorder,
              }]}
              onPress={() => setFilters((prev) => ({ ...prev, [key]: opt }))}
            >
              <Text style={[s.filterChipText, { color: isActive ? "#FFFFFF" : chipColor }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[s.filterPanel, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
      <View style={s.filterPanelHeader}>
        <Text style={[s.filterPanelTitle, { color: T.text }]}>Filters</Text>
        <TouchableOpacity onPress={() => setFilters({ ministry: "All", department: "All", district: "All" })}>
          <Text style={[s.filterReset, { color: T.primary }]}>Reset All</Text>
        </TouchableOpacity>
      </View>
      <FilterGroup label="MINISTRY"   options={MINISTRIES}  key="ministry"   />
      <FilterGroup label="DEPARTMENT" options={DEPARTMENTS} key="department" />
      <FilterGroup label="DISTRICT"   options={DISTRICTS}   key="district"   />
      <TouchableOpacity style={[s.filterDoneBtn, { backgroundColor: T.primary }]} onPress={onClose}>
        <Text style={s.filterDoneBtnText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
export default function GovernmentJobsScreen() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [search,      setSearch]      = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [showFilter,  setShowFilter]  = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyType,   setApplyType]   = useState("All"); // All | direct | gazette | both
  const [filters, setFilters] = useState({ ministry: "All", department: "All", district: "All" });

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filtered = GOVT_JOBS.filter((j) => {
    const matchSearch  = j.title.toLowerCase().includes(search.toLowerCase()) ||
                         j.ministry.toLowerCase().includes(search.toLowerCase()) ||
                         j.department.toLowerCase().includes(search.toLowerCase());
    const matchMin     = filters.ministry   === "All" || j.ministry   === filters.ministry;
    const matchDept    = filters.department === "All" || j.department === filters.department;
    const matchDist    = filters.district   === "All" || j.district   === filters.district || j.district === "All Island";
    const matchType    = applyType === "All" || j.applyType === applyType;
    return matchSearch && matchMin && matchDept && matchDist && matchType;
  });

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "All").length;
  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      {/* ── HEADER ── */}
      <Animated.View style={[s.header, { backgroundColor: T.bg, opacity: headerFade }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={T.text} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <View style={s.headerTitleRow}>
            <Ionicons name="business" size={20} color={T.primary} />
            <Text style={[s.headerTitle, { color: T.text }]}> Government Jobs</Text>
          </View>
          <Text style={[s.headerSub, { color: T.textSub }]}>{filtered.length} vacancies found</Text>
        </View>

        <View style={s.headerRight}>
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
            onPress={toggleTheme}
          >
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={17} color={isDark ? "#F59E0B" : T.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── SEARCH + FILTER ── */}
      <View style={s.searchRow}>
        <View style={[s.searchBox, { backgroundColor: T.surface, borderColor: searchFocus ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB") }]}>
          <Ionicons name="search-outline" size={17} color={searchFocus ? T.primary : T.textLight} />
          <TextInput
            style={[s.searchInput, { color: T.text }]}
            placeholder="Search vacancies, ministries..."
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

        <TouchableOpacity
          style={[s.filterBtn, {
            backgroundColor: showFilter || activeFiltersCount > 0 ? T.primary : T.surface,
            borderColor: showFilter || activeFiltersCount > 0 ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
          }]}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Ionicons name="options-outline" size={19} color={showFilter || activeFiltersCount > 0 ? "#FFFFFF" : T.text} />
          {activeFiltersCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── FILTER PANEL ── */}
      {showFilter && (
        <FilterSheet
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          T={T} isDark={isDark}
          filters={filters}
          setFilters={setFilters}
        />
      )}

      {/* ── APPLY TYPE TABS ── */}
      <View style={[s.typeTabRow, { height: 50 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeTabScroll}>
          {[
            { id: "All",     label: "All",           icon: "apps-outline"          },
            { id: "direct",  label: "Direct Apply",  icon: "globe-outline"         },
            { id: "gazette", label: "Gazette",        icon: "document-text-outline" },
            { id: "both",    label: "Both Options",  icon: "layers-outline"        },
          ].map((tab) => {
            const isActive = applyType === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[s.typeTab, {
                  backgroundColor: isActive ? T.primary : chipBg,
                  borderColor: isActive ? T.primary : chipBorder,
                }]}
                onPress={() => setApplyType(tab.id)}
              >
                <Ionicons name={tab.icon} size={13} color={isActive ? "#FFFFFF" : chipColor} />
                <Text style={[s.typeTabText, { color: isActive ? "#FFFFFF" : chipColor }]}> {tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── JOB LIST ── */}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="business-outline" size={48} color={isDark ? "#1E2D40" : "#E5E7EB"} />
            <Text style={[s.emptyTitle, { color: T.text }]}>No vacancies found</Text>
            <Text style={[s.emptySub, { color: T.textSub }]}>Try different filters</Text>
          </View>
        ) : (
          filtered.map((job) => (
            <GovtJobCard
              key={job.id}
              item={job}
              T={T}
              isDark={isDark}
              onPress={() => setSelectedJob(job)}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── DETAIL + APPLY MODAL ── */}
      <GovtJobModal
        job={selectedJob}
        visible={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        T={T}
        isDark={isDark}
      />
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
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },

  searchRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8, gap: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 46, gap: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, height: 46, paddingVertical: 0 },
  filterBtn: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1.5, elevation: 2, position: "relative" },
  filterBadge: { position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  filterBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },

  filterPanel: { marginHorizontal: 16, borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 8, elevation: 4 },
  filterPanelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  filterPanelTitle: { fontSize: 15, fontWeight: "700" },
  filterReset: { fontSize: 13, fontWeight: "600" },
  filterGroup: { marginBottom: 10 },
  filterGroupLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  filterChip: { height: 32, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  filterChipText: { fontSize: 12, fontWeight: "600" },
  filterDoneBtn: { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 6 },
  filterDoneBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  typeTabRow: { justifyContent: "center" },
  typeTabScroll: { paddingHorizontal: 16, alignItems: "center", gap: 8 },
  typeTab: { flexDirection: "row", alignItems: "center", height: 34, paddingHorizontal: 13, borderRadius: 17, borderWidth: 1.5 },
  typeTabText: { fontSize: 12, fontWeight: "600" },

  jobCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 16, borderWidth: 1, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  logoBox: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardMeta: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2, lineHeight: 20 },
  cardMinistry: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  cardDept: { fontSize: 11, flex: 1 },
  cardRight: { alignItems: "flex-end", gap: 4 },
  cardSalary: { fontSize: 11, fontWeight: "700" },
  cardDistrict: { fontSize: 11 },
  tagsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: "600" },

  emptyBox: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: height * 0.9, elevation: 30 },
  modalHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", gap: 14, borderBottomWidth: 1, paddingBottom: 16, marginBottom: 16 },
  modalLogo: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 3, lineHeight: 22 },
  modalMinistry: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  modalDept: { fontSize: 12 },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 12, marginBottom: 16, gap: 8 },
  infoItem: { width: (width - 80) / 2, alignItems: "center", paddingVertical: 8, gap: 4 },
  infoLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
  infoValue: { fontSize: 12, fontWeight: "700", textAlign: "center" },

  sectionLabel: { fontSize: 14, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  descText: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  reqRow: { flexDirection: "row", alignItems: "center", marginBottom: 7, gap: 8 },
  reqDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  reqText: { fontSize: 13, flex: 1 },

  noticeBox: { flexDirection: "row", alignItems: "flex-start", borderRadius: 12, padding: 12, marginVertical: 12, borderWidth: 1 },
  noticeText: { fontSize: 12, flex: 1, lineHeight: 18 },

  actionButtons: { gap: 12, marginTop: 4 },
  gazetteBtn: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 16, borderWidth: 2, gap: 14 },
  gazetteBtnTitle: { fontSize: 15, fontWeight: "700" },
  gazetteBtnSub: { fontSize: 12, marginTop: 2 },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 14, gap: 10, elevation: 4 },
  applyBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  closeBtn: { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 12, borderWidth: 1 },
  closeBtnText: { fontSize: 14, fontWeight: "600" },
});
