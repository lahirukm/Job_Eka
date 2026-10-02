import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, Alert, Share, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

// Nav bar height — used for ScrollView bottom padding
const NAV_H = Platform.OS === "ios" ? 100 : 80;

const STEPS = [
  { id: 1, label: "Personal",   icon: "person-outline"        },
  { id: 2, label: "Education",  icon: "school-outline"        },
  { id: 3, label: "Experience", icon: "briefcase-outline"     },
  { id: 4, label: "Skills",     icon: "star-outline"          },
  { id: 5, label: "Preview",    icon: "document-text-outline" },
];

const SKILL_SUGGESTIONS = [
  "React Native", "JavaScript", "Python", "Node.js", "SQL",
  "Figma", "Photoshop", "MS Office", "Communication", "Leadership",
  "Team Work", "Problem Solving", "English", "Sinhala", "Tamil",
  "AutoCAD", "Excel", "Project Management", "Customer Service", "Sales",
];

const CV_TEMPLATES = [
  { id: "modern",       label: "Modern",       color: "#2563EB" },
  { id: "professional", label: "Professional", color: "#059669" },
  { id: "creative",     label: "Creative",     color: "#7C3AED" },
];

// ─────────────────────────────────────────────────────────────
// InputField — OUTSIDE main component (prevents keyboard hide)
// ─────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChangeText, placeholder, multiline, keyboardType, T, isDark }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: T.textSub, marginBottom: 6, letterSpacing: 0.5 }}>
        {label}
      </Text>
      <View style={{
        backgroundColor: isDark ? "#0D1525" : "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: focused ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
        height: multiline ? 90 : 50,
        paddingHorizontal: 14,
        justifyContent: "center",
      }}>
        <TextInput
          style={{
            color: T.text,
            fontSize: 14,
            height: multiline ? 90 : 50,
            textAlignVertical: multiline ? "top" : "center",
            paddingVertical: multiline ? 10 : 0,
          }}
          placeholder={placeholder}
          placeholderTextColor={T.textLight}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType || "default"}
          autoCapitalize="none"
          autoCorrect={false}
          editable={true}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          underlineColorAndroid="transparent"
          collapsable={false}
        />
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// StepIndicator — OUTSIDE
// ─────────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep, T, isDark }) => (
  <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12 }}>
    {STEPS.map((step, i) => {
      const isDone   = currentStep > step.id;
      const isActive = currentStep === step.id;
      return (
        <View key={step.id} style={{ alignItems: "center", flex: 1, position: "relative" }}>
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            alignItems: "center", justifyContent: "center",
            borderWidth: 2, marginBottom: 4,
            backgroundColor: isDone ? T.green : isActive ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
            borderColor: isDone ? T.green : isActive ? T.primary : (isDark ? "#2D4060" : "#D1D5DB"),
          }}>
            {isDone
              ? <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              : <Ionicons name={step.icon} size={13} color={isActive ? "#FFFFFF" : (isDark ? "#4A5568" : "#9CA3AF")} />
            }
          </View>
          <Text style={{
            fontSize: 9, textAlign: "center",
            color: isActive ? T.primary : isDone ? T.green : T.textLight,
            fontWeight: isActive ? "700" : "400",
          }}>{step.label}</Text>
          {i < STEPS.length - 1 && (
            <View style={{
              position: "absolute", top: 15, left: "60%", right: "-60%", height: 2,
              backgroundColor: isDone ? T.green : (isDark ? "#1E2D40" : "#E5E7EB"),
            }} />
          )}
        </View>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────────────────────
// CVPreview — OUTSIDE
// ─────────────────────────────────────────────────────────────
const CVPreview = ({ data, template, T, isDark }) => {
  const tColor = CV_TEMPLATES.find((t) => t.id === template)?.color || "#2563EB";
  return (
    <ScrollView style={{ backgroundColor: isDark ? "#111827" : "#FFFFFF", borderRadius: 16 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
      <View style={{ backgroundColor: tColor, padding: 20, alignItems: "center" }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          <Ionicons name="person" size={30} color="#FFFFFF" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 }}>{data.fullName || "Your Name"}</Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 8 }}>{data.jobTitle || "Job Title"}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {data.email    ? <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>✉ {data.email}</Text>    : null}
          {data.phone    ? <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>📱 {data.phone}</Text>    : null}
          {data.location ? <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>📍 {data.location}</Text> : null}
        </View>
      </View>
      <View style={{ padding: 16 }}>
        {data.summary ? (
          <View style={{ marginBottom: 14 }}>
            <View style={{ borderLeftWidth: 3, borderColor: tColor, paddingLeft: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: tColor, textTransform: "uppercase", letterSpacing: 0.8 }}>Profile Summary</Text>
            </View>
            <Text style={{ fontSize: 12, lineHeight: 18, color: isDark ? "#D1D5DB" : "#374151" }}>{data.summary}</Text>
          </View>
        ) : null}
        {(data.eduDegree || data.eduInstitute) ? (
          <View style={{ marginBottom: 14 }}>
            <View style={{ borderLeftWidth: 3, borderColor: tColor, paddingLeft: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: tColor, textTransform: "uppercase", letterSpacing: 0.8 }}>Education</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: "700", marginBottom: 2, color: isDark ? "#F9FAFB" : "#111827" }}>{data.eduDegree}</Text>
            <Text style={{ fontSize: 12, marginBottom: 2, color: isDark ? "#9CA3AF" : "#6B7280" }}>{data.eduInstitute}</Text>
            {data.eduYear  ? <Text style={{ fontSize: 11, color: isDark ? "#6B7280" : "#9CA3AF" }}>{data.eduYear}</Text>  : null}
            {data.eduGrade ? <Text style={{ fontSize: 12, color: isDark ? "#D1D5DB" : "#374151" }}>Grade: {data.eduGrade}</Text> : null}
          </View>
        ) : null}
        {(data.expTitle || data.expCompany) ? (
          <View style={{ marginBottom: 14 }}>
            <View style={{ borderLeftWidth: 3, borderColor: tColor, paddingLeft: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: tColor, textTransform: "uppercase", letterSpacing: 0.8 }}>Work Experience</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: "700", marginBottom: 2, color: isDark ? "#F9FAFB" : "#111827" }}>{data.expTitle}</Text>
            <Text style={{ fontSize: 12, marginBottom: 2, color: isDark ? "#9CA3AF" : "#6B7280" }}>{data.expCompany}</Text>
            {data.expPeriod ? <Text style={{ fontSize: 11, color: isDark ? "#6B7280" : "#9CA3AF", marginBottom: 4 }}>{data.expPeriod}</Text> : null}
            {data.expDesc   ? <Text style={{ fontSize: 12, lineHeight: 18, color: isDark ? "#D1D5DB" : "#374151" }}>{data.expDesc}</Text>   : null}
          </View>
        ) : null}
        {data.skills?.length > 0 ? (
          <View style={{ marginBottom: 14 }}>
            <View style={{ borderLeftWidth: 3, borderColor: tColor, paddingLeft: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: tColor, textTransform: "uppercase", letterSpacing: 0.8 }}>Skills</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {data.skills.map((sk, i) => (
                <View key={i} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: tColor + "20", borderWidth: 1, borderColor: tColor + "44" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: tColor }}>{sk}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {data.languages ? (
          <View style={{ marginBottom: 14 }}>
            <View style={{ borderLeftWidth: 3, borderColor: tColor, paddingLeft: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: tColor, textTransform: "uppercase", letterSpacing: 0.8 }}>Languages</Text>
            </View>
            <Text style={{ fontSize: 12, lineHeight: 18, color: isDark ? "#D1D5DB" : "#374151" }}>{data.languages}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function CVGeneratorScreen() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [activeTab,   setActiveTab]   = useState("build");
  const [currentStep, setCurrentStep] = useState(1);
  const [template,    setTemplate]    = useState("modern");
  const [generating,  setGenerating]  = useState(false);
  const [skillInput,  setSkillInput]  = useState("");
  const [skillFocus,  setSkillFocus]  = useState(false);

  const [cvData, setCvData] = useState({
    fullName: "", jobTitle: "", email: "", phone: "",
    location: "", summary: "",
    eduDegree: "", eduInstitute: "", eduYear: "", eduGrade: "",
    expTitle: "", expCompany: "", expPeriod: "", expDesc: "",
    skills: [], languages: "",
  });

  const headerFade   = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep - 1) / (STEPS.length - 1),
      duration: 400, useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const update   = (key, val) => setCvData((prev) => ({ ...prev, [key]: val }));
  const addSkill = (skill) => {
    if (!skill.trim() || cvData.skills.includes(skill)) return;
    update("skills", [...cvData.skills, skill]);
    setSkillInput("");
  };
  const removeSkill = (skill) => update("skills", cvData.skills.filter((s) => s !== skill));

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setCurrentStep(5); }, 1800);
  };

  const handleDownload = () => {
    Alert.alert("Download CV", "Save as PDF?", [
      { text: "Cancel", style: "cancel" },
      { text: "Download PDF", onPress: () => Alert.alert("✅ Saved!", "CV downloaded to your device.") },
    ]);
  };

  const handleShare = async () => {
    try { await Share.share({ message: `Check out my CV — ${cvData.fullName || "JobEka CV"}` }); } catch {}
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      {/* ── HEADER ── */}
      <Animated.View style={[s.header, { backgroundColor: T.bg, opacity: headerFade }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={T.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="document-text" size={20} color={T.primary} />
            <Text style={[s.headerTitle, { color: T.text }]}> CV Generator</Text>
          </View>
          <Text style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>AI Powered Resume Builder</Text>
        </View>
        <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={toggleTheme}>
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={17} color={isDark ? "#F59E0B" : T.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── TABS ── */}
      <View style={[s.tabRow, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
        {[
          { id: "build",  label: "Build CV",   icon: "create-outline"       },
          { id: "upload", label: "Upload & AI", icon: "cloud-upload-outline" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tab, { borderBottomColor: active ? T.primary : "transparent" }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={16} color={active ? T.primary : T.textLight} />
              <Text style={[s.tabText, { color: active ? T.primary : T.textLight }]}> {tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ═══════════════════════════════════
          BUILD TAB
          Layout: flex column
          ├── Progress bar   (fixed)
          ├── Step indicator (fixed)
          ├── ScrollView     (flex:1)
          └── Nav buttons    (fixed bottom)
      ═══════════════════════════════════ */}
      {activeTab === "build" && (
        <View style={{ flex: 1 }}>

          {/* Progress bar */}
          <View style={[s.progressBg, { backgroundColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            <Animated.View style={[s.progressFill, { width: progressWidth, backgroundColor: T.primary }]} />
          </View>

          {/* Step indicator */}
          <View style={[s.stepBox, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            <StepIndicator currentStep={currentStep} T={T} isDark={isDark} />
          </View>

          {/* Scrollable form — flex:1 fills remaining space above nav */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
          >

            {/* STEP 1 — Personal */}
            {currentStep === 1 && (
              <View>
                <Text style={[s.stepTitle, { color: T.text }]}>👤 Personal Information</Text>
                <Text style={[s.stepSub,   { color: T.textSub }]}>Tell employers who you are</Text>
                <InputField label="Full Name *"     value={cvData.fullName}  onChangeText={(v) => update("fullName",  v)} placeholder="e.g. Kamal Perera"              T={T} isDark={isDark} />
                <InputField label="Job Title"       value={cvData.jobTitle}  onChangeText={(v) => update("jobTitle",  v)} placeholder="e.g. Software Engineer"         T={T} isDark={isDark} />
                <InputField label="Email *"         value={cvData.email}     onChangeText={(v) => update("email",     v)} placeholder="your@email.com"                  keyboardType="email-address" T={T} isDark={isDark} />
                <InputField label="Phone *"         value={cvData.phone}     onChangeText={(v) => update("phone",     v)} placeholder="+94 7X XXX XXXX"                keyboardType="phone-pad"   T={T} isDark={isDark} />
                <InputField label="Location"        value={cvData.location}  onChangeText={(v) => update("location",  v)} placeholder="e.g. Colombo, Sri Lanka"         T={T} isDark={isDark} />
                <InputField label="Profile Summary" value={cvData.summary}   onChangeText={(v) => update("summary",   v)} placeholder="Write a brief summary..."       multiline T={T} isDark={isDark} />
              </View>
            )}

            {/* STEP 2 — Education */}
            {currentStep === 2 && (
              <View>
                <Text style={[s.stepTitle, { color: T.text }]}>🎓 Education</Text>
                <Text style={[s.stepSub,   { color: T.textSub }]}>Your academic background</Text>
                <InputField label="Degree / Qualification *" value={cvData.eduDegree}    onChangeText={(v) => update("eduDegree",    v)} placeholder="e.g. BSc Computer Science"    T={T} isDark={isDark} />
                <InputField label="Institution *"             value={cvData.eduInstitute} onChangeText={(v) => update("eduInstitute", v)} placeholder="e.g. University of Colombo"   T={T} isDark={isDark} />
                <InputField label="Year"                      value={cvData.eduYear}      onChangeText={(v) => update("eduYear",      v)} placeholder="e.g. 2018 - 2022"             T={T} isDark={isDark} />
                <InputField label="Grade / GPA"               value={cvData.eduGrade}     onChangeText={(v) => update("eduGrade",     v)} placeholder="e.g. Second Upper / 3.5 GPA" T={T} isDark={isDark} />
              </View>
            )}

            {/* STEP 3 — Experience */}
            {currentStep === 3 && (
              <View>
                <Text style={[s.stepTitle, { color: T.text }]}>💼 Work Experience</Text>
                <Text style={[s.stepSub,   { color: T.textSub }]}>Your professional history</Text>
                <InputField label="Job Title"    value={cvData.expTitle}   onChangeText={(v) => update("expTitle",   v)} placeholder="e.g. Junior Developer"          T={T} isDark={isDark} />
                <InputField label="Company"      value={cvData.expCompany} onChangeText={(v) => update("expCompany", v)} placeholder="e.g. ABC Solutions"              T={T} isDark={isDark} />
                <InputField label="Period"       value={cvData.expPeriod}  onChangeText={(v) => update("expPeriod",  v)} placeholder="e.g. Jan 2022 - Present"         T={T} isDark={isDark} />
                <InputField label="Description"  value={cvData.expDesc}    onChangeText={(v) => update("expDesc",    v)} placeholder="Describe your responsibilities..." multiline T={T} isDark={isDark} />
                <View style={[s.infoBox, { backgroundColor: isDark ? "#0D1525" : "#F8FAFC", borderColor: isDark ? "#1E2D40" : "#E2E8F0" }]}>
                  <Ionicons name="information-circle-outline" size={16} color={T.primary} />
                  <Text style={[s.infoText, { color: T.textSub }]}>  No experience? Leave blank — freshers welcome!</Text>
                </View>
              </View>
            )}

            {/* STEP 4 — Skills */}
            {currentStep === 4 && (
              <View>
                <Text style={[s.stepTitle, { color: T.text }]}>⭐ Skills & Languages</Text>
                <Text style={[s.stepSub,   { color: T.textSub }]}>Showcase your abilities</Text>

                {/* Template */}
                <Text style={[s.subLabel, { color: T.textSub }]}>CV TEMPLATE</Text>
                <View style={s.templateRow}>
                  {CV_TEMPLATES.map((tmpl) => (
                    <TouchableOpacity
                      key={tmpl.id}
                      style={[s.templateCard, {
                        borderColor:     template === tmpl.id ? tmpl.color : chipBorder,
                        backgroundColor: template === tmpl.id ? tmpl.color + (isDark ? "22" : "15") : chipBg,
                      }]}
                      onPress={() => setTemplate(tmpl.id)}
                    >
                      <View style={[s.templateDot, { backgroundColor: tmpl.color }]} />
                      <Text style={{ fontSize: 12, fontWeight: "700", color: template === tmpl.id ? tmpl.color : chipColor }}>
                        {tmpl.label}
                      </Text>
                      {template === tmpl.id && <Ionicons name="checkmark-circle" size={16} color={tmpl.color} />}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Skill input */}
                <Text style={[s.subLabel, { color: T.textSub, marginTop: 16 }]}>ADD SKILLS</Text>
                <View style={[s.skillInputRow, {
                  backgroundColor: isDark ? "#0D1525" : "#F9FAFB",
                  borderColor: skillFocus ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
                }]}>
                  <TextInput
                    style={[s.skillInputText, { color: T.text }]}
                    placeholder="Type skill and press +"
                    placeholderTextColor={T.textLight}
                    value={skillInput}
                    onChangeText={setSkillInput}
                    editable={true}
                    onFocus={() => setSkillFocus(true)}
                    onBlur={() => setSkillFocus(false)}
                    underlineColorAndroid="transparent"
                    onSubmitEditing={() => addSkill(skillInput)}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={[s.addBtn, { backgroundColor: T.primary }]} onPress={() => addSkill(skillInput)}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Suggestions */}
                <Text style={[s.subLabel, { color: T.textSub, marginTop: 12 }]}>QUICK ADD</Text>
                <View style={s.suggestWrap}>
                  {SKILL_SUGGESTIONS.filter((sk) => !cvData.skills.includes(sk)).slice(0, 12).map((sk) => (
                    <TouchableOpacity
                      key={sk}
                      style={[s.suggestChip, { backgroundColor: chipBg, borderColor: chipBorder }]}
                      onPress={() => addSkill(sk)}
                    >
                      <Ionicons name="add-circle-outline" size={12} color={chipColor} />
                      <Text style={{ fontSize: 12, color: chipColor }}> {sk}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Added skills */}
                {cvData.skills.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[s.subLabel, { color: T.textSub }]}>YOUR SKILLS ({cvData.skills.length})</Text>
                    <View style={s.skillsWrap}>
                      {cvData.skills.map((sk) => (
                        <TouchableOpacity
                          key={sk}
                          style={[s.skillChip, { backgroundColor: T.primaryBg, borderColor: T.primary + "44" }]}
                          onPress={() => removeSkill(sk)}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "600", color: T.primary }}>{sk}</Text>
                          <Ionicons name="close-circle" size={14} color={T.primary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <InputField label="Languages" value={cvData.languages} onChangeText={(v) => update("languages", v)} placeholder="e.g. Sinhala (Native), English (Fluent)" T={T} isDark={isDark} />
              </View>
            )}

            {/* STEP 5 — Preview */}
            {currentStep === 5 && (
              <View>
                <Text style={[s.stepTitle, { color: T.text }]}>👁️ Preview & Download</Text>
                <Text style={[s.stepSub,   { color: T.textSub }]}>Review your CV before downloading</Text>

                <View style={[s.previewBox, { borderColor: isDark ? "#1E2D40" : "#E5E7EB", height: height * 0.46 }]}>
                  <CVPreview data={cvData} template={template} T={T} isDark={isDark} />
                </View>

                <View style={s.dlRow}>
                  <TouchableOpacity style={[s.dlBtn, { backgroundColor: T.primary }]} onPress={handleDownload}>
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    <Text style={s.dlBtnText}>Download PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.shareBtn, { backgroundColor: isDark ? "#1E2D40" : "#F3F4F6", borderColor: isDark ? "#2D4060" : "#D1D5DB" }]} onPress={handleShare}>
                    <Ionicons name="share-outline" size={20} color={T.text} />
                    <Text style={[s.shareBtnText, { color: T.text }]}>Share</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[s.editBtn, { borderColor: T.primary }]} onPress={() => setCurrentStep(1)}>
                  <Ionicons name="create-outline" size={18} color={T.primary} />
                  <Text style={[s.editBtnText, { color: T.primary }]}> Edit CV</Text>
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>

          {/* ── NAV BUTTONS — fixed at bottom, OUTSIDE ScrollView ── */}
          {currentStep < 5 && (
            <View style={[s.navBar, {
              backgroundColor: T.surface,
              borderTopColor: isDark ? "#1E2D40" : "#E5E7EB",
            }]}>
              {currentStep > 1 ? (
                <TouchableOpacity
                  style={[s.backBtnNav, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
                  onPress={() => setCurrentStep((p) => p - 1)}
                >
                  <Ionicons name="arrow-back" size={18} color={T.text} />
                  <Text style={[s.backBtnNavText, { color: T.text }]}> Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 10 }} />
              )}

              <TouchableOpacity
                style={[s.nextBtnNav, { backgroundColor: generating ? T.green : T.primary }]}
                onPress={currentStep === 4 ? handleGenerate : () => setCurrentStep((p) => p + 1)}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Ionicons name="hourglass-outline" size={18} color="#FFFFFF" />
                    <Text style={s.nextBtnNavText}> Generating...</Text>
                  </>
                ) : currentStep === 4 ? (
                  <>
                    <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
                    <Text style={s.nextBtnNavText}> Generate CV</Text>
                  </>
                ) : (
                  <>
                    <Text style={s.nextBtnNavText}>Next </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ═══════════════════════════════════
          UPLOAD TAB
      ═══════════════════════════════════ */}
      {activeTab === "upload" && (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={[s.stepTitle, { color: T.text }]}>🤖 Upload & AI Improve</Text>
          <Text style={[s.stepSub,   { color: T.textSub }]}>Upload your CV — AI will enhance it</Text>

          <TouchableOpacity
            style={[s.uploadBox, { backgroundColor: T.surface, borderColor: T.primary + "66" }]}
            onPress={() => Alert.alert("Upload CV", "File picker will open here.\n(Requires expo-document-picker)")}
          >
            <View style={[s.uploadIcon, { backgroundColor: T.primaryBg }]}>
              <Ionicons name="cloud-upload-outline" size={40} color={T.primary} />
            </View>
            <Text style={[s.uploadTitle, { color: T.text }]}>Tap to Upload CV</Text>
            <Text style={{ fontSize: 13, color: T.textSub }}>Supports PDF, Word (.doc, .docx)</Text>
            <View style={[s.uploadBtn, { backgroundColor: T.primary }]}>
              <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>Choose File</Text>
            </View>
          </TouchableOpacity>

          <Text style={[s.subLabel, { color: T.textSub, marginTop: 20 }]}>🤖 AI WILL IMPROVE</Text>
          {[
            { icon: "checkmark-circle-outline", label: "Fix grammar & spelling",      color: T.green   },
            { icon: "trending-up-outline",       label: "Optimize for ATS systems",    color: T.primary },
            { icon: "star-outline",              label: "Add missing keywords",         color: T.orange  },
            { icon: "resize-outline",            label: "Improve formatting",           color: T.purple  },
            { icon: "bulb-outline",              label: "Suggest better descriptions",  color: "#D97706" },
          ].map((item, i) => (
            <View key={i} style={[s.aiRow, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
              <View style={[s.aiIcon, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[s.aiLabel, { color: T.text }]}>{item.label}</Text>
              <Ionicons name="checkmark" size={16} color={T.green} />
            </View>
          ))}

          <TouchableOpacity style={[s.switchBtn, { borderColor: T.primary }]} onPress={() => setActiveTab("build")}>
            <Ionicons name="create-outline" size={18} color={T.primary} />
            <Text style={[s.switchBtnText, { color: T.primary }]}> Build from scratch instead</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

// ─────────────────────────── STYLES ───────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  iconBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },

  tabRow: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 16, borderRadius: 12, overflow: "hidden", elevation: 2, marginBottom: 4 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderBottomWidth: 2, gap: 6 },
  tabText: { fontSize: 13, fontWeight: "600" },

  progressBg: { height: 4, marginHorizontal: 16, borderRadius: 2, marginTop: 6, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },

  stepBox: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, marginTop: 8, elevation: 2, marginBottom: 4 },

  stepTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  stepSub:   { fontSize: 13, marginBottom: 18 },
  subLabel:  { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },

  infoBox:  { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, marginTop: 8 },
  infoText: { fontSize: 12, flex: 1 },

  templateRow:  { flexDirection: "row", gap: 10 },
  templateCard: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1.5, paddingVertical: 10, gap: 6 },
  templateDot:  { width: 10, height: 10, borderRadius: 5 },

  skillInputRow:  { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, height: 48, gap: 8 },
  skillInputText: { flex: 1, fontSize: 14, height: 48, paddingVertical: 0 },
  addBtn:         { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  suggestWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  skillsWrap:  { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  skillChip:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, gap: 4 },

  previewBox: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  dlRow:    { flexDirection: "row", gap: 12, marginBottom: 12 },
  dlBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 14, gap: 8, elevation: 4 },
  dlBtnText:{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 20, height: 50, borderRadius: 14, borderWidth: 1, gap: 6 },
  shareBtnText: { fontSize: 14, fontWeight: "600" },
  editBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 44, borderRadius: 12, borderWidth: 1.5 },
  editBtnText:  { fontSize: 14, fontWeight: "600" },

  // ── Nav bar — FIXED at bottom, part of flex column
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
    gap: 12,
    elevation: 10,
  },
  backBtnNav:     { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, paddingHorizontal: 22, borderRadius: 14, borderWidth: 1.5 },
  backBtnNavText: { fontSize: 14, fontWeight: "600" },
  nextBtnNav:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 14, gap: 6, elevation: 4 },
  nextBtnNavText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  uploadBox:   { borderRadius: 20, borderWidth: 2, borderStyle: "dashed", padding: 30, alignItems: "center", gap: 10, marginBottom: 16 },
  uploadIcon:  { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  uploadTitle: { fontSize: 18, fontWeight: "700" },
  uploadBtn:   { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, marginTop: 4 },

  aiRow:   { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 8, gap: 12 },
  aiIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  aiLabel: { flex: 1, fontSize: 14, fontWeight: "500" },

  switchBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, borderRadius: 14, borderWidth: 1.5, marginTop: 16 },
  switchBtnText: { fontSize: 14, fontWeight: "600" },
});
