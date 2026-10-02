import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import BottomNav from "../../components/BottomNav";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { theme: T } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          // ── Hide the default tab bar completely
          tabBarStyle: { display: "none" },
        }}
      />
      {/* Our custom glass bottom nav */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
