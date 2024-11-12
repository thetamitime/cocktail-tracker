import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { CustomButton, Field } from '@/components';
import { signInWithPersistence } from '@/api/firebaseFunctions'; // Adjust path if necessary

interface Form {
  email: string;
  password: string;
}

const SignIn = () => {
  const [form, setForm] = useState<Form>({
    email: '',
    password: '',
  });

  // Function to handle user sign-in
  const handleSignIn = async () => {
    const { email, password } = form;
    try {
      // Attempt to sign in with Firebase and save user to AsyncStorage
      await signInWithPersistence(email, password);
      // Navigate to home screen upon successful sign-in
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Sign-in Error', 'Please check your email and password.');
    }
  };

  const isDark = useColorScheme() === 'dark' ? true : false;

  return (
    <SafeAreaView className="bg-zinc-100 dark:bg-zinc-900 h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-7">
          <Text className="text-4xl font-bbold mb-8 text-zinc-900 dark:text-zinc-50">Sign in</Text>

          <Field
            isDark={isDark}
            title="Email"
            value={form.email}
            placeholder="Enter your email"
            handleChangeText={(e) => setForm({ ...form, email: e })}
          />

          <Field
            isDark={isDark}
            title="Password"
            value={form.password}
            placeholder="Enter your password"
            handleChangeText={(e) => setForm({ ...form, password: e })}
          />

          <CustomButton
            title="Sign in"
            large={true}
            containerStyles="mt-8"
            handlePress={handleSignIn} // Call the sign-in function on button press
          />

          <Text className="font-bregular text-center text-zinc-400 dark:text-zinc-500">
            Don't have an account?{' '}
            <Link href="/(auth)/sign-up" className="text-blue-400 dark:text-blue-500">
              Sign up
            </Link>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
