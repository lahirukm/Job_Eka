import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from "react";
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, AUTH } from "../context/ThemeContext";
import { loginUser, logoutUser } from "../services/authApi";
import useKeyboardScroll from "../hooks/useKeyboardScroll";

const { height } = Dimensions.get("window");

const LOGIN_ROLES = [
  { id: "job_seeker",       label: "Job Seeker",       icon: "person-outline"    },
  { id: "employer",         label: "Client / Employer", icon: "briefcase-outline" },
  { id: "service_provider", label: "Service Provider",  icon: "construct-outline" },
];
const ROLE_LABEL = { job_seeker: "Job Seeker", employer: "Client / Employer", service_provider: "Service Provider" };
const ROLE_HOME  = { job_seeker: "/(tabs)", employer: "/employer-dashboard", service_provider: "/service-dashboard" };

export default function LoginScreen() {
  const { isDark, toggleTheme } = useTheme();
  C = isDark ? AUTH.dark : AUTH.light;
  styles = isDark ? STYLES.dark : STYLES.light;
  const kb = useKeyboardScroll();
  const router = useRouter();

  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [showPassword,   setShowPassword]   = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [emailFocused,   setEmailFocused]   = useState(false);
  const [passwordFocused,setPasswordFocused]= useState(false);
  const [error,          setError]          = useState("");
  const [role,           setRole]           = useState(null); // must be selected

  // Animations
  const logoFade  = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(-30)).current;
  const cardFade  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;
  const dot1      = useRef(new Animated.Value(0)).current;
  const dot2      = useRef(new Animated.Value(0)).current;
  const dot3      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(logoSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(cardFade,  { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true, delay: 300 }),
    ]).start();

    Animated.timing(badgeFade, { toValue: 1, duration: 600, delay: 600, useNativeDriver: true }).start();

    const dotAnim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -10, duration: 1000, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,   duration: 1000, useNativeDriver: true }),
        ])
      );
    Animated.parallel([dotAnim(dot1, 0), dotAnim(dot2, 333), dotAnim(dot3, 666)]).start();
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!role)                { setError("Please select who you are signing in as."); return; }
    if (!email || !password)  { setError("Please fill in all fields."); return; }
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      const { user } = await loginUser(email, password);
      const accountRole = user.role || "job_seeker";

      // Selected role must match the role the account was registered with
      if (accountRole !== role) {
        await logoutUser();
        setLoading(false);
        setError(`This account is registered as ${ROLE_LABEL[accountRole] || accountRole}. Please select that option.`);
        return;
      }

      setLoading(false);
      router.replace(ROLE_HOME[accountRole] || "/(tabs)");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.bg} />

      {/* ── Light / dark toggle ── */}
      <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme} activeOpacity={0.8}>
        <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={20} color={isDark ? "#F59E0B" : C.primary} />
      </TouchableOpacity>

      <View style={styles.bgCircle1} pointerEvents="none" />
      <View style={styles.bgCircle2} pointerEvents="none" />
      <View style={styles.bgCircle3} pointerEvents="none" />

      <ScrollView
        {...kb.scrollProps}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: kb.keyboardHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo ── */}
        <Animated.View
          pointerEvents="none"
          style={[styles.logoArea, {
            opacity: logoFade,
            transform: [{ translateY: logoSlide }],
          }]}
        >
          <View style={styles.logoBox}>
            <Image source={require("../assets/logo-mark.png")} style={styles.logoImg} resizeMode="contain" />
          </View>
          <Text style={styles.brandName}>Job<Text style={{ color: C.orange }}>Eka</Text></Text>
          <Text style={styles.brandTagline}>Sri Lanka's Smart Job Platform</Text>
          <View style={styles.dotsRow}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={[styles.dot, { transform: [{ translateY: dot }] }]}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Card ── */}
        <Animated.View
          collapsable={false}
          style={[styles.card, {
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          }]}
        >
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSub}>Sign in to find your next opportunity</Text>

          {/* ── Role selector (required) ── */}
          <Text style={styles.inputLabel}>SIGN IN AS</Text>
          <View style={styles.roleRow}>
            {LOGIN_ROLES.map((r) => {
              const active = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, active && styles.roleCardActive]}
                  onPress={() => { setRole(r.id); setError(""); }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={active ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={active ? C.green : C.textLight}
                    style={styles.roleTick}
                  />
                  <Ionicons name={r.icon} size={22} color={active ? C.text : C.textSub} />
                  <Text style={[styles.roleText, active && styles.roleTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={14} color={C.error} />
              <Text style={styles.errorText}>  {error}</Text>
            </View>
          )}

          {/* ── Email ── */}
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={emailFocused ? C.primary : C.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={C.textLight}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={true}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              underlineColorAndroid="transparent"
              returnKeyType="next"
            />
          </View>

          {/* ── Password ── */}
          <Text style={[styles.inputLabel, { marginTop: 16 }]}>PASSWORD</Text>
          <View style={[styles.inputWrapper, passwordFocused && styles.inputFocused]}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={passwordFocused ? C.primary : C.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={C.textLight}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(""); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={true}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              underlineColorAndroid="transparent"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={C.textLight}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => alert("Reset link will be sent to your email.")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* ── Sign In Button ── */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : (
                <View style={styles.loginBtnInner}>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              )
            }
          </TouchableOpacity>

          {/* ── Register Link ── */}
          <View style={[styles.registerRow, { marginTop: 24 }]}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10 }}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.registerLink}>Sign Up Free</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View
          pointerEvents="none"
          style={[styles.footer, { opacity: badgeFade }]}
        >
          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark-outline" size={12} color={C.textLight} />
            <Text style={styles.footerText}>  Secure & Private</Text>
          </View>
          <Text style={styles.footerDivider}>  ·  </Text>
          <Text style={styles.footerPowered}>
            Powered by <Text style={styles.footerBrand}>JobEka</Text>
          </Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  themeBtn: {
    position: "absolute", top: 48, right: 20, zIndex: 20,
    width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, elevation: 4,
  },
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: {
    flexGrow: 1, alignItems: "center",
    paddingVertical: 50, paddingHorizontal: 20,
  },

  bgCircle1: {
    position: "absolute", width: 300, height: 300, borderRadius: 150,
    backgroundColor: C.primary, opacity: 0.07, top: -80, right: -80,
  },
  bgCircle2: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    backgroundColor: C.green, opacity: 0.06, bottom: 100, left: -60,
  },
  bgCircle3: {
    position: "absolute", width: 150, height: 150, borderRadius: 75,
    backgroundColor: C.orange, opacity: 0.05, top: height * 0.4, right: -40,
  },

  logoArea: { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
    marginBottom: 14, elevation: 12,
  },
  logoImg: { width: 54, height: 54 },
  brandName: { fontSize: 32, fontWeight: "800", color: C.text, letterSpacing: 1.5 },
  brandTagline: { fontSize: 13, color: C.green, marginTop: 4, fontWeight: "500" },
  dotsRow: { flexDirection: "row", marginTop: 14, gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary, opacity: 0.8 },

  card: {
    width: "100%", backgroundColor: C.card,
    borderRadius: 28, padding: 28,
    borderWidth: 1, borderColor: C.border, elevation: 15,
  },
  cardTitle: { fontSize: 24, fontWeight: "700", color: C.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: C.textSub, marginBottom: 24 },

  errorBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { color: C.error, fontSize: 13, fontWeight: "500" },

  inputLabel: {
    color: C.textMuted, fontSize: 11,
    fontWeight: "600", marginBottom: 8, letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.inputBg, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, height: 54,
  },
  inputFocused: { borderColor: C.primary, backgroundColor: C.primaryBg },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: C.text, fontSize: 15, height: 54, paddingVertical: 0 },
  eyeBtn: { padding: 4 },

  forgotBtn: { alignSelf: "flex-end", marginTop: 12, marginBottom: 24 },
  forgotText: { color: C.primary, fontSize: 13, fontWeight: "600" },

  loginBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    height: 54, alignItems: "center", justifyContent: "center", elevation: 10,
  },
  loginBtnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  loginBtnText: { color: C.onPrimary, fontSize: 17, fontWeight: "700", letterSpacing: 0.5 },

  divider: { flexDirection: "row", alignItems: "center", marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { color: C.textLight, fontSize: 12, marginHorizontal: 12 },



  roleRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  roleCard: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: C.inputBg, borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    paddingTop: 22, paddingBottom: 12, paddingHorizontal: 4, gap: 6,
  },
  roleCardActive: { borderColor: C.primary, backgroundColor: C.primarySoft },
  roleTick: { position: "absolute", top: 6, right: 6 },
  roleText: { color: C.textSub, fontSize: 11, fontWeight: "700", textAlign: "center" },
  roleTextActive: { color: C.text },

  registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  registerText: { color: C.textLight, fontSize: 14 },
  registerLink: { color: C.green, fontSize: 14, fontWeight: "700" },


  footer: { marginTop: 28, flexDirection: "row", alignItems: "center" },
  footerRow: { flexDirection: "row", alignItems: "center" },
  footerText: { color: C.textLight, fontSize: 12 },
  footerDivider: { color: C.border, fontSize: 14 },
  footerPowered: { color: C.textLight, fontSize: 12 },
  footerBrand: { color: C.primary, fontWeight: "700", fontSize: 12 },
});

// Pre-built styles for both themes; the screen picks one on every render
const STYLES = { dark: makeStyles(AUTH.dark), light: makeStyles(AUTH.light) };
let styles = STYLES.light;
let C = AUTH.light;
