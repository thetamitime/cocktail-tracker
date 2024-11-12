import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { db, app } from '@/api/firebaseConfig';
import { getTheme } from '@/api/firebaseFunctions';
import { TabHeader, Subtitle, Field, LanguagePicker, UnitsPicker, ThemeSwitcher, PasswordModal, CustomButton } from '@/components';
import { iconsDark, icons } from '@/constants';
import { useGlobal } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { getAuth, signOut, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';


const SettingsScreen = () => {
  const [form, setForm] = useState<{username: string, email: string, password: string}>({
    username: '',
    email: '',
    password: '',
  })
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const handleSignOut = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      console.log('User signed out successfully');

      // Check if navigation is ready before replacing the route
      router.replace('/');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  const updateUserInfo = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
  
    if (!user) {
      console.error('No user is signed in');
      return;
    }
  
    const updates: { username?: string; email?: string, password?: string } = {};
  
    if (form.username) updates.username = form.username;
    if (form.email) updates.email = form.email;
    if (form.password) updates.password = form.password;
  
    // Show modal for the user to enter their current password
    if (form.email || form.password) setIsModalVisible(true);
  };

  const [colorScheme, setColorScheme] = useState<boolean | null>(null); // Ensure it can be null initially
  const icon = colorScheme ? iconsDark : icons;
  const { user } = useGlobal();

  useEffect(() => {
    const getColorScheme = async () => {
      try {
        if (user && user.uid) {
          const unsubscribeScheme = getTheme(user.uid, (fetchedDark) => {
            setColorScheme(fetchedDark);
          });
          return unsubscribeScheme;
        }
      } catch (err) {
        console.log('Failed to get dark.', err);
      }
    };

    getColorScheme();
  }, [user]);
  
  const handlePasswordSubmit = async (password: string) => {
    // Set the current password to trigger the update
    setCurrentPassword(password);
  
    if (!password) {
      console.error("Password is missing");
      return;
    }
  
    setIsModalVisible(false);  // Close the modal after submitting the password
  
    // Get the current user from Firebase auth
    const auth = getAuth(app);
    const user = auth.currentUser;
  
    if (!user) {
      console.error('No user is signed in');
      return;
    }
  
    // Create the reauthentication credential
    const credential = EmailAuthProvider.credential(user.email!, password);
  
    try {
      // Reauthenticate the user with the entered password
      await reauthenticateWithCredential(user, credential);
  
      // Prepare updates based on form fields
      const updates: { username?: string; email?: string, password?: string } = {};
      if (form.username) updates.username = form.username;
      if (form.email) updates.email = form.email;
      if (form.password) updates.password = form.password;
  
      // Conditionally update email and password if the user provided them
      if (updates.email) {
        await updateEmail(user, updates.email); // Update email in Firebase Auth
        console.log('Email updated successfully');
      }
  
      if (updates.password) {
        await updatePassword(user, updates.password); // Update password in Firebase Auth
        console.log('Password updated successfully');
      }
  
      // Update the displayName (if provided) and Firestore document
      if (updates.username) {
        await updateProfile(user, { displayName: updates.username });
      }
  
      // Update Firestore document with other info (like username)
      await updateDoc(doc(db, 'users', user.uid), updates);
  
      console.log('User info updated successfully');
      await handleSignOut(); // Optionally sign out after update
    } catch (error: any) {
      console.error('Error updating user info:', error.message);
    }
  };  
  
  const handleModalClose = () => {
    setIsModalVisible(false);  // Close the modal without submitting
  };

  return (
    <View className='flex-1 bg-zinc-100 dark:bg-zinc-900 px-7'>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TabHeader title='Settings' leftIcon={ icon.back } rightIcon={icon.logout} handleRightPress={handleSignOut} isMain={false} otherStyles='mb-8'/>

        <Subtitle title='Profile Settings' canExpand={false}/>

        <View className='mt-8 mb-10'>
          <Field 
              title='Username'
              isDark={!!colorScheme}
              value={ form.username }
              placeholder='Enter new username'
              handleChangeText={(e) => setForm({ ...form, username: e })}
              otherStyles='text-zinc-400 dark:text-zinc-500'
          />

          <Field 
            title='Email'
            isDark={!!colorScheme}
            value={ form.email }
            placeholder='Enter new email'
            handleChangeText={(e) => setForm({ ...form, email: e })}
          />

          <Field 
            title='Password'
            isDark={!!colorScheme}
            value={ form.password }
            placeholder='Enter new password'
            handleChangeText={(e) => setForm({ ...form, password: e })}
          />

          <TouchableOpacity 
            className='flex flex-row justify-between items-center px-4 py-3 mt-2 border-[1px] border-zinc-900 dark:border-zinc-200 rounded-xl'
            onPress={() => router.push('/(auth)/drink')}
          >
            <Text className='text-lg font-semibold text-zinc-900 dark:text-zinc-50'>Change preferences</Text>
            <Image source={ icon.right } className='w-7 h-7'/>
          </TouchableOpacity>
        </View>

        <Subtitle title='General Settings' canExpand={false}/>

        <View className='mt-4 mb-4 flex gap-2'>
          <LanguagePicker isDark={!!colorScheme}/>
          <UnitsPicker isDark={!!colorScheme}/>
          <ThemeSwitcher isDark={!!colorScheme}/>
        </View>

        <PasswordModal
          isVisible={isModalVisible}
          onSubmit={handlePasswordSubmit}
          onClose={handleModalClose}
          isDark={!!colorScheme}
        />
      </ScrollView>
      
      <CustomButton 
          title='Save'
          large={true}
          containerStyles='mt-3'
          handlePress={updateUserInfo}
      />
    </View>
  )
}

export default SettingsScreen;