import { ThemeProvider } from '../context/ThemeContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index"              options={{ headerShown: false }} />
        <Stack.Screen name="login"              options={{ headerShown: false }} />
        <Stack.Screen name="register"           options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"             options={{ headerShown: false }} />
        <Stack.Screen name="part-time-map"      options={{ headerShown: false }} />
        <Stack.Screen name="full-time-jobs"     options={{ headerShown: false }} />
        <Stack.Screen name="government-jobs"    options={{ headerShown: false }} />
        <Stack.Screen name="internship"         options={{ headerShown: false }} />
        <Stack.Screen name="cv-generator"       options={{ headerShown: false }} />
        <Stack.Screen name="interview"          options={{ headerShown: false }} />
        <Stack.Screen name="employer-login"     options={{ headerShown: false }} />
        <Stack.Screen name="employer-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="service-dashboard"  options={{ headerShown: false }} />
        <Stack.Screen name="job-detail"         options={{ headerShown: false }} />
        <Stack.Screen name="job-tracking"       options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
