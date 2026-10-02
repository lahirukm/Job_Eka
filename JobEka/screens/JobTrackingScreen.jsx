import { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Animated, StatusBar, Alert, Linking,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { completeJob, cancelJob } from "../services/jobsApi";

const { width, height } = Dimensions.get("window");

// ── Distance in meters between 2 GPS points
const distanceMeters = (lat1, lng1, lat2, lng2) => {
  const R   = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a   = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const STATUS_STEPS = [
  { id: "on_the_way", label: "On the Way",  icon: "walk-outline",             color: "#2563EB" },
  { id: "arrived",    label: "Arrived",     icon: "location",                  color: "#D97706" },
  { id: "working",    label: "Working",     icon: "construct-outline",         color: "#7C3AED" },
  { id: "completed",  label: "Completed",   icon: "checkmark-circle-outline",  color: "#059669" },
];

export default function JobTrackingScreen() {
  const { theme: T, isDark } = useTheme();
  const router  = useRouter();
  const params  = useLocalSearchParams();

  const job      = params.job      ? JSON.parse(params.job)      : {};
  const customer = params.customer ? JSON.parse(params.customer) : {};

  const [currentLocation, setCurrentLocation] = useState(null);
  const [status,          setStatus]          = useState("on_the_way");
  const [elapsed,         setElapsed]         = useState(0);
  const [routeCoords,     setRouteCoords]     = useState([]);
  const [loadingRoute,    setLoadingRoute]    = useState(false);
  const [distanceLeft,    setDistanceLeft]    = useState(null);
  const [arrivedAlerted,  setArrivedAlerted]  = useState(false);

  const mapRef      = useRef(null);
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const locationSub = useRef(null);
  const timerRef    = useRef(null);

  const JOB_LAT = job.latitude  ? parseFloat(job.latitude)  : (job.lat || 6.9271);
  const JOB_LNG = job.longitude ? parseFloat(job.longitude) : (job.lng || 79.8612);

  // ── Fetch road route from OSRM (free, no API key)
  const fetchRoute = async (userLat, userLng) => {
    if (!userLat || !userLng) return;

    // ── Step 1: Show straight line immediately
    const straightLine = [
      { latitude: userLat, longitude: userLng },
      { latitude: JOB_LAT, longitude: JOB_LNG },
    ];
    setRouteCoords(straightLine);

    // Auto-fit map to show both points
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(straightLine, {
        edgePadding: { top: 130, right: 60, bottom: 330, left: 60 },
        animated: true,
      });
    }, 500);

    // ── Step 2: Fetch real road route
    setLoadingRoute(true);

    // OSRM server URLs to try in order
    const OSRM_SERVERS = [
      `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${JOB_LNG},${JOB_LAT}?overview=full&geometries=geojson`,
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${userLng},${userLat};${JOB_LNG},${JOB_LAT}?overview=full&geometries=geojson`,
    ];

    const fetchWithTimeout = (url, timeoutMs) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
        fetch(url)
          .then((res) => { clearTimeout(timer); resolve(res); })
          .catch((err) => { clearTimeout(timer); reject(err); });
      });

    for (const url of OSRM_SERVERS) {
      try {
        console.log("Trying route server:", url.split("/route")[0]);
        const res  = await fetchWithTimeout(url, 10000);
        const data = await res.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({
            latitude: lat, longitude: lng,
          }));
          if (coords.length > 2) {
            // Real road route received!
            setRouteCoords(coords);
            setTimeout(() => {
              mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 130, right: 60, bottom: 330, left: 60 },
                animated: true,
              });
            }, 300);
            console.log(`✅ Route loaded: ${coords.length} points`);
            setLoadingRoute(false);
            return; // Success — stop trying other servers
          }
        }
      } catch (err) {
        console.log("Server failed:", err.message, "— trying next...");
      }
    }

    // All servers failed — keep straight line
    console.log("⚠️ All route servers failed — using straight line");
    setLoadingRoute(false);
  };

  // ── Open Google Maps navigation
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${JOB_LAT},${JOB_LNG}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      // Fallback to geo URI
      Linking.openURL(`geo:${JOB_LAT},${JOB_LNG}?q=${JOB_LAT},${JOB_LNG}`);
    });
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // Pulse animation
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.5, duration: 900, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
    ])).start();

    // Start location + route
    startTracking();

    // Timer
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    return () => {
      locationSub.current?.remove();
      clearInterval(timerRef.current);
    };
  }, []);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude } = loc.coords;
    setCurrentLocation({ latitude, longitude });

    // Fetch initial route
    await fetchRoute(latitude, longitude);

    // Watch position
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 10 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        setCurrentLocation({ latitude, longitude });

        // Calculate distance to job
        const dist = distanceMeters(latitude, longitude, JOB_LAT, JOB_LNG);
        setDistanceLeft(Math.round(dist));

        // Auto-detect arrival (within 200m → auto status change)
        if (dist < 200 && !arrivedAlerted && status === "on_the_way") {
          setArrivedAlerted(true);
          setStatus("arrived");
          Alert.alert(
            "📍 You've Arrived!",
            `You are at ${job.location || "the job location"}!`,
            [{ text: "Start Working →", style: "default" }]
          );
        }
      }
    );
  };

  const handleAdvance = () => {
    const steps = STATUS_STEPS.map((s) => s.id);
    const idx   = steps.indexOf(status);
    if (idx < steps.length - 1) {
      setStatus(steps[idx + 1]);
    }
  };

  const handleComplete = () => {
    Alert.alert("Complete Job? 🎉", "Mark this job as completed? This will close the job permanently.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete", style: "default",
        onPress: async () => {
          setStatus("completed");
          locationSub.current?.remove();
          clearInterval(timerRef.current);
          try {
            if (job._id) await completeJob(job._id);
          } catch (err) {
            console.log("Complete error:", err.message);
          }
        },
      },
    ]);
  };

  const handleCallCustomer = () => {
    // Call EMPLOYER (so customer can contact the employer)
    const phone = job.employer_phone || "";
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("No Contact", "Employer contact not available.");
    }
  };

  const currentStep = STATUS_STEPS.findIndex((s) => s.id === status);
  const currentInfo = STATUS_STEPS[currentStep] || STATUS_STEPS[0];

  const region = currentLocation
    ? { latitude: (currentLocation.latitude + JOB_LAT) / 2, longitude: (currentLocation.longitude + JOB_LNG) / 2, latitudeDelta: Math.abs(currentLocation.latitude - JOB_LAT) * 2 + 0.02, longitudeDelta: Math.abs(currentLocation.longitude - JOB_LNG) * 2 + 0.02 }
    : { latitude: JOB_LAT, longitude: JOB_LNG, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── FULL SCREEN MAP ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation={false}
        userInterfaceStyle={isDark ? "dark" : "light"}
        showsTraffic={false}
      >
        {/* ── Route polyline (PickMe style) ── */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#2563EB"
            strokeWidth={5}
            lineDashPattern={undefined}
          />
        )}

        {/* ── Customer (You) marker — clean blue circle ── */}
        {currentLocation && (
          <Marker
            coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            title="You are here"
          >
            <Animated.View style={{
              width: 44, height: 44,
              borderRadius: 22,
              backgroundColor: "#2563EB",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: "#FFFFFF",
              shadowColor: "#2563EB",
              shadowOpacity: 0.6,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 10,
            }}>
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
            </Animated.View>
          </Marker>
        )}

        {/* ── Job location marker — clear briefcase pin ── */}
        <Marker
          coordinate={{ latitude: JOB_LAT, longitude: JOB_LNG }}
          anchor={{ x: 0.5, y: 1.0 }}
          title={job.title || "Job Location"}
          description={job.location}
        >
          <View style={s.jobMarkerWrap}>
            <View style={[s.jobMarker, { backgroundColor: currentInfo.color }]}>
              <Ionicons name="briefcase" size={20} color="#FFFFFF" />
            </View>
            <View style={[s.jobMarkerTail, { borderTopColor: currentInfo.color }]} />
          </View>
        </Marker>

        {/* ── Arrival detection circle (200m) ── */}
        {status === "on_the_way" && (
          <Circle
            center={{ latitude: JOB_LAT, longitude: JOB_LNG }}
            radius={200}
            fillColor={currentInfo.color + "15"}
            strokeColor={currentInfo.color + "55"}
            strokeWidth={1.5}
          />
        )}
      </MapView>

      {/* ── Back button ── */}
      <TouchableOpacity
        style={[s.backBtn, { backgroundColor: T.surface }]}
        onPress={() => {
          if (status === "on_the_way") {
            Alert.alert(
              "Leave?",
              "Going back will cancel your application and make the job available for others.",
              [
                { text: "Stay",   style: "cancel" },
                {
                  text: "Leave",
                  style: "destructive",
                  onPress: async () => {
                    try { if (job._id) await cancelJob(job._id); } catch (_) {}
                    router.back();
                  }
                },
              ]
            );
          } else {
            router.back();
          }
        }}
      >
        <Ionicons name="arrow-back" size={20} color={T.text} />
      </TouchableOpacity>

      {/* ── Status + Distance pill ── */}
      <Animated.View style={[s.statusPill, { backgroundColor: currentInfo.color, opacity: fadeAnim }]}>
        <Ionicons name={currentInfo.icon} size={14} color="#FFFFFF" />
        <Text style={s.statusPillText}> {currentInfo.label}</Text>
        {distanceLeft !== null && status === "on_the_way" && (
          <Text style={s.statusPillDist}>  ·  {distanceLeft < 1000 ? `${distanceLeft}m` : `${(distanceLeft / 1000).toFixed(1)}km`} left</Text>
        )}
      </Animated.View>

      {/* ── Timer top right ── */}
      <View style={[s.timerBadge, { backgroundColor: T.surface + "EE" }]}>
        <Ionicons name="time-outline" size={14} color={T.textSub} />
        <Text style={[s.timerText, { color: T.text }]}> {formatTime(elapsed)}</Text>
      </View>

      {/* ── Google Maps open button ── */}
      {status === "on_the_way" && (
        <TouchableOpacity style={[s.gmapsBtn, { backgroundColor: "#4285F4" }]} onPress={openGoogleMaps}>
          <Ionicons name="navigate-circle" size={18} color="#FFFFFF" />
          <Text style={s.gmapsBtnText}> Navigate</Text>
        </TouchableOpacity>
      )}

      {/* ── Loading route indicator ── */}
      {loadingRoute && (
        <View style={[s.loadingRoute, { backgroundColor: T.surface + "EE" }]}>
          <ActivityIndicator size="small" color={T.primary} />
          <Text style={[s.loadingRouteText, { color: T.textSub }]}> Loading road route...</Text>
        </View>
      )}

      {/* ── Bottom card ── */}
      <Animated.View style={[s.bottomCard, { backgroundColor: T.surface, opacity: fadeAnim }]}>

        {/* Job + call */}
        <View style={s.jobRow}>
          <View style={[s.jobIconBox, { backgroundColor: T.primaryBg }]}>
            <Ionicons name="briefcase-outline" size={22} color={T.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.jobTitle,    { color: T.text }]}>{job.title}</Text>
            <Text style={[s.jobLocation, { color: T.textSub }]}>{job.location}</Text>
            <Text style={[s.jobSalary,   { color: T.green }]}>{job.salary}  ·  {job.working_hours || "Flexible"}</Text>
          </View>
          <TouchableOpacity
            style={[s.callBtn, { backgroundColor: T.green + "22", borderColor: T.green }]}
            onPress={handleCallCustomer}
          >
            <Ionicons name="call" size={20} color={T.green} />
          </TouchableOpacity>
        </View>

        {/* Employer contact — customer can call employer */}
        <View style={[s.customerRow, { backgroundColor: isDark ? "#0D1525" : "#F9FAFB", borderColor: isDark ? "#1E2D40" : "#E5E7EB" }]}>
          <View style={[s.customerAvatar, { backgroundColor: T.primaryBg }]}>
            <Ionicons name="business" size={18} color={T.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[s.customerName,  { color: T.textSub, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }]}>EMPLOYER CONTACT</Text>
            <Text style={[s.customerName,  { color: T.text }]}>{job.employer_name  || "Employer"}</Text>
            <Text style={[s.customerPhone, { color: T.primary }]}>{job.employer_phone || "Contact not available"}</Text>
          </View>
          {job.employer_phone ? (
            <TouchableOpacity onPress={handleCallCustomer} style={[s.phoneBtn, { backgroundColor: T.primary }]}>
              <Ionicons name="call-outline" size={14} color="#FFFFFF" />
              <Text style={s.phoneBtnText}> Call</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Progress steps */}
        <View style={s.progressRow}>
          {STATUS_STEPS.map((step, i) => {
            const done   = i < currentStep;
            const active = i === currentStep;
            return (
              <View key={step.id} style={s.progressStep}>
                <View style={[s.progressDot, {
                  backgroundColor: done ? "#059669" : active ? step.color : (isDark ? "#1E2D40" : "#E5E7EB"),
                  borderColor:     done ? "#059669" : active ? step.color : (isDark ? "#2D4060" : "#D1D5DB"),
                }]}>
                  {done
                    ? <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    : <Ionicons name={step.icon} size={10} color={active ? "#FFFFFF" : T.textLight} />
                  }
                </View>
                <Text style={[s.progressLabel, { color: active ? step.color : T.textLight }]} numberOfLines={1}>
                  {step.label}
                </Text>
                {i < STATUS_STEPS.length - 1 && (
                  <View style={[s.progressLine, { backgroundColor: done ? "#059669" : (isDark ? "#1E2D40" : "#E5E7EB") }]} />
                )}
              </View>
            );
          })}
        </View>

        {/* Action buttons */}
        {status !== "completed" ? (
          <View>
            {/* ── Show distance warning when too far ── */}
            {status === "on_the_way" && distanceLeft !== null && distanceLeft > 1000 && (
              <View style={[s.distanceWarning, { backgroundColor: isDark ? "#1A2535" : "#F3F4F6" }]}>
                <Ionicons name="location-outline" size={14} color="#D97706" />
                <Text style={[s.distanceWarningText, { color: "#D97706" }]}>
                  {" "}You need to be within 1km to mark as Arrived
                  {"  "}({(distanceLeft / 1000).toFixed(1)}km away)
                </Text>
              </View>
            )}

            <View style={s.actionRow}>
              {/* ── Arrived button — disabled if > 1km away ── */}
              {status === "on_the_way" ? (() => {
                const withinRange = distanceLeft !== null && distanceLeft <= 1000;
                return (
                  <TouchableOpacity
                    style={[s.advanceBtn, {
                      backgroundColor: withinRange ? currentInfo.color : (isDark ? "#1E2D40" : "#D1D5DB"),
                      opacity: withinRange ? 1 : 0.7,
                    }]}
                    onPress={withinRange ? handleAdvance : () => {
                      Alert.alert(
                        "Too Far Away",
                        `You are ${(distanceLeft / 1000).toFixed(1)}km from the job location.\n\nPlease go closer to mark as Arrived.`,
                        [{ text: "OK" }]
                      );
                    }}
                  >
                    <Ionicons
                      name={withinRange ? "location" : "navigate-outline"}
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={s.advanceBtnText}>
                      {withinRange ? " I've Arrived" : ` Get Closer (${distanceLeft != null ? (distanceLeft / 1000).toFixed(1) + "km" : "..."})`}
                    </Text>
                  </TouchableOpacity>
                );
              })() : (
                <TouchableOpacity
                  style={[s.advanceBtn, { backgroundColor: currentInfo.color }]}
                  onPress={status === "working" ? handleComplete : handleAdvance}
                >
                  <Ionicons
                    name={status === "working" ? "checkmark-circle" : "arrow-forward-circle-outline"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={s.advanceBtnText}>
                    {status === "arrived" ? " Start Working" : " Complete Job 🎉"}
                  </Text>
                </TouchableOpacity>
              )}

              {status === "on_the_way" && (
                <TouchableOpacity
                  style={[s.cancelBtn, { backgroundColor: isDark ? "#2D0D0D" : "#FFF5F5", borderColor: "#FECACA" }]}
                  onPress={() => Alert.alert(
                    "Cancel Job?",
                    "This will make the job available for others again.",
                    [
                      { text: "No",  style: "cancel" },
                      {
                        text: "Yes, Cancel",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            if (job._id) await cancelJob(job._id);
                          } catch (err) {
                            console.log("Cancel error:", err.message);
                          }
                          router.back();
                        }
                      },
                    ]
                  )}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={[s.completedBox, { backgroundColor: isDark ? "#0D2518" : "#ECFDF5" }]}>
            <Ionicons name="checkmark-circle" size={32} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={s.completedTitle}>Job Completed! 🎉</Text>
              <Text style={[s.completedSub, { color: T.textSub }]}>Time: {formatTime(elapsed)}</Text>
            </View>
            <TouchableOpacity style={[s.doneBtn, { backgroundColor: "#059669" }]} onPress={() => router.replace("/(tabs)")}>
              <Text style={s.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  // Map overlays
  backBtn:    { position: "absolute", top: 52, left: 16, width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", elevation: 10, zIndex: 10 },
  statusPill: { position: "absolute", top: 52, alignSelf: "center", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 10, zIndex: 10 },
  statusPillText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  statusPillDist: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  timerBadge:  { position: "absolute", top: 52, right: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, elevation: 10, zIndex: 10 },
  timerText:   { fontSize: 13, fontWeight: "700" },
  gmapsBtn:    { position: "absolute", top: 108, right: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, elevation: 10, zIndex: 10, gap: 4 },
  gmapsBtnText:{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  loadingRoute:{ position: "absolute", top: 108, left: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, elevation: 10, zIndex: 10 },
  loadingRouteText:{ fontSize: 12 },

  // Customer marker
  customerMarkerWrap: { alignItems: "center", justifyContent: "center", width: 56, height: 56 },
  customerPulseRing:  { position: "absolute", width: 56, height: 56, borderRadius: 28, backgroundColor: "#2563EB18", borderWidth: 2, borderColor: "#2563EB55" },
  customerDot:        { width: 40, height: 40, borderRadius: 20, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF", elevation: 8,
    shadowColor: "#2563EB", shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },

  // Job marker — pin style (like Google Maps)
  jobMarkerWrap:  { alignItems: "center" },
  jobMarker:      { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF", elevation: 8,
    shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  jobMarkerTail:  { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10,
    borderLeftColor: "transparent", borderRightColor: "transparent", marginTop: -1 },

  // Bottom card
  bottomCard: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28, elevation: 20 },

  jobRow:     { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  jobIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  jobTitle:   { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  jobLocation:{ fontSize: 12, marginBottom: 2 },
  jobSalary:  { fontSize: 12, fontWeight: "700" },
  callBtn:    { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },

  customerRow:   { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 10, borderWidth: 1, marginBottom: 12 },
  customerAvatar:{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  customerName:  { fontSize: 13, fontWeight: "700" },
  customerPhone: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  phoneBtn:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 4 },
  phoneBtnText:  { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  progressRow:  { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  progressStep: { flex: 1, alignItems: "center", position: "relative" },
  progressDot:  { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1.5, marginBottom: 4, zIndex: 1 },
  progressLabel:{ fontSize: 9, fontWeight: "600", textAlign: "center", paddingHorizontal: 2 },
  progressLine: { position: "absolute", top: 13, left: "55%", right: "-45%", height: 2 },

  actionRow:    { flexDirection: "row", gap: 10 },
  advanceBtn:   { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 14, gap: 8, elevation: 4 },
  advanceBtnText:{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  distanceWarning:     { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  distanceWarningText: { fontSize: 12, fontWeight: "600", flex: 1 },
  cancelBtn:    { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },

  completedBox:  { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14 },
  completedTitle:{ fontSize: 16, fontWeight: "800", color: "#059669" },
  completedSub:  { fontSize: 12, marginTop: 2 },
  doneBtn:       { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  doneBtnText:   { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
