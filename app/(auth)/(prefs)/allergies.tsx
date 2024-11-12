// src/pages/allergies.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { addPreferencesToSettings } from '@/api/firebaseFunctions';
import { useGlobal } from '@/context/GlobalProvider';
import { CustomButton, TabHeader } from '@/components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/api/firebaseConfig';

const AllergiesScreen = () => {
  const [allergicIngredients, setAllergicIngredients] = useState<string[]>([]);

  const { user } = useGlobal();

  const toggleAllergy = (ingredient: string) => {
    setAllergicIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleSavePreferences = async () => {
    try {
      // Retrieve existing preferences from Firestore (for drinks and ingredients)
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Merge existing data with new allergic ingredients
      const settingsData = {
        drinks: userData?.settings?.preferences?.drinks || [],  // Keep existing drinks
        ingredients: userData?.settings?.preferences?.ingredients || [],  // Keep existing ingredients
        allergies: allergicIngredients,  // Only update allergies
      };

      // Call the addPreferencesToSettings function to save data to Firestore
      await addPreferencesToSettings(user.uid, settingsData);
      console.log('Allergies preferences saved successfully!');
      router.replace('/(tabs)/home');  // Navigate to the home screen
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <View className='bg-zinc-100 dark:bg-zinc-900 h-full'>
      <View className="flex px-7 m-0 gap-4 justify-center h-[90%]">
        <TabHeader title='Do you have allergies to any of the following ingredients?' isMain={true} />

        <View className="flex gap-1 justify-center items-center">
          {['Light rum', 'Vodka', 'Gin', 'Bourbon', 'Tequila'].map((ingredient) => (
            <TouchableOpacity
              key={ingredient}
              className={`border-[1px] border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 w-[60%] ${allergicIngredients.includes(ingredient) ? 'bg-red-600' : ''}`}
              onPress={() => toggleAllergy(ingredient)}
            >
              <Text className={`font-bmedium text-lg text-center ${allergicIngredients.includes(ingredient) ? 'text-zinc-50' : 'text-zinc-900 dark:text-zinc-50'}`}>{ingredient}</Text>
            </TouchableOpacity>
          ))}

          <CustomButton title="Finish" handlePress={handleSavePreferences} containerStyles="mt-4" />
        </View>
      </View>
    </View>
  );
};

export default AllergiesScreen;
