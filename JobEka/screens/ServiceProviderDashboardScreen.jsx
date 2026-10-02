import { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, Modal, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const SAMPLE_SERVICES = [
  { id: "1", title: "House Cleaning",      category: "Cleaning",  rate: "LKR 2,500/day",  area: "Colombo",   bookings: 12, rating: 4.8, status: "active"   },
  { id: "2", title: "Garden Maintenance",  category: "Gardening", rate: "LKR 1,800/day",  area: "Nugegoda",  bookings: 8,  rating: 4.6, status: "active"   },
  { id: "3", title: "Plumbing Repairs",    category: "Repairs",   rate: "LKR 3,500/visit",area: "Colombo",   bookings: 5,  rating: 4.9, status: "active"   },
  { id: "4", title: "AC Servicing",        category: "Repairs",   rate: "LKR 2,000/visit",area: "All Areas", bookings: 3,  rating: 4.7, status: "paused"   },
];

const SAMPLE_REQUESTS = [
  { id: "1", client: "Kamal Perera",   service: "House Cleaning",    date: "2025-06-10", time: "09:00 AM", status: "pending",   area: "Colombo 5"  },
  { id: "2", client: "Nimal Silva",    service: "Garden Maintenance", date: "2025-06-11", time: "08:00 AM", status: "confirmed", area: "Nugegoda"   },
  { id: "3", client: "Amali Fernando", service: "Plumbing Repairs",   date: "2025-06-09", time: "02:00 PM", status: "completed", area: "Colombo 7"  },
  { id: "4", client: "Sunil Bandara",  service: "House Cleaning",    date: "2025-06-12", time: "10:00 AM", status: "pending",   area: "Maharagama" },
];

const SERVICE_CATEGORIES = ["Cleaning", "Gardening", "Repairs", "Electrical", "Plumbing", "Painting", "Security", "Delivery"];
const STATUS_COLOR = { active: "#059669", paused: "#D97706", pending: "#D97706", confirmed: "#2563EB", completed: "#059669" };

// ── FormInput — outside
const FormInput = ({ label, value, onChange, placeholder, multiline, T, isDark }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: T.textSub, marginBottom: 5, letterSpacing: 0.5 }}>{label}</Text>
      <View style={{
        backgroundColor: isDark ? "#0D1525" : "#F9FAFB",
        borderRadius: 12, borderWidth: 1.5,
        borderColor: focused ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
        height: multiline ? 90 : 48, paddingHorizontal: 14, justifyContent: "center",
      }}>
        <TextInput
          style={{ color: T.text, fontSize: 14, height: multiline ? 90 : 48, textAlignVertical: multiline ? "top" : "center", paddingVertical: multiline ? 10 : 0 }}
          placeholder={placeholder} placeholderTextColor={T.textLight}
          value={value} onChangeText={onChange} multiline={multiline}
          editable={true} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          underlineColorAndroid="transparent" collapsable={false}
        />
      </View>
    </View>
  );
};

// ── Service Card — outside
const ServiceCard = ({ item, T, isDark, onDelete }) => (
  <View style={[sc.card, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
    <View style={sc.top}>
      <View style={{ flex: 1 }}>
        <Text style={[sc.title, { color: T.text }]}>{item.title}</Text>
        <Text style={[sc.cat, { color: T.primary }]}>{item.category}</Text>
        <Text style={[sc.rate, { color: T.green }]}>{item.rate}</Text>
        <View style={sc.row}>
          <Ionicons name="location-outline" size={12} color={T.textLight} />
          <Text style={[sc.area, { color: T.textLight }]}> {item.area}</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <View style={[sc.badge, { backgroundColor: STATUS_COLOR[item.status] + "22" }]}>
          <Text style={[sc.badgeText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
        </View>
        <View style={sc.ratingRow}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={[sc.rating, { color: T.text }]}> {item.rating}</Text>
        </View>
      </View>
    </View>
    <View style={[sc.footer, { borderTopColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
      <View style={sc.footerLeft}>
        <Ionicons name="calendar-outline" size={13} color={T.textSub} />
        <Text style={[sc.footerText, { color: T.textSub }]}> {item.bookings} bookings</Text>
      </View>
      <View style={sc.footerRight}>
        <TouchableOpacity style={[sc.btn, { backgroundColor: isDark ? "#0D1A35" : "#EEF2FF" }]}>
          <Ionicons name="create-outline" size={14} color={T.primary} />
          <Text style={[sc.btnText, { color: T.primary }]}> Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[sc.btn, { backgroundColor: isDark ? "#2D0D0D" : "#FFF5F5" }]} onPress={() => onDelete(item.id)}>
          <Ionicons name="trash-outline" size={14} color="#EF4444" />
          <Text style={[sc.btnText, { color: "#EF4444" }]}> Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const sc = StyleSheet.create({
  card:     { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12, elevation: 2 },
  top:      { flexDirection: "row", gap: 12, marginBottom: 12 },
  title:    { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  cat:      { fontSize: 12, fontWeight: "600", marginBottom: 3 },
  rate:     { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  row:      { flexDirection: "row", alignItems: "center" },
  area:     { fontSize: 11 },
  badge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:{ fontSize: 10, fontWeight: "700" },
  ratingRow:{ flexDirection: "row", alignItems: "center" },
  rating:   { fontSize: 12, fontWeight: "700" },
  footer:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1 },
  footerLeft: { flexDirection: "row", alignItems: "center" },
  footerText: { fontSize: 12 },
  footerRight:{ flexDirection: "row", gap: 8 },
  btn:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  btnText:  { fontSize: 12, fontWeight: "600" },
});

// ── Request Card — outside
const RequestCard = ({ item, T, isDark, onAccept, onDecline }) => (
  <View style={[rc.card, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB", borderLeftColor: STATUS_COLOR[item.status], borderLeftWidth: 4 }]}>
    <View style={rc.top}>
      <View style={[rc.avatar, { backgroundColor: T.primaryBg }]}>
        <Text style={[rc.avatarText, { color: T.primary }]}>{item.client.split(" ").map((n) => n[0]).join("")}</Text>
      </View>
      <View style={rc.info}>
        <Text style={[rc.name, { color: T.text }]}>{item.client}</Text>
        <Text style={[rc.service, { color: T.textSub }]}>{item.service}</Text>
        <View style={rc.row}>
          <Ionicons name="calendar-outline" size={11} color={T.textLight} />
          <Text style={[rc.date, { color: T.textLight }]}> {item.date}  ·  {item.time}</Text>
        </View>
        <View style={rc.row}>
          <Ionicons name="location-outline" size={11} color={T.textLight} />
          <Text style={[rc.date, { color: T.textLight }]}> {item.area}</Text>
        </View>
      </View>
      <View style={[rc.badge, { backgroundColor: STATUS_COLOR[item.status] + "22" }]}>
        <Text style={[rc.badgeText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
      </View>
    </View>
    {item.status === "pending" && (
      <View style={rc.actions}>
        <TouchableOpacity style={[rc.acceptBtn, { backgroundColor: isDark ? "#0D2518" : "#ECFDF5", borderColor: "#A7F3D0" }]} onPress={() => onAccept(item.id)}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
          <Text style={[rc.acceptText]}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rc.declineBtn, { backgroundColor: isDark ? "#2D0D0D" : "#FFF5F5", borderColor: "#FECACA" }]} onPress={() => onDecline(item.id)}>
          <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
          <Text style={rc.declineText}>Decline</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const rc = StyleSheet.create({
  card:       { borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 12, elevation: 2 },
  top:        { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 4 },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "800" },
  info:       { flex: 1, gap: 3 },
  name:       { fontSize: 14, fontWeight: "700" },
  service:    { fontSize: 12 },
  row:        { flexDirection: "row", alignItems: "center" },
  date:       { fontSize: 11 },
  badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start" },
  badgeText:  { fontSize: 10, fontWeight: "700" },
  actions:    { flexDirection: "row", gap: 10, marginTop: 10 },
  acceptBtn:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, paddingVertical: 8, borderWidth: 1, gap: 6 },
  acceptText: { color: "#059669", fontSize: 13, fontWeight: "700" },
  declineBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, paddingVertical: 8, borderWidth: 1, gap: 6 },
  declineText:{ color: "#EF4444", fontSize: 13, fontWeight: "700" },
});

// ─────────────────────────────────────────────────────────────
export default function ServiceProviderDashboardScreen() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [activeTab,       setActiveTab]       = useState("overview");
  const [services,        setServices]        = useState(SAMPLE_SERVICES);
  const [requests,        setRequests]        = useState(SAMPLE_REQUESTS);
  const [showPostModal,   setShowPostModal]   = useState(false);
  const [postSuccess,     setPostSuccess]     = useState(false);
  const [serviceForm,     setServiceForm]     = useState({ title: "", category: "Cleaning", rate: "", area: "", description: "" });

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handlePostService = () => {
    if (!serviceForm.title || !serviceForm.rate || !serviceForm.area) {
      Alert.alert("Missing fields", "Please fill Title, Rate and Area."); return;
    }
    const newService = {
      id: Date.now().toString(), title: serviceForm.title,
      category: serviceForm.category, rate: serviceForm.rate,
      area: serviceForm.area, bookings: 0, rating: 0, status: "active",
    };
    setServices((prev) => [newService, ...prev]);
    setPostSuccess(true);
    setTimeout(() => { setPostSuccess(false); setShowPostModal(false); setActiveTab("services"); }, 2000);
  };

  const handleDeleteService = (id) => {
    Alert.alert("Delete Service?", "This will remove the service.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setServices((prev) => prev.filter((s) => s.id !== id)) },
    ]);
  };

  const handleAccept = (id) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "confirmed" } : r));
  };

  const handleDecline = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  const STATS = [
    { label: "Active Services", value: services.filter((s) => s.status === "active").length, icon: "construct-outline", color: T.primary },
    { label: "Total Bookings",  value: services.reduce((a, b) => a + b.bookings, 0),          icon: "calendar-outline",  color: T.green   },
    { label: "Pending",         value: requests.filter((r) => r.status === "pending").length,  icon: "time-outline",      color: T.orange  },
    { label: "Completed",       value: requests.filter((r) => r.status === "completed").length,icon: "checkmark-circle-outline", color: "#059669" },
  ];

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      {/* Header */}
      <Animated.View style={[s.header, { backgroundColor: T.bg, opacity: headerFade }]}>
        <View style={s.headerLeft}>
          <View style={[s.logo, { backgroundColor: T.green }]}>
            <Ionicons name="construct" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[s.headerTitle, { color: T.text }]}>Service Portal</Text>
            <Text style={[s.headerSub, { color: T.textSub }]}>Nimal's Services</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={17} color={isDark ? "#F59E0B" : T.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
            onPress={() => Alert.alert("Logout", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: () => router.replace("/login") },
            ])}
          >
            <Ionicons name="log-out-outline" size={17} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Tabs */}
      <View style={[s.tabRow, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
        {[
          { id: "overview",  label: "Overview",  icon: "grid-outline"      },
          { id: "services",  label: "Services",  icon: "construct-outline" },
          { id: "requests",  label: "Requests",  icon: "calendar-outline"  },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} style={[s.tab, { borderBottomColor: active ? T.green : "transparent" }]} onPress={() => setActiveTab(tab.id)}>
              <Ionicons name={tab.icon} size={15} color={active ? T.green : T.textLight} />
              <Text style={[s.tabText, { color: active ? T.green : T.textLight }]}> {tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* FAB */}
      <TouchableOpacity style={[s.fab, { backgroundColor: T.green }]} onPress={() => setShowPostModal(true)}>
        <Ionicons name="add" size={22} color="#FFFFFF" />
        <Text style={s.fabText}>Add Service</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <View>
            <View style={s.statsGrid}>
              {STATS.map((stat, i) => (
                <View key={i} style={[s.statCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
                  <View style={[s.statIcon, { backgroundColor: stat.color + "20" }]}>
                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                  </View>
                  <Text style={[s.statValue, { color: T.text }]}>{stat.value}</Text>
                  <Text style={[s.statLabel, { color: T.textSub }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[s.sectionTitle, { color: T.text, marginBottom: 12 }]}>Pending Requests</Text>
            {requests.filter((r) => r.status === "pending").map((item) => (
              <RequestCard key={item.id} item={item} T={T} isDark={isDark} onAccept={handleAccept} onDecline={handleDecline} />
            ))}
          </View>
        )}

        {/* SERVICES */}
        {activeTab === "services" && (
          <View>
            <View style={s.sectionRow}>
              <Text style={[s.sectionTitle, { color: T.text }]}>{services.length} Services</Text>
              <TouchableOpacity onPress={() => setShowPostModal(true)}>
                <Text style={[s.seeAll, { color: T.green }]}>+ Add New</Text>
              </TouchableOpacity>
            </View>
            {services.map((item) => (
              <ServiceCard key={item.id} item={item} T={T} isDark={isDark} onDelete={handleDeleteService} />
            ))}
          </View>
        )}

        {/* REQUESTS */}
        {activeTab === "requests" && (
          <View>
            <Text style={[s.sectionTitle, { color: T.text, marginBottom: 12 }]}>{requests.length} Requests</Text>
            {requests.map((item) => (
              <RequestCard key={item.id} item={item} T={T} isDark={isDark} onAccept={handleAccept} onDecline={handleDecline} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* POST SERVICE MODAL */}
      <Modal visible={showPostModal} transparent animationType="slide" onRequestClose={() => setShowPostModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: T.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={[s.modalHandle, { backgroundColor: isDark ? "#2D4060" : "#D1D5DB" }]} />

              {postSuccess ? (
                <View style={s.successBox}>
                  <View style={[s.successIcon, { backgroundColor: T.greenBg }]}>
                    <Ionicons name="checkmark-circle" size={56} color={T.green} />
                  </View>
                  <Text style={[s.successTitle, { color: T.text }]}>Service Posted! 🎉</Text>
                  <Text style={[s.successSub, { color: T.textSub }]}>Clients can now find and book your service.</Text>
                </View>
              ) : (
                <>
                  <Text style={[s.modalTitle, { color: T.text }]}>🔧 Add New Service</Text>
                  <Text style={[s.modalSub, { color: T.textSub }]}>List your service to attract clients</Text>

                  <FormInput label="Service Title *" value={serviceForm.title} onChange={(v) => setServiceForm((p) => ({ ...p, title: v }))} placeholder="e.g. House Cleaning" T={T} isDark={isDark} />

                  <Text style={[s.formLabel, { color: T.textSub }]}>CATEGORY</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12, paddingVertical: 4 }}>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[s.chip, { backgroundColor: serviceForm.category === cat ? T.green : chipBg, borderColor: serviceForm.category === cat ? T.green : chipBorder }]}
                        onPress={() => setServiceForm((p) => ({ ...p, category: cat }))}
                      >
                        <Text style={[s.chipText, { color: serviceForm.category === cat ? "#FFFFFF" : chipColor }]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <FormInput label="Rate *"        value={serviceForm.rate}        onChange={(v) => setServiceForm((p) => ({ ...p, rate: v }))}        placeholder="e.g. LKR 2,500 / day"     T={T} isDark={isDark} />
                  <FormInput label="Service Area *" value={serviceForm.area}        onChange={(v) => setServiceForm((p) => ({ ...p, area: v }))}        placeholder="e.g. Colombo / All Areas"  T={T} isDark={isDark} />
                  <FormInput label="Description"    value={serviceForm.description} onChange={(v) => setServiceForm((p) => ({ ...p, description: v }))} placeholder="Describe your service..."  multiline T={T} isDark={isDark} />

                  <TouchableOpacity style={[s.postBtn, { backgroundColor: T.green }]} onPress={handlePostService}>
                    <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                    <Text style={s.postBtnText}> Post Service Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[s.cancelBtn, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => setShowPostModal(false)}>
                    <Text style={[s.cancelBtnText, { color: T.textSub }]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  header:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo:    { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", elevation: 3 },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  headerSub:   { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },

  tabRow:  { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 16, borderRadius: 12, overflow: "hidden", elevation: 2, marginBottom: 4 },
  tab:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderBottomWidth: 2, gap: 4 },
  tabText: { fontSize: 12, fontWeight: "600" },

  fab:     { position: "absolute", bottom: 24, right: 16, flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, elevation: 8, zIndex: 99, gap: 6 },
  fabText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard:  { width: (width - 52) / 2, borderRadius: 16, padding: 14, borderWidth: 1, alignItems: "center", gap: 6, elevation: 2 },
  statIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },

  sectionTitle: { fontSize: 16, fontWeight: "700" },
  sectionRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAll:       { fontSize: 13, fontWeight: "600" },

  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: height * 0.9, elevation: 30 },
  modalHandle:  { width: 40, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalTitle:   { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalSub:     { fontSize: 13, marginBottom: 16 },
  formLabel:    { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  chip:         { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  chipText:     { fontSize: 12, fontWeight: "600" },
  postBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 14, gap: 8, elevation: 4, marginTop: 8 },
  postBtnText:  { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  cancelBtn:    { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 10, borderWidth: 1 },
  cancelBtnText:{ fontSize: 14, fontWeight: "600" },
  successBox:   { alignItems: "center", paddingVertical: 30, gap: 12 },
  successIcon:  { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontWeight: "800" },
  successSub:   { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
