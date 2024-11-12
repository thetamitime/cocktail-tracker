import { Stack } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GlobalProvider, useGlobal } from "@/context/GlobalProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "BeVietnamPro-Bold": require("../assets/fonts/BeVietnamPro-Bold.ttf"),
    "BeVietnamPro-Medium": require("../assets/fonts/BeVietnamPro-Medium.ttf"),
    "BeVietnamPro-Regular": require("../assets/fonts/BeVietnamPro-Regular.ttf"),
    "BeVietnamPro-SemiBold": require("../assets/fonts/BeVietnamPro-SemiBold.ttf"),
    "BeVietnamPro-ExtraBold": require("../assets/fonts/BeVietnamPro-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);
  
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </GlobalProvider>
  );
}
