import { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { loginUser, registerUser } from "../services/authApi";
import useKeyboardScroll from "../hooks/useKeyboardScroll";

const { width, height } = Dimensions.get("window");

// ── InputField — outside
const InputField = ({ label, value, onChangeText, placeholder, secure, keyboardType, T, isDark }) => {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: T.textSub, marginBottom: 6, letterSpacing: 0.5 }}>
        {label}
      </Text>
      <View style={{
        flexDirection: "row", alignItems: "center",
        backgroundColor: isDark ? "#0D1525" : "#F9FAFB",
        borderRadius: 14, borderWidth: 1.5,
        borderColor: focused ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
        height: 52, paddingHorizontal: 14, gap: 10,
      }}>
        <TextInput
          style={{ flex: 1, color: T.text, fontSize: 14, height: 52 }}
          placeholder={placeholder}
          placeholderTextColor={T.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !showPass}
          keyboardType={keyboardType || "default"}
          autoCapitalize="none"
          autoCorrect={false}
          editable={true}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          underlineColorAndroid="transparent"
          collapsable={false}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? "eye-outline" : "eye-off-outline"} size={20} color={T.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function EmployerLoginScreen() {
  const kb = useKeyboardScroll();
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [role,     setRole]     = useState("employer");
  const [isLogin,  setIsLogin]  = useState(true);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [company,  setCompany]  = useState("");
  const [phone,    setPhone]    = useState("");   // ← NEW
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please enter email and password"); return; }
    if (!isLogin && (!name || !company || !phone)) { setError("Please fill all fields including phone number"); return; }
    setError(""); setLoading(true);

    try {
      if (isLogin) {
        // ── LOGIN — authApi saves name+phone to AsyncStorage automatically
        const { user } = await loginUser(email, password);
        if (role === "employer") router.replace("/employer-dashboard");
        else                     router.replace("/service-dashboard");
      } else {
        // ── REGISTER — save name+phone to MongoDB + AsyncStorage
        const { user } = await registerUser({
          name,
          email,
          password,
          phone,                    // ← phone auto-saves to AsyncStorage via authApi
          role,                     // "employer" or "service_provider"
          company,
        });
        if (role === "employer") router.replace("/employer-dashboard");
        else                     router.replace("/service-dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

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
        <TouchableOpacity
          style={[s.themeBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
          onPress={toggleTheme}
        >
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={isDark ? "#F59E0B" : T.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView {...kb.scrollProps} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 + kb.keyboardHeight }}>

        {/* Logo */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: "center", marginBottom: 28 }}>
          <View style={[s.logo, { backgroundColor: T.primary }]}>
            <Ionicons name="business" size={32} color="#FFFFFF" />
          </View>
          <Text style={[s.title,    { color: T.text }]}>Business Portal</Text>
          <Text style={[s.subtitle, { color: T.textSub }]}>Post jobs · Find talent · Grow your business</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Role selector */}
          <Text style={[s.sectionLabel, { color: T.textSub }]}>I AM A</Text>
          <View style={[s.roleRow, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            {[
              { id: "employer", label: "Employer",         icon: "business-outline",  desc: "Post jobs & hire"  },
              { id: "service",  label: "Service Provider", icon: "construct-outline", desc: "Offer services"    },
            ].map((r) => {
              const isActive = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[s.roleCard, {
                    backgroundColor: isActive ? T.primary : "transparent",
                    borderColor:     isActive ? T.primary : "transparent",
                  }]}
                  onPress={() => { setRole(r.id); setError(""); }}
                  activeOpacity={0.85}
                >
                  <Ionicons name={r.icon} size={22} color={isActive ? "#FFFFFF" : T.textSub} />
                  <Text style={[s.roleLabel, { color: isActive ? "#FFFFFF" : T.textSub }]}>{r.label}</Text>
                  <Text style={[s.roleDesc,  { color: isActive ? "rgba(255,255,255,0.75)" : T.textLight }]}>{r.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Login / Register toggle */}
          <View style={[s.toggleRow, { backgroundColor: isDark ? "#111827" : "#F3F4F6", borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            {[
              { id: true,  label: "Login"    },
              { id: false, label: "Register" },
            ].map((tab) => (
              <TouchableOpacity
                key={String(tab.id)}
                style={[s.toggleBtn, { backgroundColor: isLogin === tab.id ? T.primary : "transparent" }]}
                onPress={() => { setIsLogin(tab.id); setError(""); }}
              >
                <Text style={[s.toggleBtnText, { color: isLogin === tab.id ? "#FFFFFF" : T.textSub }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form card */}
          <View style={[s.formCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            <Text style={[s.formTitle, { color: T.text }]}>
              {isLogin
                ? (role === "employer" ? "🏢 Employer Login" : "🔧 Service Provider Login")
                : (role === "employer" ? "🏢 Create Employer Account" : "🔧 Create Service Account")
              }
            </Text>

            {/* Register extra fields */}
            {!isLogin && (
              <>
                <InputField
                  label="Full Name *"
                  value={name}
                  onChangeText={(v) => { setName(v); setError(""); }}
                  placeholder="e.g. Kamal Perera"
                  T={T} isDark={isDark}
                />
                <InputField
                  label={role === "employer" ? "Company Name *" : "Business Name *"}
                  value={company}
                  onChangeText={(v) => { setCompany(v); setError(""); }}
                  placeholder={role === "employer" ? "e.g. ABC Solutions" : "e.g. Nimal's Services"}
                  T={T} isDark={isDark}
                />
                <InputField
                  label="Phone Number *"
                  value={phone}
                  onChangeText={(v) => { setPhone(v); setError(""); }}
                  placeholder="e.g. 077 1234567"
                  keyboardType="phone-pad"
                  T={T} isDark={isDark}
                />
              </>
            )}

            <InputField
              label="Business Email *"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(""); }}
              placeholder="business@company.com"
              keyboardType="email-address"
              T={T} isDark={isDark}
            />
            <InputField
              label="Password *"
              value={password}
              onChangeText={(v) => { setPassword(v); setError(""); }}
              placeholder="Enter your password"
              secure
              T={T} isDark={isDark}
            />

            {/* Error */}
            {error ? (
              <View style={[s.errorBox, { backgroundColor: isDark ? "#2D0D0D" : "#FFF5F5" }]}>
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                <Text style={s.errorText}> {error}</Text>
              </View>
            ) : null}

            {/* Submit button */}
            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: loading ? T.primary + "AA" : T.primary }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                  <Text style={s.submitBtnText}>
                    {isLogin ? " Signing in..." : " Creating account..."}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name={isLogin ? "log-in-outline" : "person-add-outline"} size={20} color="#FFFFFF" />
                  <Text style={s.submitBtnText}>
                    {isLogin ? " Sign In" : " Create Account"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to job seeker */}
          <TouchableOpacity
            style={[s.jobSeekerBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
            onPress={() => router.replace("/login")}
          >
            <Ionicons name="person-outline" size={16} color={T.textSub} />
            <Text style={[s.jobSeekerText, { color: T.textSub }]}> Looking for a job? Job Seeker Login →</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1 },
  header:   { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8 },
  backBtn:  { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  themeBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },

  logo:     { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 16, elevation: 8 },
  title:    { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 13, textAlign: "center" },

  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },

  roleRow:  { flexDirection: "row", borderRadius: 18, borderWidth: 1, padding: 6, gap: 6, marginBottom: 16, elevation: 2 },
  roleCard: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 14, gap: 4 },
  roleLabel:{ fontSize: 13, fontWeight: "700" },
  roleDesc: { fontSize: 10 },

  toggleRow: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 16, gap: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center" },
  toggleBtnText: { fontSize: 14, fontWeight: "700" },

  formCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16, elevation: 3 },
  formTitle:{ fontSize: 17, fontWeight: "800", marginBottom: 16 },

  errorBox: { flexDirection: "row", alignItems: "center", borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText:{ color: "#EF4444", fontSize: 12, flex: 1 },

  submitBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 14, gap: 8, elevation: 4, marginTop: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  switchBtn:  { alignItems: "center", paddingTop: 14 },
  switchText: { fontSize: 13 },

  jobSeekerBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, padding: 14, borderWidth: 1, gap: 6 },
  jobSeekerText: { fontSize: 13 },
});
