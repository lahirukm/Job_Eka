import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, Modal, FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const JOBS = [
  { id: "1",  title: "Software Engineer",      company: "ABC Solutions",     logo: "laptop-outline",        salary: "LKR 120,000", location: "Colombo 3",   type: "Full Time",   level: "Mid",    category: "IT",        posted: "2h ago",   urgent: false, description: "We are looking for a skilled Software Engineer to join our team. You will be responsible for developing and maintaining web applications.", requirements: ["3+ years React/Node.js", "Strong problem solving", "Team player"] },
  { id: "2",  title: "UI/UX Designer",          company: "Creative Studio",   logo: "color-palette-outline", salary: "LKR 95,000",  location: "Colombo 7",   type: "Full Time",   level: "Senior", category: "Design",    posted: "5h ago",   urgent: true,  description: "Join our creative team as a UI/UX Designer. You will design beautiful interfaces for our clients.", requirements: ["Figma expert", "5+ years experience", "Portfolio required"] },
  { id: "3",  title: "Marketing Manager",       company: "BrandX Lanka",      logo: "megaphone-outline",     salary: "LKR 85,000",  location: "Nugegoda",    type: "Full Time",   level: "Senior", category: "Marketing", posted: "1d ago",   urgent: false, description: "Lead our marketing department and drive brand growth across digital and traditional channels.", requirements: ["5+ years marketing", "Digital marketing skills", "Team management"] },
  { id: "4",  title: "Data Analyst",            company: "FinServe Lanka",    logo: "analytics-outline",     salary: "LKR 110,000", location: "Colombo 1",   type: "Full Time",   level: "Mid",    category: "IT",        posted: "3h ago",   urgent: false, description: "Analyze complex data sets and provide actionable insights to drive business decisions.", requirements: ["Python/R skills", "SQL expertise", "Statistics background"] },
  { id: "5",  title: "HR Manager",              company: "PeoplePlus LK",     logo: "people-outline",        salary: "LKR 75,000",  location: "Colombo 5",   type: "Full Time",   level: "Senior", category: "HR",        posted: "2d ago",   urgent: false, description: "Manage all HR operations including recruitment, training, and employee relations.", requirements: ["HR degree", "5+ years HR experience", "HRIS knowledge"] },
  { id: "6",  title: "DevOps Engineer",         company: "TechPark LK",       logo: "server-outline",        salary: "LKR 145,000", location: "Malabe",      type: "Full Time",   level: "Senior", category: "IT",        posted: "6h ago",   urgent: true,  description: "Build and maintain our cloud infrastructure and CI/CD pipelines.", requirements: ["AWS/GCP experience", "Docker/Kubernetes", "Linux expertise"] },
  { id: "7",  title: "Accountant",              company: "Deloitte Lanka",    logo: "card-outline",          salary: "LKR 90,000",  location: "Colombo 3",   type: "Full Time",   level: "Mid",    category: "Finance",   posted: "1d ago",   urgent: false, description: "Handle financial reporting, tax compliance, and accounting operations.", requirements: ["CA/CIMA qualified", "3+ years experience", "SAP knowledge"] },
  { id: "8",  title: "React Native Developer",  company: "AppFactory LK",     logo: "phone-portrait-outline",salary: "LKR 130,000", location: "Remote",      type: "Full Time",   level: "Mid",    category: "IT",        posted: "4h ago",   urgent: true,  description: "Develop cross-platform mobile applications using React Native.", requirements: ["React Native expert", "3+ years mobile dev", "Published apps"] },
  { id: "9",  title: "Sales Executive",         company: "InsureCo Lanka",    logo: "briefcase-outline",     salary: "LKR 65,000",  location: "Kandy",       type: "Full Time",   level: "Junior", category: "Sales",     posted: "3d ago",   urgent: false, description: "Drive sales growth through client acquisition and relationship management.", requirements: ["Sales experience", "Good communication", "Valid license"] },
  { id: "10", title: "Project Manager",         company: "BuildTech Lanka",   logo: "clipboard-outline",     salary: "LKR 155,000", location: "Colombo 2",   type: "Full Time",   level: "Senior", category: "Management",posted: "8h ago",   urgent: false, description: "Lead complex construction and engineering projects from inception to completion.", requirements: ["PMP certified", "10+ years experience", "Civil engineering degree"] },
];

const CATEGORIES = ["All", "IT", "Design", "Marketing", "Finance", "HR", "Sales", "Management"];
const LEVELS      = ["All Levels", "Junior", "Mid", "Senior"];
const SORT_OPTIONS = ["Latest", "Salary: High to Low", "Salary: Low to High"];

// ── Category color map
const CAT_COLOR = {
  IT:         { color: "#2563EB", bg: "#EEF2FF" },
  Design:     { color: "#7C3AED", bg: "#F5F3FF" },
  Marketing:  { color: "#EA580C", bg: "#FFF7ED" },
  Finance:    { color: "#059669", bg: "#ECFDF5" },
  HR:         { color: "#DB2777", bg: "#FDF2F8" },
  Sales:      { color: "#D97706", bg: "#FFFBEB" },
  Management: { color: "#0284C7", bg: "#F0F9FF" },
};

// ── Job Card — outside
const JobCard = ({ item, T, isDark, onPress }) => {
  const cat   = CAT_COLOR[item.category] || { color: T.primary, bg: T.primaryBg };
  const chipBg = isDark ? cat.color + "22" : cat.bg;
  return (
    <TouchableOpacity
      style={[s.jobCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top row */}
      <View style={s.cardTop}>
        <View style={[s.logoBox, { backgroundColor: chipBg }]}>
          <Ionicons name={item.logo} size={24} color={cat.color} />
        </View>
        <View style={s.cardMeta}>
          <Text style={[s.cardTitle, { color: T.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[s.cardCompany, { color: T.textSub }]}>{item.company}</Text>
          <View style={s.cardRow}>
            <Ionicons name="location-outline" size={11} color={T.textLight} />
            <Text style={[s.cardLocation, { color: T.textLight }]}> {item.location}</Text>
          </View>
        </View>
        <View style={s.cardRight}>
          {item.urgent && (
            <View style={[s.urgentDot, { backgroundColor: isDark ? "#2D1A0D" : "#FFF7ED" }]}>
              <Text style={{ color: T.orange, fontSize: 9, fontWeight: "700" }}>URGENT</Text>
            </View>
          )}
          <Text style={[s.cardSalary, { color: T.green }]}>{item.salary}</Text>
          <Text style={[s.cardPosted, { color: T.textLight }]}>{item.posted}</Text>
        </View>
      </View>

      {/* Tags */}
      <View style={s.tagsRow}>
        <View style={[s.tag, { backgroundColor: chipBg }]}>
          <Text style={[s.tagText, { color: cat.color }]}>{item.category}</Text>
        </View>
        <View style={[s.tag, { backgroundColor: isDark ? "#1E2D40" : "#F3F4F6" }]}>
          <Text style={[s.tagText, { color: T.textSub }]}>{item.level}</Text>
        </View>
        <View style={[s.tag, { backgroundColor: isDark ? "#1E2D40" : "#F3F4F6" }]}>
          <Text style={[s.tagText, { color: T.textSub }]}>{item.type}</Text>
        </View>
        <TouchableOpacity style={[s.applySmallBtn, { backgroundColor: T.primary }]} onPress={onPress}>
          <Text style={s.applySmallText}>Apply</Text>
          <Ionicons name="arrow-forward" size={11} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ── Apply Modal — outside
const ApplyModal = ({ job, visible, onClose, T, isDark }) => {
  const [step,     setStep]     = useState(1); // 1=confirm, 2=cv select, 3=success
  const [cvChoice, setCvChoice] = useState(null);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep(1); setCvChoice(null);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleApply = () => {
    if (!cvChoice) return;
    setStep(3);
  };

  if (!job) return null;
  const cat = CAT_COLOR[job.category] || { color: T.primary, bg: T.primaryBg };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <Animated.View style={[s.modalSheet, {
          backgroundColor: T.surface,
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }]}>
          {/* Handle */}
          <View style={[s.modalHandle, { backgroundColor: isDark ? "#2D4060" : "#D1D5DB" }]} />

          {step === 3 ? (
            // ── Success
            <View style={s.successBox}>
              <View style={[s.successIcon, { backgroundColor: T.greenBg }]}>
                <Ionicons name="checkmark-circle" size={56} color={T.green} />
              </View>
              <Text style={[s.successTitle, { color: T.text }]}>Application Sent! 🎉</Text>
              <Text style={[s.successSub, { color: T.textSub }]}>
                Your CV has been sent to {job.company}.{"\n"}They will contact you soon!
              </Text>
              <TouchableOpacity style={[s.doneBtn, { backgroundColor: T.primary }]} onPress={onClose}>
                <Text style={s.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Job summary */}
              <View style={[s.modalJobRow, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
                <View style={[s.modalLogo, { backgroundColor: isDark ? cat.color + "22" : cat.bg }]}>
                  <Ionicons name={job.logo} size={26} color={cat.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.modalJobTitle, { color: T.text }]}>{job.title}</Text>
                  <Text style={[s.modalJobCompany, { color: T.textSub }]}>{job.company}  ·  {job.location}</Text>
                  <Text style={[s.modalJobSalary, { color: T.green }]}>{job.salary} / month</Text>
                </View>
              </View>

              {step === 1 && (
                <>
                  {/* Description */}
                  <Text style={[s.modalSectionLabel, { color: T.text }]}>About this role</Text>
                  <Text style={[s.modalDesc, { color: T.textSub }]}>{job.description}</Text>

                  <Text style={[s.modalSectionLabel, { color: T.text }]}>Requirements</Text>
                  {job.requirements.map((req, i) => (
                    <View key={i} style={s.reqRow}>
                      <Ionicons name="checkmark-circle" size={14} color={T.green} />
                      <Text style={[s.reqText, { color: T.textSub }]}> {req}</Text>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[s.nextBtn, { backgroundColor: T.primary }]}
                    onPress={() => setStep(2)}
                  >
                    <Text style={s.nextBtnText}>Apply Now</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={[s.modalSectionLabel, { color: T.text }]}>Select CV to send</Text>

                  {/* CV options */}
                  {[
                    { id: "ai",       label: "AI Generated CV",    sub: "Auto-created from your profile",   icon: "sparkles-outline"       },
                    { id: "uploaded", label: "Uploaded CV",         sub: "Your existing PDF/Word CV",        icon: "document-text-outline"  },
                    { id: "quick",    label: "Quick Profile",       sub: "Send profile summary only",        icon: "person-circle-outline"  },
                  ].map((cv) => (
                    <TouchableOpacity
                      key={cv.id}
                      style={[s.cvOption, {
                        backgroundColor: cvChoice === cv.id
                          ? (isDark ? T.primaryBg : "#EEF2FF")
                          : (isDark ? "#0D1525" : "#F9FAFB"),
                        borderColor: cvChoice === cv.id ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
                      }]}
                      onPress={() => setCvChoice(cv.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[s.cvIconBox, {
                        backgroundColor: cvChoice === cv.id ? T.primary : (isDark ? "#1E2D40" : "#F3F4F6"),
                      }]}>
                        <Ionicons name={cv.icon} size={20} color={cvChoice === cv.id ? "#FFFFFF" : T.textSub} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.cvLabel, { color: T.text }]}>{cv.label}</Text>
                        <Text style={[s.cvSub, { color: T.textSub }]}>{cv.sub}</Text>
                      </View>
                      {cvChoice === cv.id && (
                        <Ionicons name="checkmark-circle" size={20} color={T.primary} />
                      )}
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[s.nextBtn, { backgroundColor: cvChoice ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"), opacity: cvChoice ? 1 : 0.6 }]}
                    onPress={handleApply}
                    disabled={!cvChoice}
                  >
                    <Text style={[s.nextBtnText, { color: cvChoice ? "#FFFFFF" : T.textSub }]}>Send Application</Text>
                    <Ionicons name="send-outline" size={16} color={cvChoice ? "#FFFFFF" : T.textSub} />
                  </TouchableOpacity>
                </>
              )}

              {/* Close */}
              <TouchableOpacity style={[s.closeBtn, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={onClose}>
                <Text style={[s.closeBtnText, { color: T.textSub }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
export default function FullTimeJobsScreen() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [search,         setSearch]         = useState("");
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel,    setActiveLevel]    = useState("All Levels");
  const [sortBy,         setSortBy]         = useState("Latest");
  const [showFilters,    setShowFilters]    = useState(false);
  const [selectedJob,    setSelectedJob]    = useState(null);
  const [showApply,      setShowApply]      = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  // Filter + sort
  let filtered = JOBS.filter((j) => {
    const matchCat    = activeCategory === "All" || j.category === activeCategory;
    const matchLevel  = activeLevel === "All Levels" || j.level === activeLevel;
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                        j.company.toLowerCase().includes(search.toLowerCase()) ||
                        j.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  if (sortBy === "Salary: High to Low") {
    filtered = [...filtered].sort((a, b) =>
      parseInt(b.salary.replace(/[^0-9]/g, "")) - parseInt(a.salary.replace(/[^0-9]/g, ""))
    );
  } else if (sortBy === "Salary: Low to High") {
    filtered = [...filtered].sort((a, b) =>
      parseInt(a.salary.replace(/[^0-9]/g, "")) - parseInt(b.salary.replace(/[^0-9]/g, ""))
    );
  }

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      {/* ── HEADER ── */}
      <Animated.View style={[s.header, { backgroundColor: T.bg, opacity: headerFade }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={T.text} />
        </TouchableOpacity>
        <View>
          <Text style={[s.headerTitle, { color: T.text }]}>Full Time Jobs</Text>
          <Text style={[s.headerSub, { color: T.textSub }]}>{filtered.length} positions available</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={isDark ? "#F59E0B" : T.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            <Ionicons name="notifications-outline" size={18} color={T.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── SEARCH + FILTER ── */}
      <View style={s.searchRow}>
        <View style={[s.searchBox, { backgroundColor: T.surface, borderColor: searchFocused ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB") }]}>
          <Ionicons name="search-outline" size={18} color={searchFocused ? T.primary : T.textLight} />
          <TextInput
            style={[s.searchInput, { color: T.text }]}
            placeholder="Search jobs, companies..."
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
        <TouchableOpacity
          style={[s.filterBtn, { backgroundColor: showFilters ? T.primary : T.surface, borderColor: showFilters ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB") }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? "#FFFFFF" : T.text} />
        </TouchableOpacity>
      </View>

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <View style={[s.filterPanel, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
          {/* Level filter */}
          <Text style={[s.filterLabel, { color: T.textSub }]}>EXPERIENCE LEVEL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterChipsRow}>
            {LEVELS.map((lvl) => {
              const isActive = activeLevel === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  style={[s.filterChip, { backgroundColor: isActive ? T.primary : chipBg, borderColor: isActive ? T.primary : chipBorder }]}
                  onPress={() => setActiveLevel(lvl)}
                >
                  <Text style={[s.filterChipText, { color: isActive ? "#FFFFFF" : chipColor }]}>{lvl}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort */}
          <Text style={[s.filterLabel, { color: T.textSub, marginTop: 10 }]}>SORT BY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterChipsRow}>
            {SORT_OPTIONS.map((opt) => {
              const isActive = sortBy === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[s.filterChip, { backgroundColor: isActive ? T.primary : chipBg, borderColor: isActive ? T.primary : chipBorder }]}
                  onPress={() => setSortBy(opt)}
                >
                  <Text style={[s.filterChipText, { color: isActive ? "#FFFFFF" : chipColor }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── CATEGORY CHIPS ── */}
      <View style={[s.catRow, { height: 54 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const catStyle = CAT_COLOR[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[s.catChip, {
                  backgroundColor: isActive ? (catStyle?.color || T.primary) : chipBg,
                  borderColor:     isActive ? (catStyle?.color || T.primary) : chipBorder,
                }]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[s.catChipText, { color: isActive ? "#FFFFFF" : chipColor }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── JOB LIST ── */}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="briefcase-outline" size={48} color={isDark ? "#1E2D40" : "#E5E7EB"} />
            <Text style={[s.emptyTitle, { color: T.text }]}>No jobs found</Text>
            <Text style={[s.emptySub, { color: T.textSub }]}>Try different filters or search terms</Text>
          </View>
        ) : (
          filtered.map((job) => (
            <JobCard
              key={job.id}
              item={job}
              T={T}
              isDark={isDark}
              onPress={() => { setSelectedJob(job); setShowApply(true); }}
            />
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ── APPLY MODAL ── */}
      <ApplyModal
        job={selectedJob}
        visible={showApply}
        onClose={() => setShowApply(false)}
        T={T}
        isDark={isDark}
      />
    </View>
  );
}

// ─────────────────────────── STYLES ───────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 1 },
  headerRight: { flex: 1, flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },

  // Search
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 10, gap: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 46, gap: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, height: 46, paddingVertical: 0 },
  filterBtn: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1.5, elevation: 2 },

  // Filter panel
  filterPanel: { marginHorizontal: 16, borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 10, elevation: 3 },
  filterLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  filterChipsRow: { gap: 8, paddingBottom: 4 },
  filterChip: { height: 32, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  filterChipText: { fontSize: 12, fontWeight: "600" },

  // Category chips
  catRow: { justifyContent: "center" },
  catScroll: { paddingHorizontal: 16, alignItems: "center", gap: 8 },
  catChip: { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  catChipText: { fontSize: 13, fontWeight: "600" },

  // Job card
  jobCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 16, borderWidth: 1, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  logoBox: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardMeta: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  cardCompany: { fontSize: 12, marginBottom: 3 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  cardLocation: { fontSize: 11 },
  cardRight: { alignItems: "flex-end", gap: 3 },
  urgentDot: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  cardSalary: { fontSize: 13, fontWeight: "700" },
  cardPosted: { fontSize: 10 },
  tagsRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: "600" },
  applySmallBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, gap: 4, marginLeft: "auto" },
  applySmallText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  // Empty
  emptyBox: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: height * 0.88, elevation: 30 },
  modalHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalJobRow: { flexDirection: "row", alignItems: "center", gap: 14, borderBottomWidth: 1, paddingBottom: 16, marginBottom: 16 },
  modalLogo: { width: 52, height: 52, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  modalJobTitle: { fontSize: 16, fontWeight: "800", marginBottom: 3 },
  modalJobCompany: { fontSize: 13, marginBottom: 3 },
  modalJobSalary: { fontSize: 14, fontWeight: "700" },
  modalSectionLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  modalDesc: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  reqRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  reqText: { fontSize: 13 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 14, marginTop: 16, gap: 8 },
  nextBtnText: { fontSize: 15, fontWeight: "700" },
  closeBtn: { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 10, borderWidth: 1 },
  closeBtnText: { fontSize: 14, fontWeight: "600" },

  // CV options
  cvOption: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1.5, marginBottom: 10, gap: 12 },
  cvIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cvLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  cvSub: { fontSize: 12 },

  // Success
  successBox: { alignItems: "center", paddingVertical: 24, gap: 12 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontWeight: "800" },
  successSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  doneBtn: { height: 50, paddingHorizontal: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  doneBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
