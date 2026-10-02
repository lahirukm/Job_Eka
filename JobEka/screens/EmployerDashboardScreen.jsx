import { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, ScrollView,
  StatusBar, TextInput, Alert,
  ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { postJob, getMyJobs, deleteJob, updateJob } from "../services/employerApi";
import MapView, { Marker } from "react-native-maps";
import useKeyboardScroll from "../hooks/useKeyboardScroll";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");

const JOB_TYPES  = ["Part Time", "Full Time", "Contract", "Internship"];
const CATEGORIES = ["IT", "Design", "Marketing", "Finance", "HR", "Operations", "Cleaning", "Delivery"];

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
};

// ── FormInput — outside
const FormInput = ({ label, value, onChange, placeholder, multiline, keyboardType, T, isDark }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: T.textSub, marginBottom: 5, letterSpacing: 0.5 }}>
        {label}
      </Text>
      <View style={{
        backgroundColor: isDark ? "#0D1525" : "#F9FAFB",
        borderRadius: 12, borderWidth: 1.5,
        borderColor: focused ? T.primary : (isDark ? "#1E2D40" : "#E5E7EB"),
        height: multiline ? 80 : 50,
        paddingHorizontal: 14, justifyContent: "center",
      }}>
        <TextInput
          style={{
            color: T.text, fontSize: 14,
            height: multiline ? 80 : 50,
            textAlignVertical: multiline ? "top" : "center",
            paddingVertical: multiline ? 8 : 0,
          }}
          placeholder={placeholder}
          placeholderTextColor={T.textLight}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          keyboardType={keyboardType || "default"}
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

// ── Job Card — outside
const JobCard = ({ item, T, isDark, onDelete, onEdit }) => (
  <View style={[jc.card, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
    <View style={jc.top}>
      <View style={[jc.iconBox, { backgroundColor: T.primaryBg }]}>
        <Ionicons name="briefcase-outline" size={22} color={T.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[jc.title,  { color: T.text }]}>{item.title}</Text>
        <Text style={[jc.sub,    { color: T.textSub }]}>{item.type}  ·  {item.location}</Text>
        <Text style={[jc.salary, { color: T.green }]}>{item.salary}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View style={[jc.badge, { backgroundColor: item.status === "closed" ? "#EF444422" : item.status === "paused" ? "#D9770622" : "#05996922" }]}>
          <Text style={[jc.badgeText, { color: item.status === "closed" ? "#EF4444" : item.status === "paused" ? "#D97706" : "#059669" }]}>{item.status}</Text>
        </View>
        <Text style={[jc.time, { color: T.textLight }]}>{timeAgo(item.createdAt)}</Text>
      </View>
    </View>

    {/* Location + coords indicator */}
    <View style={jc.tags}>
      <View style={[jc.tag, { backgroundColor: isDark ? "#1E2D40" : "#F3F4F6" }]}>
        <Text style={[jc.tagText, { color: T.textSub }]}>{item.category}</Text>
      </View>
      {item.status === "closed" && item.appliedBy?.name ? (
        <View style={[jc.tag, { backgroundColor: isDark ? "#2D0D0D" : "#FFF5F5" }]}>
          <Ionicons name="person-outline" size={11} color="#EF4444" />
          <Text style={[jc.tagText, { color: "#EF4444" }]}> {item.appliedBy.name} · {item.appliedBy.phone}</Text>
        </View>
      ) : null}
      {item.latitude && item.longitude ? (
        <View style={[jc.tag, { backgroundColor: isDark ? "#0D2518" : "#ECFDF5" }]}>
          <Ionicons name="location" size={11} color="#059669" />
          <Text style={[jc.tagText, { color: "#059669" }]}> Map Ready ✅</Text>
        </View>
      ) : (
        <View style={[jc.tag, { backgroundColor: isDark ? "#2D1500" : "#FFF7ED" }]}>
          <Ionicons name="location-outline" size={11} color="#D97706" />
          <Text style={[jc.tagText, { color: "#D97706" }]}> No GPS</Text>
        </View>
      )}
    </View>

    <View style={[jc.footer, { borderTopColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
      <Text style={[jc.time, { color: T.textLight }]}>Posted {timeAgo(item.createdAt)}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity style={[jc.editBtn, { backgroundColor: isDark ? "#0D1A35" : "#EEF2FF" }]} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={14} color="#2563EB" />
          <Text style={jc.editTxt}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[jc.deleteBtn, { backgroundColor: isDark ? "#2D0D0D" : "#FFF5F5" }]} onPress={() => onDelete(item._id)}>
          <Ionicons name="trash-outline" size={14} color="#EF4444" />
          <Text style={jc.deleteTxt}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const jc = StyleSheet.create({
  card:      { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12, elevation: 2 },
  top:       { flexDirection: "row", gap: 12, marginBottom: 10, alignItems: "flex-start" },
  iconBox:   { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  title:     { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  sub:       { fontSize: 12, marginBottom: 2 },
  salary:    { fontSize: 13, fontWeight: "700" },
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  time:      { fontSize: 11 },
  tags:      { flexDirection: "row", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  tag:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText:   { fontSize: 11, fontWeight: "500" },
  footer:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1 },
  editBtn:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 4 },
  editTxt:   { color: "#2563EB", fontSize: 12, fontWeight: "600" },
  deleteBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 4 },
  deleteTxt: { color: "#EF4444", fontSize: 12, fontWeight: "600" },
});

// ─────────────────────────────────────────────────────────────
export default function EmployerDashboardScreen() {
  const kb = useKeyboardScroll();
  const { theme: T, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [activeTab,   setActiveTab]   = useState("overview");
  const [view,        setView]        = useState("list");
  const [jobs,        setJobs]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [posting,     setPosting]     = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [error,       setError]       = useState("");
  const [editingJob,    setEditingJob]    = useState(null);
  const [showMapPicker,  setShowMapPicker]  = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [emptyFormDefaults, setEmptyFormDefaults] = useState({ employer_name: "", employer_phone: "" });
  const [locationSearch, setLocationSearch] = useState("");
  const [locSuggestions,    setLocSuggestions]    = useState([]);
  const [showLocSuggestions,setShowLocSuggestions] = useState(false);
  const [locating,       setLocating]       = useState(false);
  const [searching,      setSearching]      = useState(false);
  const locSearchTimeout = useRef(null);
  const mapRef = useRef(null);

  const getEmptyForm = () => ({
    title: "", type: "Part Time", category: "IT",
    location: "", latitude: "", longitude: "",
    salary: "", working_hours: "",
    employer_name:  emptyFormDefaults.employer_name,
    employer_phone: emptyFormDefaults.employer_phone,
    description: "", requirements: "",
  });

  const emptyForm = {
    title: "", type: "Part Time", category: "IT",
    location: "", latitude: "", longitude: "",
    salary: "", working_hours: "",
    employer_name: "", employer_phone: "",
    description: "", requirements: "",
  };
  const [jobForm, setJobForm] = useState(emptyForm);

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    loadJobs();
    // Auto-load employer info from profile
    (async () => {
      try {
        const AsyncStorage = require("@react-native-async-storage/async-storage").default;
        const name  = await AsyncStorage.getItem("customer_name")  || "";
        const phone = await AsyncStorage.getItem("customer_phone") || "";
        setJobForm((p) => ({ ...p, employer_name: name, employer_phone: phone }));
        setEmptyFormDefaults({ employer_name: name, employer_phone: phone });
      } catch (_) {}
    })();
  }, []);

  const loadJobs = async () => {
    setLoading(true); setError("");
    try {
      const data = await getMyJobs();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setJobForm({
      title:        job.title        || "",
      type:         job.type         || "Part Time",
      category:     job.category     || "IT",
      location:     job.location     || "",
      latitude:     job.latitude     != null ? String(job.latitude)  : "",
      longitude:    job.longitude    != null ? String(job.longitude) : "",
      salary:       job.salary        || "",
      working_hours:job.working_hours  || "",
      employer_name:  job.employer_name  || emptyFormDefaults.employer_name,
      employer_phone: job.employer_phone || emptyFormDefaults.employer_phone,
      description:  job.description   || "",
      requirements: job.requirements  || "",
    });
    setView("form");
  };

  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.salary) {
      Alert.alert("Missing Fields", "Please fill Title and Salary.");
      return;
    }
    if (!jobForm.latitude || !jobForm.longitude) {
      Alert.alert("Missing Location", "Please select a job location on the map.");
      return;
    }
    setPosting(true);
    try {
      const payload = {
        ...jobForm,
        latitude:  jobForm.latitude  ? parseFloat(jobForm.latitude)  : null,
        longitude: jobForm.longitude ? parseFloat(jobForm.longitude) : null,
      };

      if (editingJob) {
        const updated = await updateJob(editingJob._id, payload);
        setJobs((prev) => prev.map((j) => j._id === editingJob._id ? updated : j));
      } else {
        const newJob = await postJob(payload);
        setJobs((prev) => [newJob, ...prev]);
      }

      setPostSuccess(true);
      setJobForm(getEmptyForm());
      setEditingJob(null);
      setTimeout(() => {
        setPostSuccess(false);
        setView("list");
        setActiveTab("jobs");
      }, 2000);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (jobId) => {
    Alert.alert("Delete Job?", "Remove this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteJob(jobId);
            setJobs((prev) => prev.filter((j) => j._id !== jobId));
          } catch (err) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const chipBg     = isDark ? "#1A2535" : "#F0EEE9";
  const chipBorder = isDark ? "#2D4060" : "#D1D5DB";
  const chipColor  = isDark ? "#94A3B8" : "#4B5563";

  // ── Get current GPS location
  const getCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationName = address
        ? `${address.street || ""} ${address.city || address.district || ""}`.trim()
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      setPickedLocation({ lat: latitude, lng: longitude });
      setJobForm((p) => ({
        ...p,
        latitude:  latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        location:  locationName || p.location,
      }));
      setShowMapPicker(true);
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01,
        }, 800);
      }, 300);
    } catch (err) {
      Alert.alert("Error", "Could not get location. Try again.");
    } finally {
      setLocating(false);
    }
  };

  // ── Search location by name (Nominatim — free, no API key needed)
  // ── Location name auto-suggest (Nominatim)
  const handleLocationInput = (text) => {
    setJobForm((p) => ({ ...p, location: text }));
    setLocSuggestions([]);
    setShowLocSuggestions(false);

    if (locSearchTimeout.current) clearTimeout(locSearchTimeout.current);
    if (text.length < 2) return;

    locSearchTimeout.current = setTimeout(async () => {
      try {
        const query = encodeURIComponent(text + " Sri Lanka");
        const res   = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&countrycodes=lk`,
          { headers: { "User-Agent": "JobEkaApp/1.0" } }
        );
        const data = await res.json();
        setLocSuggestions(data);
        setShowLocSuggestions(data.length > 0);
      } catch (_) {}
    }, 500);
  };

  // ── User selects a suggestion → auto-fill location + lat/lng
  const handleSelectLocSuggestion = (item) => {
    const lat  = parseFloat(item.lat);
    const lng  = parseFloat(item.lon);
    const name = item.display_name.split(",")[0].trim();

    setJobForm((p) => ({
      ...p,
      location:  name,
      latitude:  lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
    setPickedLocation({ lat, lng });
    setLocSuggestions([]);
    setShowLocSuggestions(false);
    setLocationSearch(name);

    // Animate map to selected location
    setTimeout(() => {
      setShowMapPicker(true);
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: lat, longitude: lng,
          latitudeDelta: 0.02, longitudeDelta: 0.02,
        }, 600);
      }, 300);
    }, 100);
  };

  const searchLocation = async () => {
    if (!locationSearch.trim()) return;
    setSearching(true);
    try {
      const query   = encodeURIComponent(locationSearch + ", Sri Lanka");
      const res     = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
        headers: { "User-Agent": "JobEkaApp/1.0" },
      });
      const results = await res.json();
      if (results.length === 0) {
        Alert.alert("Not Found", "Location not found. Try a different name.");
        return;
      }
      const latitude  = parseFloat(results[0].lat);
      const longitude = parseFloat(results[0].lon);

      setPickedLocation({ lat: latitude, lng: longitude });
      setJobForm((p) => ({
        ...p,
        latitude:  latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        location:  locationSearch,
      }));
      setShowMapPicker(true);
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02,
        }, 800);
      }, 300);
    } catch (err) {
      Alert.alert("Error", "Search failed. Check internet connection.");
    } finally {
      setSearching(false);
    }
  };

  // ════════════════════════════════════════════
  // FORM VIEW
  // ════════════════════════════════════════════
  if (view === "form") {
    return (
      <View style={[s.root, { backgroundColor: T.bg }]}>
        <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

        <View style={[s.formHeader, { backgroundColor: T.bg, borderBottomColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}
            onPress={() => { setView("list"); setPostSuccess(false); setEditingJob(null); setJobForm(getEmptyForm()); setShowMapPicker(false); setPickedLocation(null); }}
          >
            <Ionicons name="arrow-back" size={20} color={T.text} />
          </TouchableOpacity>
          <Text style={[s.formHeaderTitle, { color: T.text }]}>
            {editingJob ? "✏️ Edit Job" : "📋 Post New Job"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {postSuccess ? (
          <View style={[s.successFull, { backgroundColor: T.bg }]}>
            <View style={[s.successIcon, { backgroundColor: T.greenBg }]}>
              <Ionicons name="checkmark-circle" size={72} color={T.green} />
            </View>
            <Text style={[s.successTitle, { color: T.text }]}>
              {editingJob ? "Job Updated! ✅" : "Job Posted! 🎉"}
            </Text>
            <Text style={[s.successSub, { color: T.textSub }]}>
              {editingJob ? "Job updated successfully!" : "Job posted successfully!"}{"\n"}
              {jobForm.latitude ? "📍 Will appear on customer map!" : "⚠️ Add GPS to show on map"}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView
              {...kb.scrollProps}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 20 + kb.keyboardHeight }}
            >
              <Text style={[s.formSubtitle, { color: T.textSub }]}>
                Fill details — add GPS coordinates to show on customer map 📍
              </Text>

              <FormInput label="Job Title *"  value={jobForm.title}   onChange={(v) => setJobForm((p) => ({ ...p, title: v }))}   placeholder="e.g. Garden Cleaner"  T={T} isDark={isDark} />

              {/* Job Type */}
              <Text style={[s.chipLabel, { color: T.textSub }]}>JOB TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16, paddingVertical: 4 }}>
                {JOB_TYPES.map((type) => {
                  const active = jobForm.type === type;
                  return (
                    <TouchableOpacity key={type} style={[s.chip, { backgroundColor: active ? T.primary : chipBg, borderColor: active ? T.primary : chipBorder }]} onPress={() => setJobForm((p) => ({ ...p, type }))}>
                      <Text style={[s.chipText, { color: active ? "#FFFFFF" : chipColor }]}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Category */}
              <Text style={[s.chipLabel, { color: T.textSub }]}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16, paddingVertical: 4 }}>
                {CATEGORIES.map((cat) => {
                  const active = jobForm.category === cat;
                  return (
                    <TouchableOpacity key={cat} style={[s.chip, { backgroundColor: active ? T.primary : chipBg, borderColor: active ? T.primary : chipBorder }]} onPress={() => setJobForm((p) => ({ ...p, category: cat }))}>
                      <Text style={[s.chipText, { color: active ? "#FFFFFF" : chipColor }]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>


              <FormInput label="Salary *"        value={jobForm.salary}        onChange={(v) => setJobForm((p) => ({ ...p, salary: v }))}        placeholder="e.g. LKR 1,500/day"             T={T} isDark={isDark} />
              <FormInput label="Working Hours *"   value={jobForm.working_hours}   onChange={(v) => setJobForm((p) => ({ ...p, working_hours: v }))}   placeholder="e.g. 8AM-5PM or Flexible Hours"   T={T} isDark={isDark} />

              {/* GPS Location — Search + Current + Map Picker */}
              <View style={[s.gpsBox, { backgroundColor: isDark ? "#0D1A35" : "#EEF2FF", borderColor: isDark ? "#1E2D40" : "#BFDBFE" }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Ionicons name="location" size={18} color={T.primary} />
                  <Text style={[s.gpsTitle, { color: T.text }]}>Job Location on Map</Text>
                </View>

                {/* 1 — Use Current Location */}
                <TouchableOpacity
                  style={[s.locationOptionBtn, { backgroundColor: isDark ? "#0D2518" : "#ECFDF5", borderColor: "#A7F3D0", marginBottom: 10 }]}
                  onPress={getCurrentLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <><ActivityIndicator size="small" color="#059669" /><Text style={[s.locationOptionTxt, { color: "#059669" }]}> Getting location...</Text></>
                  ) : (
                    <><Ionicons name="navigate" size={16} color="#059669" /><Text style={[s.locationOptionTxt, { color: "#059669" }]}> Use My Current Location</Text></>
                  )}
                </TouchableOpacity>

                {/* 2 — Search by name with auto-suggest */}
                <View style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={[s.searchBox, { flex: 1, backgroundColor: isDark ? "#0D1525" : "#F9FAFB", borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
                      <TextInput
                        style={{ flex: 1, color: T.text, fontSize: 13, height: 42 }}
                        placeholder="Type location... (e.g. Kaduwela)"
                        placeholderTextColor={T.textLight}
                        value={locationSearch}
                        onChangeText={(text) => {
                          setLocationSearch(text);
                          // Auto-suggest while typing
                          setLocSuggestions([]);
                          setShowLocSuggestions(false);
                          if (locSearchTimeout.current) clearTimeout(locSearchTimeout.current);
                          if (text.length < 2) return;
                          locSearchTimeout.current = setTimeout(async () => {
                            try {
                              const q   = encodeURIComponent(text + " Sri Lanka");
                              const res = await fetch(
                                `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=lk`,
                                { headers: { "User-Agent": "JobEkaApp/1.0" } }
                              );
                              const data = await res.json();
                              setLocSuggestions(data);
                              setShowLocSuggestions(data.length > 0);
                            } catch (_) {}
                          }, 500);
                        }}
                        onSubmitEditing={searchLocation}
                        returnKeyType="search"
                        underlineColorAndroid="transparent"
                        collapsable={false}
                      />
                    </View>
                    <TouchableOpacity
                      style={[s.searchBtn, { backgroundColor: T.primary }]}
                      onPress={searchLocation}
                      disabled={searching}
                    >
                      {searching
                        ? <ActivityIndicator size="small" color="#FFFFFF" />
                        : <Ionicons name="search" size={18} color="#FFFFFF" />
                      }
                    </TouchableOpacity>
                  </View>

                  {/* Auto-suggest dropdown */}
                  {showLocSuggestions && locSuggestions.length > 0 && (
                    <View style={{
                      backgroundColor: T.surface,
                      borderRadius: 12, borderWidth: 1,
                      borderColor: isDark ? "#1E2D40" : "#E5E7EB",
                      marginTop: 4, overflow: "hidden", elevation: 15,
                    }}>
                      {locSuggestions.map((item, i) => {
                        const parts = item.display_name.split(",");
                        const main  = parts[0].trim();
                        const sub   = parts.slice(1, 3).join(",").trim();
                        return (
                          <TouchableOpacity
                            key={i}
                            style={{
                              flexDirection: "row", alignItems: "center",
                              paddingHorizontal: 12, paddingVertical: 10, gap: 10,
                              borderBottomWidth: i < locSuggestions.length - 1 ? 1 : 0,
                              borderBottomColor: isDark ? "#1E2D40" : "#F3F4F6",
                            }}
                            onPress={() => {
                              handleSelectLocSuggestion(item);
                              setLocationSearch(item.display_name.split(",")[0].trim());
                            }}
                          >
                            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: T.primaryBg, alignItems: "center", justifyContent: "center" }}>
                              <Ionicons name="location-outline" size={14} color={T.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 13, fontWeight: "700", color: T.text }} numberOfLines={1}>{main}</Text>
                              <Text style={{ fontSize: 11, color: T.textSub }} numberOfLines={1}>{sub}</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={12} color={T.textLight} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* 3 — Map tap to pick */}
                {showMapPicker ? (
                  <View>
                    <Text style={[s.gpsTip, { color: T.textSub, marginBottom: 8 }]}>
                      📍 Map ලදී tap කරලා exact location fine-tune කරන්න
                    </Text>
                    <View style={{ borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
                      <MapView
                        ref={mapRef}
                        style={{ width: "100%", height: 220 }}
                        initialRegion={{
                          latitude:       pickedLocation ? pickedLocation.lat : 6.9271,
                          longitude:      pickedLocation ? pickedLocation.lng : 79.8612,
                          latitudeDelta:  0.02,
                          longitudeDelta: 0.02,
                        }}
                        onPress={(e) => {
                          const { latitude, longitude } = e.nativeEvent.coordinate;
                          setPickedLocation({ lat: latitude, lng: longitude });
                          setJobForm((p) => ({
                            ...p,
                            latitude:  latitude.toFixed(6),
                            longitude: longitude.toFixed(6),
                          }));
                        }}
                      >
                        {pickedLocation && (
                          <Marker
                            coordinate={{ latitude: pickedLocation.lat, longitude: pickedLocation.lng }}
                            title="Job Location"
                            pinColor="#2563EB"
                          />
                        )}
                      </MapView>
                    </View>
                    {pickedLocation && (
                      <View style={[s.coordDisplay, { backgroundColor: isDark ? "#0D2518" : "#ECFDF5" }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#059669" />
                        <Text style={{ color: "#059669", fontSize: 12, fontWeight: "600" }}>
                          {" "}✅ {jobForm.location || "Location selected"}  ({pickedLocation.lat.toFixed(4)}, {pickedLocation.lng.toFixed(4)})
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[s.mapToggleBtn, { backgroundColor: isDark ? "#1E2D40" : "#E5E7EB", marginTop: 8 }]}
                      onPress={() => setShowMapPicker(false)}
                    >
                      <Ionicons name="chevron-up" size={16} color={T.textSub} />
                      <Text style={[s.mapToggleTxt, { color: T.textSub }]}> Hide Map</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    {jobForm.latitude && jobForm.longitude ? (
                      <View style={[s.coordDisplay, { backgroundColor: isDark ? "#0D2518" : "#ECFDF5", marginBottom: 8 }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#059669" />
                        <Text style={{ color: "#059669", fontSize: 12, fontWeight: "600" }}>
                          {" "}✅ {jobForm.location}  ({parseFloat(jobForm.latitude).toFixed(4)}, {parseFloat(jobForm.longitude).toFixed(4)})
                        </Text>
                      </View>
                    ) : null}
                    <TouchableOpacity
                      style={[s.mapToggleBtn, { backgroundColor: isDark ? "#1A2535" : "#F0EEE9" }]}
                      onPress={() => setShowMapPicker(true)}
                    >
                      <Ionicons name="map-outline" size={16} color={T.primary} />
                      <Text style={[s.mapToggleTxt, { color: T.primary }]}>
                        {jobForm.latitude ? " Adjust on Map" : " Open Map to Pick Location"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <FormInput label="Description"  value={jobForm.description}  onChange={(v) => setJobForm((p) => ({ ...p, description: v }))}  placeholder="Describe the role..."   multiline T={T} isDark={isDark} />
              <FormInput label="Requirements" value={jobForm.requirements} onChange={(v) => setJobForm((p) => ({ ...p, requirements: v }))} placeholder="List requirements..."  multiline T={T} isDark={isDark} />
            </ScrollView>

            {/* Fixed Save Button */}
            <View style={[s.saveBar, {
              backgroundColor: T.surface,
              borderTopColor: isDark ? "#1E2D40" : "#E5E7EB",
              paddingBottom: Platform.OS === "ios" ? 32 : 16,
            }]}>
              <TouchableOpacity
                style={[s.saveBtn, { backgroundColor: posting ? T.primary + "99" : T.primary }]}
                onPress={handlePostJob}
                disabled={posting}
              >
                {posting ? (
                  <><ActivityIndicator size="small" color="#FFFFFF" /><Text style={s.saveBtnText}> Saving...</Text></>
                ) : (
                  <><Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" /><Text style={s.saveBtnText}> {editingJob ? "Update Job" : "Post Job"}</Text></>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // ════════════════════════════════════════════
  // MAIN DASHBOARD VIEW
  // ════════════════════════════════════════════
  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />

      <Animated.View style={[s.header, { backgroundColor: T.bg, opacity: headerFade }]}>
        <View style={s.headerLeft}>
          <View style={[s.logo, { backgroundColor: T.primary }]}>
            <Ionicons name="business" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[s.headerTitle, { color: T.text }]}>Employer Portal</Text>
            <Text style={[s.headerSub,   { color: T.textSub }]}>Manage your job postings</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={17} color={isDark ? "#F59E0B" : T.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={loadJobs}>
            <Ionicons name="refresh-outline" size={17} color={T.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]} onPress={() => router.replace("/login")}>
            <Ionicons name="log-out-outline" size={17} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={[s.tabRow, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
        {[
          { id: "overview", label: "Overview",           icon: "grid-outline"      },
          { id: "jobs",     label: `My Jobs (${jobs.length})`, icon: "briefcase-outline" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} style={[s.tab, { borderBottomColor: active ? T.primary : "transparent" }]} onPress={() => setActiveTab(tab.id)}>
              <Ionicons name={tab.icon} size={15} color={active ? T.primary : T.textLight} />
              <Text style={[s.tabText, { color: active ? T.primary : T.textLight }]}> {tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={[s.fab, { backgroundColor: T.primary }]} onPress={() => { setEditingJob(null); setJobForm(getEmptyForm()); setShowMapPicker(false); setPickedLocation(null); setView("form"); }}>
        <Ionicons name="add" size={22} color="#FFFFFF" />
        <Text style={s.fabText}>Post</Text>
      </TouchableOpacity>

      {error ? (
        <View style={[s.errorBox, { backgroundColor: isDark ? "#2D0D0D" : "#FFF5F5" }]}>
          <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
          <Text style={s.errorText}> {error}</Text>
          <TouchableOpacity onPress={() => { setError(""); loadJobs(); }}>
            <Text style={[s.retryText, { color: T.primary }]}> Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={{ color: T.textSub, fontSize: 14 }}>Loading...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

          {activeTab === "overview" && (
            <View>
              <View style={s.statsGrid}>
                {[
                  { label: "Active",      value: jobs.filter((j) => j.status === "active").length,   icon: "checkmark-circle-outline", color: T.green   },
                  { label: "In Progress", value: jobs.filter((j) => j.status === "applied").length,  icon: "time-outline",             color: T.orange  },
                  { label: "Completed",   value: jobs.filter((j) => j.status === "closed").length,   icon: "lock-closed-outline",      color: "#EF4444" },
                  { label: "Applicants",  value: jobs.reduce((a, b) => a + (b.applicants || 0), 0),  icon: "people-outline",           color: T.primary },
                ].map((stat, i) => (
                  <View key={i} style={[s.statCard, { backgroundColor: T.surface, borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
                    <View style={[s.statIcon, { backgroundColor: stat.color + "20" }]}>
                      <Ionicons name={stat.icon} size={20} color={stat.color} />
                    </View>
                    <Text style={[s.statValue, { color: T.text }]}>{stat.value}</Text>
                    <Text style={[s.statLabel, { color: T.textSub }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {jobs.length > 0 ? (
                <>
                  <View style={s.sectionRow}>
                    <Text style={[s.sectionTitle, { color: T.text }]}>Recent Postings</Text>
                    <TouchableOpacity onPress={() => setActiveTab("jobs")}>
                      <Text style={[s.seeAll, { color: T.primary }]}>See All →</Text>
                    </TouchableOpacity>
                  </View>
                  {jobs.filter((j) => j.status !== "closed").slice(0, 3).map((job) => (
                    <JobCard key={job._id} item={job} T={T} isDark={isDark} onDelete={handleDelete} onEdit={handleEdit} />
                  ))}
                </>
              ) : (
                <View style={s.emptyBox}>
                  <View style={[s.emptyIcon, { backgroundColor: T.primaryBg }]}>
                    <Ionicons name="cloud-outline" size={40} color={T.primary} />
                  </View>
                  <Text style={[s.emptyTitle, { color: T.text }]}>No jobs posted yet</Text>
                  <Text style={[s.emptySub, { color: T.textSub }]}>Tap "Post" to add your first job</Text>
                  <TouchableOpacity style={[s.emptyBtn, { backgroundColor: T.primary }]} onPress={() => setView("form")}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={s.emptyBtnText}> Post First Job</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activeTab === "jobs" && (
            <View>
              {/* Active + In Progress jobs */}
              <View style={s.sectionRow}>
                <Text style={[s.sectionTitle, { color: T.text }]}>
                  {jobs.filter((j) => j.status !== "closed").length} Active Jobs
                </Text>
                <TouchableOpacity onPress={() => { setEditingJob(null); setJobForm(getEmptyForm()); setShowMapPicker(false); setPickedLocation(null); setView("form"); }}>
                  <Text style={[s.seeAll, { color: T.primary }]}>+ Post New</Text>
                </TouchableOpacity>
              </View>

              {jobs.filter((j) => j.status !== "closed").length === 0 ? (
                <View style={s.emptyBox}>
                  <Ionicons name="briefcase-outline" size={52} color={isDark ? "#1E2D40" : "#E5E7EB"} />
                  <Text style={[s.emptyTitle, { color: T.text }]}>No active jobs</Text>
                </View>
              ) : (
                jobs
                  .filter((j) => j.status !== "closed")
                  .map((job) => (
                    <JobCard key={job._id} item={job} T={T} isDark={isDark} onDelete={handleDelete} onEdit={handleEdit} />
                  ))
              )}

              {/* Completed jobs section */}
              {jobs.filter((j) => j.status === "closed").length > 0 && (
                <>
                  <View style={[s.sectionRow, { marginTop: 16 }]}>
                    <Text style={[s.sectionTitle, { color: "#EF4444" }]}>
                      🔒 Completed ({jobs.filter((j) => j.status === "closed").length})
                    </Text>
                  </View>
                  {jobs
                    .filter((j) => j.status === "closed")
                    .map((job) => (
                      <JobCard key={job._id} item={job} T={T} isDark={isDark} onDelete={handleDelete} onEdit={handleEdit} />
                    ))
                  }
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerLeft:  { flexDirection: "row", alignItems: "center", gap: 10 },
  logo:        { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", elevation: 3 },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  headerSub:   { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn:     { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  tabRow:  { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 16, borderRadius: 12, overflow: "hidden", elevation: 2, marginBottom: 4 },
  tab:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderBottomWidth: 2, gap: 4 },
  tabText: { fontSize: 12, fontWeight: "600" },
  fab:     { position: "absolute", bottom: 24, right: 16, flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, elevation: 8, zIndex: 99, gap: 6 },
  fabText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  errorBox:  { flexDirection: "row", alignItems: "center", marginHorizontal: 16, padding: 12, borderRadius: 12, marginBottom: 8, gap: 6 },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
  retryText: { fontSize: 13, fontWeight: "700" },
  loadingBox:{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard:  { width: (width - 52) / 2, borderRadius: 16, padding: 14, borderWidth: 1, alignItems: "center", gap: 6, elevation: 2 },
  statIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },
  sectionRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  seeAll:       { fontSize: 13, fontWeight: "600" },
  emptyBox:    { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyIcon:   { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  emptyTitle:  { fontSize: 18, fontWeight: "700" },
  emptySub:    { fontSize: 13, textAlign: "center", lineHeight: 20 },
  emptyBtn:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 8, gap: 6 },
  emptyBtnText:{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  formHeader:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1 },
  formHeaderTitle: { fontSize: 18, fontWeight: "800" },
  backBtn:         { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, elevation: 2 },
  formSubtitle:    { fontSize: 13, marginBottom: 16, lineHeight: 20 },
  chipLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  chip:      { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  chipText:  { fontSize: 12, fontWeight: "600" },
  gpsBox:           { borderRadius: 14, padding: 14, borderWidth: 1.5, marginBottom: 14 },
  gpsTitle:         { fontSize: 14, fontWeight: "700" },
  gpsHint:          { fontSize: 11 },
  gpsTip:           { fontSize: 12, lineHeight: 18 },
  locationOptionBtn:{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 44, borderRadius: 12, borderWidth: 1.5, gap: 8 },
  locationOptionTxt:{ fontSize: 13, fontWeight: "700" },
  searchBox:        { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 10, height: 42 },
  searchBtn:        { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  coordDisplay:     { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, marginBottom: 4 },
  mapToggleBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 42, borderRadius: 12, gap: 6 },
  mapToggleTxt:     { fontSize: 13, fontWeight: "700" },
  saveBar:     { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, elevation: 10 },
  saveBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, borderRadius: 16, gap: 10, elevation: 4 },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  successFull:  { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  successIcon:  { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, fontWeight: "800" },
  successSub:   { fontSize: 15, textAlign: "center", lineHeight: 24 },
});
