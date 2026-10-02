import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, Modal, Platform, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

// ── Interview Q&A data
const QUESTIONS = {
  General: [
    { q: "Tell me about yourself.",                                    a: "Start with your current role, highlight 2-3 key achievements, mention your skills, and connect them to the position you're applying for. Keep it under 2 minutes." },
    { q: "What are your greatest strengths?",                          a: "Choose strengths relevant to the job. Give specific examples. E.g., 'I'm great at problem solving — I reduced load time by 40% at my last job.'" },
    { q: "What is your biggest weakness?",                             a: "Choose a real weakness but show you're actively improving it. E.g., 'I used to struggle with public speaking, so I joined a Toastmasters club and now lead team presentations.'" },
    { q: "Why do you want to work here?",                              a: "Research the company. Mention specific values, products, or projects. Show how your goals align with their mission." },
    { q: "Where do you see yourself in 5 years?",                      a: "Show ambition but stay realistic. Mention growth within the company. E.g., 'I'd like to grow into a senior role and contribute to major product decisions.'" },
  ],
  IT: [
    { q: "Explain the difference between REST and GraphQL.",            a: "REST uses fixed endpoints for each resource; GraphQL uses a single endpoint where clients specify exactly what data they need, reducing over/under-fetching." },
    { q: "What is the difference between == and === in JavaScript?",    a: "== checks value with type coercion (e.g., '5'==5 is true). === checks both value and type strictly (e.g., '5'===5 is false)." },
    { q: "What is a deadlock in databases?",                           a: "A deadlock occurs when two or more transactions wait for each other to release locks, creating a cycle that prevents any of them from proceeding." },
    { q: "Explain the SOLID principles.",                              a: "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion — five principles for writing maintainable OOP code." },
    { q: "What is the difference between SQL and NoSQL?",              a: "SQL databases are relational with fixed schemas (e.g., MySQL). NoSQL are non-relational, flexible schema databases (e.g., MongoDB) suited for unstructured data." },
  ],
  Finance: [
    { q: "What is the difference between assets and liabilities?",     a: "Assets are resources owned by a company that have economic value (cash, property). Liabilities are obligations owed to others (loans, payables)." },
    { q: "Explain working capital.",                                   a: "Working capital = Current Assets - Current Liabilities. It measures a company's short-term liquidity and ability to cover short-term obligations." },
    { q: "What is NPV and why is it important?",                       a: "Net Present Value calculates the present value of future cash flows minus initial investment. A positive NPV means the investment adds value to the company." },
    { q: "What is the difference between cash and accrual accounting?", a: "Cash accounting records transactions when cash changes hands. Accrual accounting records when the transaction occurs, regardless of when cash is received." },
    { q: "Explain depreciation.",                                      a: "Depreciation allocates the cost of a tangible asset over its useful life, reflecting wear and tear and reducing taxable income each year." },
  ],
  HR: [
    { q: "How do you handle a conflict between two employees?",        a: "Meet with each party separately first, then together. Focus on the issue not personalities. Encourage active listening and find a mutually agreeable solution." },
    { q: "What is your approach to employee onboarding?",              a: "Create a structured plan covering company culture, role expectations, tools/systems training, and mentoring. Gather feedback at 30/60/90 days." },
    { q: "How do you measure employee performance?",                   a: "Use SMART KPIs aligned with company goals. Combine quantitative metrics with qualitative assessments through regular 1:1s and annual reviews." },
    { q: "What strategies do you use for talent retention?",           a: "Competitive compensation, clear growth paths, recognition programs, flexible work, and a positive culture. Regular engagement surveys to identify issues early." },
    { q: "Describe your recruitment process.",                         a: "Define requirements → post job → screen applications → phone screen → technical/HR interview → reference check → offer. Use ATS to manage pipeline." },
  ],
  Marketing: [
    { q: "What is a USP and how do you identify it?",                  a: "Unique Selling Proposition is what makes your product/service different. Identify it by analyzing competitors, customer feedback, and your core strengths." },
    { q: "Explain the marketing funnel.",                              a: "Awareness → Interest → Consideration → Intent → Purchase → Loyalty. Different strategies apply at each stage to guide customers toward conversion." },
    { q: "What metrics do you track for digital marketing?",           a: "CTR, CPC, conversion rate, CAC, CLV, ROAS, bounce rate, organic traffic, and social media engagement depending on the campaign goals." },
    { q: "How do you approach a product launch?",                      a: "Market research → define target audience → set goals → create messaging → choose channels → create content → launch → measure → optimize." },
    { q: "What is A/B testing and when do you use it?",                a: "Comparing two versions of content (A vs B) to see which performs better. Use it to optimize emails, landing pages, CTAs, and ad creatives." },
  ],
  Design: [
    { q: "Walk me through your design process.",                       a: "Research → Define problem → Ideate → Wireframe → Prototype → Test → Iterate → Handoff. Always start with understanding the user's needs and pain points." },
    { q: "What is the difference between UX and UI design?",           a: "UX (User Experience) focuses on the overall feel and usability — research, flows, wireframes. UI (User Interface) focuses on visual elements — colors, typography, components." },
    { q: "How do you handle design feedback?",                         a: "Separate personal feelings from the work. Ask clarifying questions to understand the reasoning. Prioritize user-centered feedback over personal preference." },
    { q: "Explain accessibility in design.",                           a: "Design for all users including those with disabilities. Follow WCAG guidelines: sufficient color contrast, keyboard navigation, screen reader support, and clear typography." },
    { q: "How do you stay updated with design trends?",                a: "Follow Dribbble, Behance, Nielsen Norman Group, Figma blog, and industry leaders on LinkedIn. Balance trends with timeless design principles." },
  ],
  Management: [
    { q: "How do you prioritize tasks when everything seems urgent?",   a: "Use the Eisenhower Matrix: categorize by urgency and importance. Communicate with stakeholders to manage expectations and delegate where possible." },
    { q: "Describe your leadership style.",                            a: "Describe your style (democratic, coaching, etc.) and adapt to situations. Give an example of how you adjusted your approach for different team members." },
    { q: "How do you handle underperforming team members?",            a: "Have a private, honest conversation. Identify root causes (personal, skill, motivation). Create a performance improvement plan with clear milestones and support." },
    { q: "How do you make difficult decisions with limited information?",a: "Gather available data, consult key stakeholders, consider risks and trade-offs, make the best decision with what you have, and stay open to adjusting course." },
    { q: "What is your approach to change management?",                a: "Communicate the why early and clearly. Involve key people in planning. Address concerns empathetically. Provide training and celebrate early wins." },
  ],
};

const CATEGORIES = ["General", "IT", "Finance", "HR", "Marketing", "Design", "Management"];

const CAT_COLOR = {
  General:    "#64748B",
  IT:         "#2563EB",
  Finance:    "#059669",
  HR:         "#DB2777",
  Marketing:  "#EA580C",
  Design:     "#7C3AED",
  Management: "#0284C7",
};

const TIPS = [
  { icon: "checkmark-circle",   color: "#059669", title: "Research the company",        body: "Spend 30 mins learning about the company's products, values, recent news, and competitors before the interview."       },
  { icon: "checkmark-circle",   color: "#059669", title: "Use the STAR method",          body: "Structure behavioral answers: Situation, Task, Action, Result. Give specific examples with measurable outcomes."          },
  { icon: "checkmark-circle",   color: "#059669", title: "Prepare 3-5 questions to ask", body: "Asking thoughtful questions shows interest. Ask about team culture, growth opportunities, or current challenges."       },
  { icon: "checkmark-circle",   color: "#059669", title: "Dress appropriately",          body: "When in doubt, dress one level above the company's dress code. First impressions are formed in the first 7 seconds."     },
  { icon: "close-circle",       color: "#EF4444", title: "Don't speak negatively",       body: "Never badmouth previous employers or colleagues. Frame past challenges positively as learning experiences."              },
  { icon: "close-circle",       color: "#EF4444", title: "Don't lie or exaggerate",      body: "Interviewers verify claims. Stick to truth but frame your experience positively. Get caught lying = instant rejection."  },
  { icon: "close-circle",       color: "#EF4444", title: "Don't check your phone",       body: "Put your phone on silent and away. Checking it signals disrespect and disinterest to the interviewer."                   },
  { icon: "bulb-outline",       color: "#D97706", title: "Body language matters",        body: "Maintain eye contact, sit up straight, smile naturally, and use hand gestures moderately. Mirror the interviewer's energy."},
  { icon: "bulb-outline",       color: "#D97706", title: "Pause before answering",       body: "Taking 2-3 seconds to think before answering shows thoughtfulness, not hesitation. Never rush into an answer."          },
  { icon: "bulb-outline",       color: "#D97706", title: "Follow up after interview",    body: "Send a thank-you email within 24 hours. Reiterate your interest and mention one specific thing from the conversation."    },
];

// ─────────────────────────────────────────────────────────────
// FlashCard — outside
// ─────────────────────────────────────────────────────────────
const FlashCard = ({ item, index, total, T, isDark, catColor }) => {
  const [revealed, setRevealed] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: revealed ? 0 : 1, tension: 60, friction: 8, useNativeDriver: true,
    }).start();
    setRevealed(!revealed);
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <View style={[fc.card, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
      {/* Counter */}
      <View style={fc.counter}>
        <Text style={[fc.counterText, { color: T.textLight }]}>Question {index + 1} of {total}</Text>
        <View style={[fc.catBadge, { backgroundColor: catColor + "22" }]}>
          <Text style={[fc.catBadgeText, { color: catColor }]}>{item.category || "General"}</Text>
        </View>
      </View>

      {/* Question */}
      <View style={[fc.questionBox, { backgroundColor: catColor + "10", borderColor: catColor + "33" }]}>
        <Ionicons name="help-circle" size={24} color={catColor} />
        <Text style={[fc.questionText, { color: T.text }]}>{item.q}</Text>
      </View>

      {/* Answer */}
      {revealed ? (
        <Animated.View style={[fc.answerBox, {
          backgroundColor: isDark ? "#0D2518" : "#ECFDF5",
          borderColor: "#A7F3D0",
          transform: [{ scaleX: backRotate.interpolate({ inputRange: ["180deg", "360deg"], outputRange: [0, 1] }) }],
        }]}>
          <View style={fc.answerHeader}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={[fc.answerLabel, { color: "#059669" }]}> Sample Answer</Text>
          </View>
          <Text style={[fc.answerText, { color: T.textSub }]}>{item.a}</Text>
        </Animated.View>
      ) : (
        <View style={[fc.hiddenBox, { backgroundColor: isDark ? "#1E2D40" : "#F3F4F6", borderColor: isDark ? "#2D4060" : "#D1D5DB" }]}>
          <Ionicons name="eye-off-outline" size={20} color={T.textLight} />
          <Text style={[fc.hiddenText, { color: T.textLight }]}>Tap below to reveal answer</Text>
        </View>
      )}

      {/* Reveal button */}
      <TouchableOpacity
        style={[fc.revealBtn, { backgroundColor: revealed ? (isDark ? "#0D2518" : "#ECFDF5") : catColor }]}
        onPress={flip}
        activeOpacity={0.8}
      >
        <Ionicons name={revealed ? "eye-off-outline" : "eye-outline"} size={18} color={revealed ? "#059669" : "#FFFFFF"} />
        <Text style={[fc.revealBtnText, { color: revealed ? "#059669" : "#FFFFFF" }]}>
          {revealed ? "  Hide Answer" : "  Reveal Answer"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// ScheduleCard — outside
// ─────────────────────────────────────────────────────────────
const ScheduleCard = ({ item, T, isDark, onDelete }) => {
  const daysLeft = Math.ceil((new Date(item.date) - new Date()) / (1000 * 60 * 60 * 24));
  const isPast   = daysLeft < 0;
  const isToday  = daysLeft === 0;
  const statusColor = isPast ? T.textLight : isToday ? T.orange : T.green;
  const statusLabel = isPast ? "Completed" : isToday ? "Today!" : `${daysLeft}d left`;

  return (
    <View style={[sc.card, { backgroundColor: T.surface, borderColor: isPast ? (isDark ? "#1E2D40" : "#E5E7EB") : (isDark ? "#1A2535" : "#EEF2FF"), borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
      <View style={sc.cardTop}>
        <View style={[sc.logoBox, { backgroundColor: statusColor + "20" }]}>
          <Ionicons name="videocam-outline" size={22} color={statusColor} />
        </View>
        <View style={sc.cardInfo}>
          <Text style={[sc.cardTitle, { color: T.text }]}>{item.company}</Text>
          <Text style={[sc.cardRole, { color: T.textSub }]}>{item.role}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Ionicons name="calendar-outline" size={12} color={T.textLight} />
            <Text style={[sc.cardDate, { color: T.textLight }]}>{item.date}  ·  {item.time}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <View style={[sc.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[sc.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={16} color={T.textLight} />
          </TouchableOpacity>
        </View>
      </View>
      {item.notes ? (
        <Text style={[sc.notes, { color: T.textLight, borderTopColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>📝 {item.notes}</Text>
      ) : null}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function InterviewPrepScreen() {
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [activeTab,     setActiveTab]     = useState("mock");   // mock | schedule | tips
  const [activeCategory,setActiveCategory]= useState("General");
  const [cardIndex,     setCardIndex]     = useState(0);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [schedules,     setSchedules]     = useState([
    { id: "1", company: "ABC Solutions",   role: "Software Engineer", date: "2025-06-10", time: "10:00 AM", notes: "Bring portfolio & ID"           },
    { id: "2", company: "Creative Studio", role: "UI/UX Designer",    date: "2025-06-15", time: "02:00 PM", notes: "Zoom link will be sent by email" },
    { id: "3", company: "FinServe Lanka",  role: "Data Analyst",      date: "2025-05-20", time: "09:30 AM", notes: ""                               },
  ]);

  // Add schedule form
  const [form, setForm] = useState({ company: "", role: "", date: "", time: "", notes: "" });
  const [formFocus, setFormFocus] = useState("");

  const headerFade = useRef(new Animated.Value(0)).current;
  const cardSlide  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const currentQs = (QUESTIONS[activeCategory] || QUESTIONS.General).map((q) => ({ ...q, category: activeCategory }));

  const goNext = () => {
    if (cardIndex < currentQs.length - 1) {
      Animated.sequence([
        Animated.timing(cardSlide, { toValue: -30, duration: 150, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue:   0, duration: 150, useNativeDriver: true }),
      ]).start();
      setCardIndex((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (cardIndex > 0) {
      Animated.sequence([
        Animated.timing(cardSlide, { toValue:  30, duration: 150, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue:   0, duration: 150, useNativeDriver: true }),
      ]).start();
      setCardIndex((p) => p - 1);
    }
  };

  const handleAddSchedule = () => {
    if (!form.company || !form.role || !form.date || !form.time) {
      Alert.alert("Missing fields", "Please fill in Company, Role, Date and Time.");
      return;
    }
    setSchedules((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    setForm({ company: "", role: "", date: "", time: "", notes: "" });
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete?", "Remove this interview?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setSchedules((prev) => prev.filter((s) => s.id !== id)) },
    ]);
  };

  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  // InputField inside modal — defined outside render
  const ModalInput = ({ label, value, onChange, placeholder, field }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: T.textSub, marginBottom: 5, letterSpacing: 0.5 }}>{label}</Text>
      <View style={{
        backgroundColor: isDark ? "#0D1525" : "#F9FAFB",
        borderRadius: 12, borderWidth: 1.5,
        borderColor: formFocus === field ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
        height: 46, paddingHorizontal: 14, justifyContent: "center",
      }}>
        <TextInput
          style={{ color: T.text, fontSize: 14, height: 46 }}
          placeholder={placeholder}
          placeholderTextColor={T.textLight}
          value={value}
          onChangeText={onChange}
          editable={true}
          onFocus={() => setFormFocus(field)}
          onBlur={() => setFormFocus("")}
          underlineColorAndroid="transparent"
          collapsable={false}
        />
      </View>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      {/* ── HEADER ── */}
      <Animated.View style={[s.header, { backgroundColor: T.bg, opacity: headerFade }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={T.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="videocam" size={20} color={T.primary} />
            <Text style={[s.headerTitle, { color: T.text }]}> Interview Prep</Text>
          </View>
          <Text style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>Practice · Schedule · Tips</Text>
        </View>
        <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={toggleTheme}>
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={17} color={isDark ? "#F59E0B" : T.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── TABS ── */}
      <View style={[s.tabRow, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
        {[
          { id: "mock",     label: "Mock Practice", icon: "mic-outline"      },
          { id: "schedule", label: "Schedule",       icon: "calendar-outline" },
          { id: "tips",     label: "Tips",           icon: "bulb-outline"     },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tab, { borderBottomColor: active ? T.primary : "transparent" }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={15} color={active ? T.primary : T.textLight} />
              <Text style={[s.tabText, { color: active ? T.primary : T.textLight }]}> {tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ════════════════════════════
          TAB 1 — MOCK PRACTICE
      ════════════════════════════ */}
      {activeTab === "mock" && (
        <View style={{ flex: 1 }}>
          {/* Category chips */}
          <View style={{ height: 52, justifyContent: "center" }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: "center" }}>
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                const cc = CAT_COLOR[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[s.catChip, {
                      backgroundColor: isActive ? cc : chipBg,
                      borderColor:     isActive ? cc : chipBorder,
                    }]}
                    onPress={() => { setActiveCategory(cat); setCardIndex(0); }}
                  >
                    <Text style={[s.catChipText, { color: isActive ? "#FFFFFF" : chipColor }]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Progress dots */}
          <View style={s.dotsRow}>
            {currentQs.map((_, i) => (
              <View key={i} style={[s.dot, {
                backgroundColor: i === cardIndex ? CAT_COLOR[activeCategory] : (isDark ? "#1E2D40" : "#E5E7EB"),
                width: i === cardIndex ? 18 : 7,
              }]} />
            ))}
          </View>

          {/* Flash card */}
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
            <Animated.View style={{ transform: [{ translateX: cardSlide }] }}>
              <FlashCard
                key={`${activeCategory}-${cardIndex}`}
                item={currentQs[cardIndex]}
                index={cardIndex}
                total={currentQs.length}
                T={T}
                isDark={isDark}
                catColor={CAT_COLOR[activeCategory]}
              />
            </Animated.View>
          </ScrollView>

          {/* Prev / Next nav */}
          <View style={[s.navBar, { backgroundColor: T.surface, borderTopColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            <TouchableOpacity
              style={[s.navPrevBtn, { borderColor: isDark ? "#1E2D40" : "#E5E7EB", opacity: cardIndex === 0 ? 0.4 : 1 }]}
              onPress={goPrev}
              disabled={cardIndex === 0}
            >
              <Ionicons name="arrow-back" size={18} color={T.text} />
              <Text style={[s.navPrevText, { color: T.text }]}> Prev</Text>
            </TouchableOpacity>
            <View style={s.navCounter}>
              <Text style={[s.navCounterText, { color: T.textSub }]}>{cardIndex + 1} / {currentQs.length}</Text>
            </View>
            <TouchableOpacity
              style={[s.navNextBtn, { backgroundColor: CAT_COLOR[activeCategory], opacity: cardIndex === currentQs.length - 1 ? 0.4 : 1 }]}
              onPress={goNext}
              disabled={cardIndex === currentQs.length - 1}
            >
              <Text style={s.navNextText}>Next </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ════════════════════════════
          TAB 2 — SCHEDULE
      ════════════════════════════ */}
      {activeTab === "schedule" && (
        <View style={{ flex: 1 }}>
          {/* Add button */}
          <View style={[s.scheduleHeader, { borderBottomColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
            <Text style={[s.scheduleTitle, { color: T.text }]}>{schedules.length} upcoming interviews</Text>
            <TouchableOpacity style={[s.addBtn, { backgroundColor: T.primary }]} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={s.addBtnText}> Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {schedules.length === 0 ? (
              <View style={s.emptyBox}>
                <Ionicons name="calendar-outline" size={48} color={isDark ? "#1E2D40" : "#E5E7EB"} />
                <Text style={[s.emptyTitle, { color: T.text }]}>No interviews scheduled</Text>
                <Text style={[s.emptySub, { color: T.textSub }]}>Tap Add to schedule your next interview</Text>
              </View>
            ) : (
              schedules.map((item) => (
                <ScheduleCard key={item.id} item={item} T={T} isDark={isDark} onDelete={handleDelete} />
              ))
            )}
          </ScrollView>

          {/* Add Schedule Modal */}
          <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
            <View style={s.modalOverlay}>
              <View style={[s.modalSheet, { backgroundColor: T.surface }]}>
                <View style={[s.modalHandle, { backgroundColor: isDark ? "#2D4060" : "#D1D5DB" }]} />
                <Text style={[s.modalTitle, { color: T.text }]}>📅 Schedule Interview</Text>

                <ModalInput label="Company *"  value={form.company} onChange={(v) => setForm((p) => ({ ...p, company: v }))} placeholder="e.g. ABC Solutions"   field="company" />
                <ModalInput label="Role *"     value={form.role}    onChange={(v) => setForm((p) => ({ ...p, role: v }))}    placeholder="e.g. Software Engineer" field="role"    />
                <ModalInput label="Date *"     value={form.date}    onChange={(v) => setForm((p) => ({ ...p, date: v }))}    placeholder="e.g. 2025-06-20"        field="date"    />
                <ModalInput label="Time *"     value={form.time}    onChange={(v) => setForm((p) => ({ ...p, time: v }))}    placeholder="e.g. 10:00 AM"          field="time"    />
                <ModalInput label="Notes"      value={form.notes}   onChange={(v) => setForm((p) => ({ ...p, notes: v }))}   placeholder="e.g. Bring portfolio"   field="notes"   />

                <TouchableOpacity style={[s.modalSaveBtn, { backgroundColor: T.primary }]} onPress={handleAddSchedule}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={s.modalSaveBtnText}> Save Interview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalCancelBtn, { borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => setShowAddModal(false)}>
                  <Text style={[s.modalCancelBtnText, { color: T.textSub }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {/* ════════════════════════════
          TAB 3 — TIPS
      ════════════════════════════ */}
      {activeTab === "tips" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Banner */}
          <View style={[s.tipsBanner, { backgroundColor: T.primaryBg, borderColor: T.primary + "44" }]}>
            <Ionicons name="trophy-outline" size={28} color={T.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.tipsBannerTitle, { color: T.text }]}>Interview Success Tips</Text>
              <Text style={[s.tipsBannerSub, { color: T.textSub }]}>Follow these proven strategies to ace any interview</Text>
            </View>
          </View>

          {/* Do's */}
          <Text style={[s.tipsGroupLabel, { color: T.green }]}>✅ DO'S</Text>
          {TIPS.filter((t) => t.color === "#059669").map((tip, i) => (
            <View key={i} style={[s.tipCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB", borderLeftColor: tip.color, borderLeftWidth: 4 }]}>
              <View style={[s.tipIcon, { backgroundColor: tip.color + "20" }]}>
                <Ionicons name={tip.icon} size={20} color={tip.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.tipTitle, { color: T.text }]}>{tip.title}</Text>
                <Text style={[s.tipBody,  { color: T.textSub }]}>{tip.body}</Text>
              </View>
            </View>
          ))}

          {/* Don'ts */}
          <Text style={[s.tipsGroupLabel, { color: "#EF4444", marginTop: 16 }]}>❌ DON'TS</Text>
          {TIPS.filter((t) => t.color === "#EF4444").map((tip, i) => (
            <View key={i} style={[s.tipCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB", borderLeftColor: tip.color, borderLeftWidth: 4 }]}>
              <View style={[s.tipIcon, { backgroundColor: tip.color + "20" }]}>
                <Ionicons name={tip.icon} size={20} color={tip.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.tipTitle, { color: T.text }]}>{tip.title}</Text>
                <Text style={[s.tipBody,  { color: T.textSub }]}>{tip.body}</Text>
              </View>
            </View>
          ))}

          {/* Pro Tips */}
          <Text style={[s.tipsGroupLabel, { color: "#D97706", marginTop: 16 }]}>💡 PRO TIPS</Text>
          {TIPS.filter((t) => t.color === "#D97706").map((tip, i) => (
            <View key={i} style={[s.tipCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB", borderLeftColor: tip.color, borderLeftWidth: 4 }]}>
              <View style={[s.tipIcon, { backgroundColor: tip.color + "20" }]}>
                <Ionicons name={tip.icon} size={20} color={tip.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.tipTitle, { color: T.text }]}>{tip.title}</Text>
                <Text style={[s.tipBody,  { color: T.textSub }]}>{tip.body}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── FlashCard styles
const fc = StyleSheet.create({
  card:         { borderRadius: 20, padding: 20, borderWidth: 1, elevation: 3, marginBottom: 12 },
  counter:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  counterText:  { fontSize: 12 },
  catBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catBadgeText: { fontSize: 11, fontWeight: "700" },
  questionBox:  { borderRadius: 14, padding: 16, borderWidth: 1, gap: 10, marginBottom: 14, flexDirection: "row", alignItems: "flex-start" },
  questionText: { flex: 1, fontSize: 15, fontWeight: "700", lineHeight: 22 },
  hiddenBox:    { borderRadius: 14, padding: 16, borderWidth: 1, alignItems: "center", gap: 8, marginBottom: 14 },
  hiddenText:   { fontSize: 13 },
  answerBox:    { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 14 },
  answerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  answerLabel:  { fontSize: 12, fontWeight: "700" },
  answerText:   { fontSize: 13, lineHeight: 20 },
  revealBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 46, borderRadius: 14 },
  revealBtnText:{ fontSize: 14, fontWeight: "700" },
});

// ── ScheduleCard styles
const sc = StyleSheet.create({
  card:        { borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 12, elevation: 2 },
  cardTop:     { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  logoBox:     { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardInfo:    { flex: 1 },
  cardTitle:   { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  cardRole:    { fontSize: 12, marginBottom: 2 },
  cardDate:    { fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText:  { fontSize: 10, fontWeight: "700" },
  notes:       { fontSize: 12, marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
});

// ── Main styles
const s = StyleSheet.create({
  root: { flex: 1 },

  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 10 },
  backBtn:     { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  iconBtn:     { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },

  tabRow:  { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 16, borderRadius: 12, overflow: "hidden", elevation: 2, marginBottom: 4 },
  tab:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderBottomWidth: 2, gap: 4 },
  tabText: { fontSize: 12, fontWeight: "600" },

  catChip:     { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  catChipText: { fontSize: 12, fontWeight: "600" },

  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5, paddingVertical: 8 },
  dot:     { height: 7, borderRadius: 4 },

  navBar:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 32 : 16, borderTopWidth: 1, gap: 12, elevation: 10 },
  navPrevBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1.5 },
  navPrevText: { fontSize: 14, fontWeight: "600" },
  navCounter:  { flex: 1, alignItems: "center" },
  navCounterText: { fontSize: 14, fontWeight: "600" },
  navNextBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, paddingHorizontal: 20, borderRadius: 14, gap: 4, elevation: 3 },
  navNextText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  scheduleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  scheduleTitle:  { fontSize: 15, fontWeight: "700" },
  addBtn:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, elevation: 3 },
  addBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

  emptyBox:  { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle:{ fontSize: 16, fontWeight: "700" },
  emptySub:  { fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: Platform.OS === "ios" ? 40 : 24, elevation: 30 },
  modalHandle:  { width: 40, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalTitle:   { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  modalSaveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 14, gap: 8, elevation: 4, marginTop: 8 },
  modalSaveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  modalCancelBtn:   { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 10, borderWidth: 1 },
  modalCancelBtnText: { fontSize: 14, fontWeight: "600" },

  tipsBanner:      { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  tipsBannerTitle: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  tipsBannerSub:   { fontSize: 12 },
  tipsGroupLabel:  { fontSize: 13, fontWeight: "800", letterSpacing: 0.5, marginBottom: 10 },
  tipCard:  { flexDirection: "row", alignItems: "flex-start", borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10, gap: 12, elevation: 1 },
  tipIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  tipBody:  { fontSize: 12, lineHeight: 18 },
});
