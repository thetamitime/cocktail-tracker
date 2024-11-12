import { useEffect, useState } from "react";
import { auth } from "@/api/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { CustomButton } from "@/components/index";
import { images } from "@/constants/index";
import { Link, router } from "expo-router";
import { Text, View, Image, ActivityIndicator } from "react-native";

export default function Welcome() {
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/(tabs)/home"); // Redirect to home if logged in
      }
      setIsLoading(false); // Stop loading once authentication state is checked
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="h-full">
      <View className="w-full h-3/4">
        <Image source={images.thumbnail} className="w-full h-full" resizeMode="cover" />
      </View>

      <View className="absolute bottom-0 w-full h-2/5 bg-zinc-50 dark:bg-zinc-900 items-center justify-center px-10 rounded-t-[56px] shadow-[0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 -4px 6px -4px rgb(0 0 0 / 0.1)]">
        <Text className="text-4xl font-bextrabold text-zinc-900 dark:text-zinc-50 mb-3">MixTale</Text>
        <Text className="text-lg font-bregular text-center text-zinc-900 dark:text-zinc-50 w-64 mb-9">
          Discover your new favourite thing to drink
        </Text>

        <CustomButton
          title="Get started"
          large={true}
          handlePress={() => router.push("/(auth)/sign-up")}
        />

        <Text className="font-bregular text-center text-zinc-400 dark:text-zinc-500">
          Already have an account?{" "}
          <Link href="/(auth)/sign-in" className="text-blue-400 dark:text-blue-500">Log in</Link>
        </Text>
      </View>
    </View>
  );
}
