import { View, Text, ScrollView, SafeAreaView, useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { CustomButton, Field } from '@/components';
import { signUpUser } from '@/api/firebaseFunctions';

interface Form {
  username: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const [form, setForm] = useState<Form>({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    try {
      await signUpUser(form.email, form.password, form.username);
      router.push('/(prefs)/drink');
    } catch (error) {
      setError(error.message || 'Failed to sign up'); // Display error if sign-up fails
    }
  };

  const isDark = useColorScheme() === 'dark' ? true : false;

  return (
    <SafeAreaView className="bg-zinc-100 dark:bg-zinc-900 h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-7">
          <Text className="text-4xl font-bbold mb-8 text-zinc-900 dark:text-zinc-50">Sign up</Text>

          <Field
            isDark={isDark}
            title="Username"
            value={form.username}
            placeholder="Enter your username"
            handleChangeText={(e) => setForm({ ...form, username: e })}
          />

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

          {error && <Text className="text-red-500 text-center mt-4">{error}</Text>}

          <CustomButton
            title="Sign up"
            large={true}
            containerStyles="mt-8"
            handlePress={handleSignUp}
          />

          <Text className="font-bregular text-center text-zinc-400 dark:text-zinc-500">
            Already have an account?{' '}
            <Link href="/(auth)/sign-in" className="text-blue-400 dark:text-blue-500">
              Log in
            </Link>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
