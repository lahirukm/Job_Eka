import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, TextInput, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser, updateProfile, getMe } from "../services/authApi";

const MENU_ITEMS = [
  { icon: "document-text-outline",    label: "My Applications",    color: "#059669" },
  { icon: "star-outline",             label: "Saved Jobs",         color: "#D97706" },
  { icon: "notifications-outline",    label: "Notifications",      color: "#7C3AED" },
  { icon: "shield-checkmark-outline", label: "Privacy & Security", color: "#0284C7" },
  { icon: "help-circle-outline",      label: "Help & Support",     color: "#EA580C" },
  { icon: "log-out-outline",          label: "Logout",             color: "#EF4444" },
];

export default function ProfileScreen() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Try to get fresh data from API
      const user = await getMe();
      setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
      setEditForm({ name: user.name || "", phone: user.phone || "" });
      // Update AsyncStorage cache
      await AsyncStorage.setItem("customer_name",  user.name  || "");
      await AsyncStorage.setItem("customer_phone", user.phone || "");
    } catch (_) {
      // Fallback to AsyncStorage if API fails
      const name  = await AsyncStorage.getItem("customer_name")  || "";
      const email = await AsyncStorage.getItem("customer_email") || "";
      const phone = await AsyncStorage.getItem("customer_phone") || "";
      setProfile({ name, email, phone });
      setEditForm({ name, phone });
    }
  };

  const saveProfile = async () => {
    try {
      await updateProfile({ name: editForm.name, phone: editForm.phone });
      setProfile((p) => ({ ...p, name: editForm.name, phone: editForm.phone }));
      setShowEdit(false);
      Alert.alert("Saved!", "Profile updated successfully.");
    } catch (err) {
      Alert.alert("Error", err.message || "Update failed.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: T.bg }]}>
        <Text style={[s.title, { color: T.text }]}>Profile</Text>
        <TouchableOpacity
          style={[s.themeBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
          onPress={toggleTheme}
        >
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={isDark ? "#F59E0B" : T.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Avatar card */}
        <View style={[s.avatarCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
          <View style={[s.avatar, { backgroundColor: T.primaryBg }]}>
            <Ionicons name="person" size={40} color={T.primary} />
          </View>
          <Text style={[s.name,  { color: T.text }]}>{profile.name || "Job Seeker"}</Text>
          <Text style={[s.email, { color: T.textSub }]}>{profile.email || "—"}</Text>

          {/* Phone number display */}
          <View style={[s.phoneRow, { backgroundColor: isDark ? "#0D1A35" : "#EEF2FF", borderColor: isDark ? "#1E2D40" : "#BFDBFE" }]}>
            <Ionicons name="call-outline" size={16} color={T.primary} />
            <Text style={[s.phoneText, { color: profile.phone ? T.primary : T.textLight }]}>
              {profile.phone || "No phone number added"}
            </Text>
            <TouchableOpacity onPress={() => setShowEdit(true)}>
              <Ionicons name="create-outline" size={16} color={T.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { label: "Applied",    value: "12" },
              { label: "Saved",      value: "8"  },
              { label: "Interviews", value: "3"  },
            ].map((stat, i) => (
              <View key={i} style={s.statItem}>
                <Text style={[s.statValue, { color: T.text }]}>{stat.value}</Text>
                <Text style={[s.statLabel, { color: T.textSub }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[s.editBtn, { backgroundColor: T.primary }]} onPress={() => setShowEdit(true)}>
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={s.editBtnText}> Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[s.menuRow, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
              onPress={() => { if (item.label === "Logout") handleLogout(); }}
              activeOpacity={0.8}
            >
              <View style={[s.menuIcon, { backgroundColor: item.color + (isDark ? "22" : "15") }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[s.menuLabel, { color: item.label === "Logout" ? "#EF4444" : T.text }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={T.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[s.version, { color: T.textLight }]}>
          JobEka v1.0.0  ·  Made with ❤️ in Sri Lanka
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEdit} transparent animationType="slide" onRequestClose={() => setShowEdit(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: T.surface }]}>
            <View style={[s.modalHandle, { backgroundColor: isDark ? "#2D4060" : "#D1D5DB" }]} />
            <Text style={[s.modalTitle, { color: T.text }]}>✏️ Edit Profile</Text>

            {/* Name */}
            <Text style={[s.inputLabel, { color: T.textSub }]}>FULL NAME</Text>
            <View style={[s.inputBox, { backgroundColor: isDark ? "#0D1525" : "#F9FAFB", borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
              <TextInput
                style={[s.input, { color: T.text }]}
                placeholder="Your full name"
                placeholderTextColor={T.textLight}
                value={editForm.name}
                onChangeText={(v) => setEditForm((p) => ({ ...p, name: v }))}
                underlineColorAndroid="transparent"
                collapsable={false}
              />
            </View>

            {/* Phone */}
            <Text style={[s.inputLabel, { color: T.textSub }]}>PHONE NUMBER</Text>
            <View style={[s.inputBox, { backgroundColor: isDark ? "#0D1525" : "#F9FAFB", borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
              <Ionicons name="call-outline" size={16} color={T.textLight} style={{ marginRight: 8 }} />
              <TextInput
                style={[s.input, { color: T.text, flex: 1 }]}
                placeholder="e.g. 077 1234567"
                placeholderTextColor={T.textLight}
                value={editForm.phone}
                onChangeText={(v) => setEditForm((p) => ({ ...p, phone: v }))}
                keyboardType="phone-pad"
                underlineColorAndroid="transparent"
                collapsable={false}
              />
            </View>

            <Text style={[s.phoneTip, { color: T.textSub }]}>
              💡 ඔයාගේ phone number employers ලදී show වෙනවා — job apply කළාට පස්සේ
            </Text>

            <TouchableOpacity style={[s.saveBtn, { backgroundColor: T.primary }]} onPress={saveProfile}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
              <Text style={s.saveBtnText}> Save Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.cancelBtn, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => setShowEdit(false)}>
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
  header:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  title:   { fontSize: 24, fontWeight: "800" },
  themeBtn:{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },

  avatarCard: { margin: 16, borderRadius: 24, padding: 20, alignItems: "center", borderWidth: 1, elevation: 3 },
  avatar:     { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  name:       { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  email:      { fontSize: 13, marginBottom: 12 },

  phoneRow:   { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, marginBottom: 16, alignSelf: "stretch" },
  phoneText:  { flex: 1, fontSize: 14, fontWeight: "600" },

  statsRow:   { flexDirection: "row", gap: 32, marginBottom: 16 },
  statItem:   { alignItems: "center" },
  statValue:  { fontSize: 20, fontWeight: "800" },
  statLabel:  { fontSize: 11, marginTop: 2 },
  editBtn:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, elevation: 3 },
  editBtnText:{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  menuRow:    { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 8, gap: 12, elevation: 1 },
  menuIcon:   { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel:  { flex: 1, fontSize: 14, fontWeight: "500" },
  version:    { textAlign: "center", fontSize: 12, paddingVertical: 20 },

  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 32, elevation: 30 },
  modalHandle:  { width: 40, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalTitle:   { fontSize: 20, fontWeight: "800", marginBottom: 16 },
  inputLabel:   { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  inputBox:     { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, height: 48, paddingHorizontal: 14, marginBottom: 14 },
  input:        { fontSize: 14, height: 48 },
  phoneTip:     { fontSize: 12, lineHeight: 18, marginBottom: 16 },
  saveBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 14, gap: 8, elevation: 4 },
  saveBtnText:  { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  cancelBtn:    { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 10, borderWidth: 1 },
  cancelBtnText:{ fontSize: 14, fontWeight: "600" },
});
