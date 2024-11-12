import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { addPreferencesToSettings } from '@/api/firebaseFunctions';
import { useGlobal } from '@/context/GlobalProvider';
import { CustomButton, TabHeader } from '@/components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/api/firebaseConfig';

const IngredientsPreferencesScreen = ({ userId }: { userId: string }) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]); // Track selected ingredients
  const { user } = useGlobal();

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleSavePreferences = async () => {
    if (selectedIngredients.length === 0) {
        // If no drinks are selected, show an alert
        Alert.alert('Please select at least one drink.');
        return;
    }

    try {
      // Retrieve existing preferences from Firestore (for drinks and allergies)
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Merge existing data with new selected ingredients
      const settingsData = {
        allergies: userData?.settings?.preferences?.allergies || [],  // Keep existing allergies
        drinks: userData?.settings?.preferences?.drinks || [],  // Keep existing drinks
        ingredients: selectedIngredients,  // Only update ingredients
      };

      // Call the addPreferencesToSettings function to save data to Firestore
      await addPreferencesToSettings(user.uid, settingsData);
      console.log('Ingredients preferences saved successfully!');
      router.push('/allergies');  // Navigate to the next screen
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <View className='bg-zinc-100 dark:bg-zinc-900 h-full'>
      <View className="flex px-7 m-0 gap-4 justify-center h-[90%]">
        <TabHeader title='Which basic ingredients would you like to include in your drinks?' isMain={true}/>

        <View className='flex gap-1 justify-center items-center'>
          {['Light rum', 'Vodka', 'Gin', 'Bourbon', 'Tequila'].map((ingredient) => (
            <TouchableOpacity
              key={ingredient}
              className={`border-[1px] border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 w-[60%] ${selectedIngredients.includes(ingredient) ? 'bg-green-600' : ''}`}
              onPress={() => toggleIngredient(ingredient)}
            >
              <Text className={`font-bmedium text-lg text-center ${selectedIngredients.includes(ingredient) ? 'text-zinc-50' : 'text-zinc-900 dark:text-zinc-50'}`}>{ingredient}</Text>
            </TouchableOpacity>
          ))}

          <CustomButton title='Next' handlePress={handleSavePreferences} containerStyles='mt-4'/>
        </View>
      </View>
    </View>
  );
};

export default IngredientsPreferencesScreen;
