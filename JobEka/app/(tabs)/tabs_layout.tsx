import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import BottomNav from "../../components/BottomNav";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { theme: T } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: T.bg }]}>
      {/* Screens take the space above the menu, so content never scrolls under it */}
      <View style={styles.screens}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" }, // hide the default tab bar
          }}
        />
      </View>
      {/* Custom bottom menu, docked as part of the page */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  screens: { flex: 1 },
});
