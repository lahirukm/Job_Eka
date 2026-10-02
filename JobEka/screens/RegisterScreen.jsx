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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, AUTH } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import { registerUser } from "../services/authApi";
import useKeyboardScroll from "../hooks/useKeyboardScroll";

const { height } = Dimensions.get("window");

const ROLES = [
  { id: "job_seeker",       label: "Job Seeker",      icon: "person-outline",    desc: "Find jobs near you"   },
  { id: "employer",         label: "Client/Employer",  icon: "briefcase-outline", desc: "Post jobs & hire"     },
  { id: "service_provider", label: "Service Provider", icon: "construct-outline", desc: "Offer your services"  },
];

const EMPLOYER_TYPES = [
  {
    id: "individual",
    label: "Individual",
    icon: "person-circle-outline",
    desc: "Personal tasks\n(Garden, Cleaning...)",
  },
  {
    id: "company",
    label: "Company",
    icon: "business-outline",
    desc: "Business hiring\n(ABC Solutions...)",
  },
];

// ─────────────────────────────────────────────────────────────
//  InputField OUTSIDE — fixes Android keyboard hide bug
// ─────────────────────────────────────────────────────────────
const InputField = ({
  label, icon, value, onChangeText, field,
  keyboardType, secureTextEntry, rightIcon, onRightPress,
  placeholder, returnKeyType, maxLength,
  focusField, setFocusField, setError,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[styles.inputWrapper, focusField === field && styles.inputFocused]}>
      <Ionicons
        name={icon}
        size={18}
        color={focusField === field ? C.primary : C.textLight}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={C.textLight}
        value={value}
        onChangeText={(t) => { onChangeText(t); setError(""); }}
        keyboardType={keyboardType || "default"}
        autoCapitalize="none"
        autoCorrect={false}
        editable={true}
        secureTextEntry={secureTextEntry || false}
        onFocus={() => setFocusField(field)}
        onBlur={() => setFocusField("")}
        underlineColorAndroid="transparent"
        returnKeyType={returnKeyType || "next"}
        maxLength={maxLength}
      />
      {rightIcon && (
        <TouchableOpacity
          onPress={onRightPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.eyeBtn}
        >
          <Ionicons name={rightIcon} size={20} color={C.textLight} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────
//  Employer Type Selector — Individual vs Company
// ─────────────────────────────────────────────────────────────
const EmployerTypeSelector = ({ employerType, setEmployerType }) => (
  <View style={styles.empTypeContainer}>
    <Text style={styles.sectionLabel}>EMPLOYER TYPE</Text>
    <View style={styles.empTypeRow}>
      {EMPLOYER_TYPES.map((type) => {
        const isActive = employerType === type.id;
        return (
          <TouchableOpacity
            key={type.id}
            style={[styles.empTypeCard, isActive && styles.empTypeCardActive]}
            onPress={() => setEmployerType(type.id)}
            activeOpacity={0.7}
          >
            {/* Tick checkbox top right */}
            <View style={[styles.tickBox, isActive && styles.tickBoxActive]}>
              {isActive && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
            </View>

            <Ionicons
              name={type.icon}
              size={32}
              color={isActive ? C.primary : C.textLight}
            />
            <Text style={[styles.empTypeLabel, isActive && styles.empTypeLabelActive]}>
              {type.label}
            </Text>
            <Text style={[styles.empTypeDesc, isActive && styles.empTypeDescActive]}>
              {type.desc}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────
//  Main Screen
// ─────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
  C = isDark ? AUTH.dark : AUTH.light;
  styles = isDark ? STYLES.dark : STYLES.light;
  const router = useRouter();
  const kb = useKeyboardScroll();
  // Common fields
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [location,     setLocation]     = useState("");
  const [selectedRole, setSelectedRole] = useState("job_seeker");

  // Job Seeker
  const [fullName,     setFullName]     = useState("");

  // Employer
  const [employerType, setEmployerType] = useState("individual"); // "individual" | "company"
  const [employerName, setEmployerName] = useState("");           // individual name
  const [companyName,  setCompanyName]  = useState("");           // company name

  // Service Provider
  const [providerName, setProviderName] = useState("");
  const [skill,        setSkill]        = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [focusField,   setFocusField]   = useState("");

  // Animations
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardFade    = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(40)).current;
  const badgeFade   = useRef(new Animated.Value(0)).current;
  const fieldsFade  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(cardFade,  { toValue: 1, duration: 600, delay: 250, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true, delay: 250 }),
    ]).start();
    Animated.timing(badgeFade, { toValue: 1, duration: 600, delay: 500, useNativeDriver: true }).start();
  }, []);

  const handleRoleChange = (roleId) => {
    setError("");
    Animated.sequence([
      Animated.timing(fieldsFade, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fieldsFade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setSelectedRole(roleId);
  };

  const validate = () => {
    if (selectedRole === "job_seeker") {
      if (!fullName.trim())      return "Full name is required.";
    }
    if (selectedRole === "employer") {
      if (employerType === "individual" && !employerName.trim())
        return "Your name is required.";
      if (employerType === "company" && !companyName.trim())
        return "Company name is required.";
    }
    if (selectedRole === "service_provider") {
      if (!providerName.trim())  return "Your name is required.";
      if (!skill.trim())         return "Please enter your main skill.";
    }
    if (!email.includes("@"))    return "Enter a valid email address.";
    if (phone.length < 9)        return "Enter a valid phone number.";
    if (password.length < 6)     return "Password must be at least 6 characters.";
    if (password !== confirmPass) return "Passwords do not match.";
    if (!location.trim())        return "Please enter your location.";
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      // Build name based on role
      const name = selectedRole === "job_seeker"
        ? fullName
        : selectedRole === "employer"
          ? (employerType === "company" ? companyName : employerName)
          : providerName;

      const { user } = await registerUser({
        name:    name || fullName,
        email,
        password,
        phone,
        role:    selectedRole,
        company: selectedRole === "employer" ? (companyName || employerName) : "",
        skills:  selectedRole === "service_provider" ? skill : "",
      });

      setLoading(false);

      // Route based on role
      if (selectedRole === "employer" || selectedRole === "service_provider") {
        router.replace(selectedRole === "employer" ? "/employer-dashboard" : "/service-dashboard");
      } else {
        router.replace("/(tabs)");
      }
    } catch (e) {
      setLoading(false);
      setError(e.message || "Registration failed. Please try again.");
    }
  };

  const sharedProps = { focusField, setFocusField, setError };

  const getRoleBadge = () => {
    if (selectedRole === "job_seeker")       return { bg: C.primaryBg, text: C.primary, label: "Job Seeker" };
    if (selectedRole === "employer")         return { bg: C.greenBg, text: C.green, label: "Client/Employer" };
    if (selectedRole === "service_provider") return { bg: C.orangeBg, text: C.orange, label: "Service Provider" };
  };
  const badge = getRoleBadge();

  const getRegisterBtnLabel = () => {
    if (selectedRole === "employer" && employerType === "company") return "Create Company Account";
    if (selectedRole === "employer" && employerType === "individual") return "Create Client Account";
    return "Create Account";
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 50 + kb.keyboardHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View
          pointerEvents="none"
          style={[styles.header, {
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
          }]}
        >
          <View style={styles.logoBox}>
            <Image source={require("../assets/logo-mark.png")} style={styles.logoImg} resizeMode="contain" />
          </View>
          <Text style={styles.brandName}>Job<Text style={{ color: C.orange }}>Eka</Text></Text>
          <Text style={styles.brandTagline}>Create Your Account</Text>
        </Animated.View>

        {/* ── Card ── */}
        <Animated.View
          collapsable={false}
          style={[styles.card, {
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          }]}
        >
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Get Started</Text>
            <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.roleBadgeText, { color: badge.text }]}>{badge.label}</Text>
            </View>
          </View>
          <Text style={styles.cardSub}>Join thousands finding jobs in Sri Lanka</Text>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={14} color={C.error} />
              <Text style={styles.errorText}>  {error}</Text>
            </View>
          )}

          {/* ── Role Selector ── */}
          <Text style={styles.sectionLabel}>I AM A</Text>
          <View style={styles.roleRow}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[styles.roleCard, selectedRole === role.id && styles.roleCardActive]}
                onPress={() => handleRoleChange(role.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={role.icon}
                  size={20}
                  color={selectedRole === role.id ? C.primary : C.textLight}
                />
                <Text style={[styles.roleLabel, selectedRole === role.id && styles.roleLabelActive]}>
                  {role.label}
                </Text>
                <Text style={[styles.roleDesc, selectedRole === role.id && styles.roleDescActive]}>
                  {role.desc}
                </Text>
                {selectedRole === role.id && (
                  <View style={styles.roleCheck}>
                    <Ionicons name="checkmark-circle" size={14} color={C.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Dynamic Fields ── */}
          <Animated.View collapsable={false} style={{ opacity: fieldsFade }}>

            {/* JOB SEEKER */}
            {selectedRole === "job_seeker" && (
              <InputField
                label="FULL NAME"
                icon="person-outline"
                value={fullName}
                onChangeText={setFullName}
                field="fullname"
                placeholder="Your full name"
                {...sharedProps}
              />
            )}

            {/* EMPLOYER — show sub-type selector first */}
            {selectedRole === "employer" && (
              <>
                {/* Sub-type: Individual vs Company */}
                <EmployerTypeSelector
                  employerType={employerType}
                  setEmployerType={setEmployerType}
                />

                {/* Individual name */}
                {employerType === "individual" && (
                  <InputField
                    label="YOUR NAME"
                    icon="person-outline"
                    value={employerName}
                    onChangeText={setEmployerName}
                    field="employername"
                    placeholder="e.g. Kamal Silva"
                    {...sharedProps}
                  />
                )}

                {/* Company name */}
                {employerType === "company" && (
                  <InputField
                    label="COMPANY NAME"
                    icon="business-outline"
                    value={companyName}
                    onChangeText={setCompanyName}
                    field="companyname"
                    placeholder="e.g. ABC Solutions (Pvt) Ltd"
                    {...sharedProps}
                  />
                )}
              </>
            )}

            {/* SERVICE PROVIDER */}
            {selectedRole === "service_provider" && (
              <>
                <InputField
                  label="YOUR NAME"
                  icon="person-outline"
                  value={providerName}
                  onChangeText={setProviderName}
                  field="providername"
                  placeholder="Your full name"
                  {...sharedProps}
                />
                <InputField
                  label="MAIN SKILL"
                  icon="hammer-outline"
                  value={skill}
                  onChangeText={setSkill}
                  field="skill"
                  placeholder="e.g. Electrician, Plumber, Driver"
                  {...sharedProps}
                />
              </>
            )}

            {/* Common fields — ALL roles */}
            <InputField
              label="EMAIL ADDRESS"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              field="email"
              placeholder="you@example.com"
              keyboardType="email-address"
              {...sharedProps}
            />
            <InputField
              label="PHONE NUMBER"
              icon="phone-portrait-outline"
              value={phone}
              onChangeText={setPhone}
              field="phone"
              placeholder="+94 7X XXX XXXX"
              keyboardType="phone-pad"
              maxLength={12}
              {...sharedProps}
            />
            <InputField
              label="LOCATION"
              icon="location-outline"
              value={location}
              onChangeText={setLocation}
              field="location"
              placeholder="e.g. Colombo, Kandy, Galle"
              {...sharedProps}
            />
            <InputField
              label="PASSWORD"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              field="password"
              placeholder="Min. 6 characters"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightPress={() => setShowPassword(!showPassword)}
              {...sharedProps}
            />
            <InputField
              label="CONFIRM PASSWORD"
              icon="shield-checkmark-outline"
              value={confirmPass}
              onChangeText={setConfirmPass}
              field="confirm"
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? "eye-off-outline" : "eye-outline"}
              onRightPress={() => setShowConfirm(!showConfirm)}
              returnKeyType="done"
              {...sharedProps}
            />
          </Animated.View>

          {/* Terms */}
          <View style={styles.termsRow}>
            <Ionicons name="information-circle-outline" size={13} color={C.textLight} />
            <Text style={styles.termsText}>
              {"  "}By registering, you agree to our{" "}
              <Text style={styles.termsLink}>Terms</Text>{" "}&{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : (
                <View style={styles.btnInner}>
                  <Text style={styles.registerBtnText}>{getRegisterBtnLabel()}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              )
            }
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation?.goBack()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>

        {/* Footer */}
        <Animated.View pointerEvents="none" style={[styles.footer, { opacity: badgeFade }]}>
          <Ionicons name="shield-checkmark-outline" size={12} color={C.textLight} />
          <Text style={styles.footerText}>  Secure & Private  ·  </Text>
          <Text style={styles.footerPowered}>
            Powered by <Text style={styles.footerBrand}>JobEka</Text>
          </Text>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

// ─────────────────────────── STYLES ───────────────────────────
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

  header: { alignItems: "center", marginBottom: 28 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12, elevation: 12,
  },
  logoImg: { width: 46, height: 46 },
  brandName: { fontSize: 28, fontWeight: "800", color: C.text, letterSpacing: 1.5 },
  brandTagline: { fontSize: 13, color: C.green, marginTop: 4, fontWeight: "500" },

  card: {
    width: "100%", backgroundColor: C.card,
    borderRadius: 28, padding: 24,
    borderWidth: 1, borderColor: C.border, elevation: 15,
  },
  cardTitleRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", color: C.text },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleBadgeText: { fontSize: 11, fontWeight: "700" },
  cardSub: { fontSize: 13, color: C.textSub, marginBottom: 22 },

  errorBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { color: C.error, fontSize: 13, fontWeight: "500" },

  sectionLabel: {
    color: C.textMuted, fontSize: 11,
    fontWeight: "600", marginBottom: 10, letterSpacing: 0.8,
  },

  roleRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  roleCard: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: C.inputBg, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    padding: 10, gap: 4, position: "relative",
  },
  roleCardActive: { borderColor: C.primary, backgroundColor: C.primaryBg },
  roleLabel: { fontSize: 11, fontWeight: "700", color: C.textLight, textAlign: "center" },
  roleLabelActive: { color: C.text },
  roleDesc: { fontSize: 9, color: C.textFaint, textAlign: "center" },
  roleDescActive: { color: C.textSub },
  roleCheck: { position: "absolute", top: 6, right: 6 },

  // Employer type selector
  empTypeContainer: { marginBottom: 16 },
  empTypeRow: { flexDirection: "row", gap: 12 },
  empTypeCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.inputBg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.border,
    paddingVertical: 18,
    paddingHorizontal: 10,
    gap: 8,
    position: "relative",
  },
  empTypeCardActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryBg,
  },
  tickBox: {
    position: "absolute",
    top: 10, right: 10,
    width: 20, height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  tickBoxActive: {
    borderColor: C.primary,
    backgroundColor: C.primary,
  },
  empTypeLabel: {
    fontSize: 14, fontWeight: "700",
    color: C.textLight, textAlign: "center",
  },
  empTypeLabelActive: { color: C.text },
  empTypeDesc: {
    fontSize: 10, color: C.textFaint,
    textAlign: "center", lineHeight: 14,
  },
  empTypeDescActive: { color: C.textSub },

  inputGroup: { marginBottom: 14 },
  inputLabel: {
    color: C.textMuted, fontSize: 11,
    fontWeight: "600", marginBottom: 7, letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.inputBg, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, height: 52,
  },
  inputFocused: { borderColor: C.primary, backgroundColor: C.primaryBg },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: C.text, fontSize: 15, height: 52, paddingVertical: 0 },
  eyeBtn: { padding: 4 },

  termsRow: {
    flexDirection: "row", alignItems: "flex-start",
    marginBottom: 20, marginTop: 4,
  },
  termsText: { flex: 1, color: C.textLight, fontSize: 12, lineHeight: 18 },
  termsLink: { color: C.primary, fontWeight: "600" },

  registerBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    height: 54, alignItems: "center", justifyContent: "center", elevation: 10,
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  registerBtnText: { color: C.onPrimary, fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },

  loginRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 20,
  },
  loginText: { color: C.textLight, fontSize: 14 },
  loginLink: { color: C.green, fontSize: 14, fontWeight: "700" },

  footer: { marginTop: 28, flexDirection: "row", alignItems: "center" },
  footerText: { color: C.textLight, fontSize: 12 },
  footerPowered: { color: C.textLight, fontSize: 12 },
  footerBrand: { color: C.primary, fontWeight: "700", fontSize: 12 },
});

// Pre-built styles for both themes; the screen picks one on every render
const STYLES = { dark: makeStyles(AUTH.dark), light: makeStyles(AUTH.light) };
let styles = STYLES.light;
let C = AUTH.light;
