import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { Theme } from "../constants/Theme";
import { AuthProvider } from "../context/AuthContext";
import { AppLockWrapper } from "../components/AppLockWrapper";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLockWrapper>
        <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Theme.colors.background,
              },
              headerTintColor: Theme.colors.primary,
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: Theme.colors.background,
              },
            }}
          >
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/pairing" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </View>
      </AppLockWrapper>
    </AuthProvider>
  );
}
