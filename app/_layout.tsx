import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout() {
  return (
    <CartProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome/index" />
          <Stack.Screen name="language/select-language" />
          <Stack.Screen name="location/select-location" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </CartProvider>
  );
}




