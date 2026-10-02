import { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, Alert, Modal, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { applyJob } from "../services/jobsApi";

const { width, height } = Dimensions.get("window");

export default function JobDetailScreen() {
  const { theme: T, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse job data passed as params
  const job = params.job ? JSON.parse(params.job) : {};

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: "", phone: "", message: "",
  });
  const [applying, setApplying] = useState(false);
  const [applied,  setApplied]  = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Auto-load customer profile from AsyncStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const name  = await AsyncStorage.getItem("customer_name");
        const phone = await AsyncStorage.getItem("customer_phone");
        setApplyForm((p) => ({
          ...p,
          name:  name  || "",
          phone: phone || "",
        }));
      } catch (_) {}
    };
    loadProfile();
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleApply = async () => {
    if (!applyForm.name || !applyForm.phone) {
      Alert.alert("Missing Info", "Please enter your name and phone number.");
      return;
    }
    setApplying(true);
    try {
      // Call API — marks job as CLOSED in MongoDB
      await applyJob(job._id, {
        name:    applyForm.name,
        phone:   applyForm.phone,
        message: applyForm.message,
      });
      setApplying(false);
      setApplied(true);
      setShowApplyModal(false);

      // Navigate to tracking screen
      setTimeout(() => {
        router.push({
          pathname: "/job-tracking",
          params: {
            job:      JSON.stringify({ ...job, status: "closed" }),
            customer: JSON.stringify(applyForm),
          },
        });
      }, 1500);
    } catch (err) {
      setApplying(false);
      Alert.alert("Apply Failed", err.message || "Something went wrong.");
    }
  };

  const INFO_ITEMS = [
    { icon: "cash-outline",         label: "Salary",         value: job.salary        || "Not specified",  color: T.green   },
    { icon: "time-outline",         label: "Working Hours",  value: job.working_hours  || "Not specified",  color: T.primary },
    { icon: "location-outline",     label: "Location",       value: job.location       || "Not specified",  color: T.orange  },
    { icon: "briefcase-outline",    label: "Job Type",       value: job.type           || "Part Time",      color: T.purple  },
    { icon: "list-outline",         label: "Category",       value: job.category       || "General",        color: "#0284C7" },
  ];

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: T.bg }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={T.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: T.text }]}>Job Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero card */}
        <Animated.View style={[s.heroCard, {
          backgroundColor: T.primary,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <View style={s.heroIcon}>
            <Ionicons name="briefcase" size={36} color="#FFFFFF" />
          </View>
          <Text style={s.heroTitle}>{job.title || "Job Title"}</Text>
          <Text style={s.heroLocation}>{job.location || "Location"}</Text>
          <View style={s.heroBadge}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={s.heroBadgeText}> Active</Text>
          </View>
        </Animated.View>

        {/* Info grid */}
        <View style={s.infoGrid}>
          {INFO_ITEMS.map((item, i) => (
            <View key={i} style={[s.infoCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
              <View style={[s.infoIcon, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[s.infoLabel, { color: T.textSub }]}>{item.label}</Text>
              <Text style={[s.infoValue, { color: T.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {job.description ? (
          <View style={[s.section, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            <Text style={[s.sectionTitle, { color: T.text }]}>📋 Job Description</Text>
            <Text style={[s.sectionBody, { color: T.textSub }]}>{job.description}</Text>
          </View>
        ) : null}

        {/* Requirements */}
        {job.requirements ? (
          <View style={[s.section, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            <Text style={[s.sectionTitle, { color: T.text }]}>✅ Requirements</Text>
            <Text style={[s.sectionBody, { color: T.textSub }]}>{job.requirements}</Text>
          </View>
        ) : null}

        {/* Working hours highlight */}
        {job.working_hours ? (
          <View style={[s.hoursCard, { backgroundColor: isDark ? "#0D1A35" : "#EEF2FF", borderColor: T.primary + "44" }]}>
            <Ionicons name="time" size={24} color={T.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.hoursLabel, { color: T.textSub }]}>Working Hours</Text>
              <Text style={[s.hoursValue, { color: T.primary }]}>{job.working_hours}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Apply bar — fixed bottom */}
      <View style={[s.applyBar, {
        backgroundColor: T.surface,
        borderTopColor: isDark ? "#1E2D40" : "#E5E7EB",
      }]}>
        {applied ? (
          <View style={[s.appliedBox, { backgroundColor: isDark ? "#0D2518" : "#ECFDF5" }]}>
            <Ionicons name="checkmark-circle" size={22} color="#059669" />
            <Text style={s.appliedText}>Application Sent! Redirecting...</Text>
          </View>
        ) : job.status === "closed" ? (
          // ── Job is closed — no more applications
          <View style={[s.closedBox, { backgroundColor: isDark ? "#2D0D0D" : "#FFF5F5" }]}>
            <Ionicons name="lock-closed" size={22} color="#EF4444" />
            <View>
              <Text style={s.closedTitle}>Job Closed</Text>
              <Text style={[s.closedSub, { color: T.textSub }]}>This position has been filled</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={s.salaryPreview}>
              <Text style={[s.salaryPreviewLabel, { color: T.textSub }]}>Salary</Text>
              <Text style={[s.salaryPreviewValue, { color: T.green }]}>{job.salary}</Text>
            </View>
            <TouchableOpacity
              style={[s.applyBtn, { backgroundColor: T.primary }]}
              onPress={() => setShowApplyModal(true)}
            >
              <Ionicons name="send-outline" size={18} color="#FFFFFF" />
              <Text style={s.applyBtnText}> Apply Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Apply Modal */}
      <Modal visible={showApplyModal} transparent animationType="slide" onRequestClose={() => setShowApplyModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: T.surface }]}>
            <View style={[s.modalHandle, { backgroundColor: isDark ? "#2D4060" : "#D1D5DB" }]} />
            <Text style={[s.modalTitle, { color: T.text }]}>📝 Apply for Job</Text>
            <Text style={[s.modalSub, { color: T.textSub }]}>
              {job.title} · {job.location}
            </Text>

            {/* ── Auto-filled applicant info ── */}
            <View style={[s.autoFilledBox, {
              backgroundColor: isDark ? "#0D1A35" : "#EEF2FF",
              borderColor: isDark ? "#1E2D40" : "#BFDBFE",
            }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: T.primary, letterSpacing: 0.6, marginBottom: 10 }}>
                  YOUR APPLICATION INFO
                </Text>

                {/* Name row */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: T.primaryBg, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="person-outline" size={16} color={T.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: T.textLight, fontWeight: "600" }}>NAME</Text>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: T.text }}>
                      {applyForm.name || "—"}
                    </Text>
                  </View>
                </View>

                {/* Phone row */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: T.primaryBg, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="call-outline" size={16} color={T.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: T.textLight, fontWeight: "600" }}>PHONE</Text>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: applyForm.phone ? T.primary : "#EF4444" }}>
                      {applyForm.phone || "⚠️ No phone — add in Profile!"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                <Ionicons name="checkmark-circle" size={22} color="#059669" />
              </View>
            </View>

            {/* Message optional */}
            <Text style={[s.inputLabel, { color: T.textSub }]}>MESSAGE (OPTIONAL)</Text>
            <View style={[s.inputBox, { backgroundColor: isDark ? "#0D1525" : "#F9FAFB", borderColor: isDark ? "#1E2D40" : "#E5E7EB", height: 80 }]}>
              <TextInput
                style={[s.input, { color: T.text, height: 80, textAlignVertical: "top", paddingVertical: 10 }]}
                placeholder="Brief intro about yourself..."
                placeholderTextColor={T.textLight}
                value={applyForm.message}
                onChangeText={(v) => setApplyForm((p) => ({ ...p, message: v }))}
                multiline
                underlineColorAndroid="transparent"
                collapsable={false}
              />
            </View>

            <TouchableOpacity
              style={[s.confirmBtn, { backgroundColor: applying ? T.primary + "99" : T.primary }]}
              onPress={handleApply}
              disabled={applying}
            >
              {applying
                ? <><Ionicons name="hourglass-outline" size={18} color="#FFFFFF" /><Text style={s.confirmBtnText}> Sending...</Text></>
                : <><Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" /><Text style={s.confirmBtnText}> Confirm Application</Text></>
              }
            </TouchableOpacity>

            <TouchableOpacity style={[s.cancelBtn, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => setShowApplyModal(false)}>
              <Text style={[s.cancelBtnText, { color: T.textSub }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  header:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: "800" },

  heroCard:    { margin: 16, borderRadius: 22, padding: 24, alignItems: "center", gap: 8, elevation: 6 },
  heroIcon:    { width: 70, height: 70, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle:   { fontSize: 22, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  heroLocation:{ fontSize: 13, color: "rgba(255,255,255,0.8)" },
  heroBadge:   { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  heroBadgeText:{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10, marginBottom: 10 },
  infoCard: { width: (width - 44) / 2, borderRadius: 16, padding: 14, borderWidth: 1, gap: 6, elevation: 2 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoLabel:{ fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  infoValue:{ fontSize: 13, fontWeight: "700", lineHeight: 18 },

  section:      { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  sectionBody:  { fontSize: 13, lineHeight: 22 },

  hoursCard:  { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1.5, gap: 14 },
  hoursLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 3 },
  hoursValue: { fontSize: 16, fontWeight: "800" },

  applyBar:   { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, borderTopWidth: 1, elevation: 10, gap: 12 },
  salaryPreview:      { flex: 1 },
  salaryPreviewLabel: { fontSize: 11, fontWeight: "600" },
  salaryPreviewValue: { fontSize: 18, fontWeight: "800" },
  applyBtn:     { flexDirection: "row", alignItems: "center", backgroundColor: "#2563EB", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, gap: 8, elevation: 4 },
  applyBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  appliedBox:   { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 14, gap: 10 },
  appliedText:  { color: "#059669", fontSize: 14, fontWeight: "700" },
  closedBox:    { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14 },
  closedTitle:  { color: "#EF4444", fontSize: 15, fontWeight: "800" },
  closedSub:    { fontSize: 12, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 32, elevation: 30 },
  modalHandle:  { width: 40, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalTitle:   { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalSub:     { fontSize: 13, marginBottom: 20 },
  inputLabel:    { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  inputBox:      { borderRadius: 12, borderWidth: 1.5, height: 48, paddingHorizontal: 14, justifyContent: "center", marginBottom: 14 },
  input:         { fontSize: 14, height: 48 },
  autoFilledBox: { flexDirection: "row", alignItems: "flex-start", borderRadius: 14, padding: 14, borderWidth: 1.5, marginBottom: 16 },
  confirmBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 14, gap: 8, elevation: 4, marginTop: 4 },
  confirmBtnText:{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  cancelBtn:    { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 10, borderWidth: 1 },
  cancelBtnText:{ fontSize: 14, fontWeight: "600" },
});
