import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { CustomButton, TabHeader } from '@/components';
import { addPreferencesToSettings } from '@/api/firebaseFunctions'; // Import the new function
import { useGlobal } from '@/context/GlobalProvider';

const DrinkPreferencesScreen = () => {
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]); // Track selected drinks
  const { user } = useGlobal();

  // Function to handle drink selection
  const handleSelectDrink = (type: string) => {
    setSelectedDrinks((prev) => {
      if (prev.includes(type)) {
        return prev.filter((drink) => drink !== type); // Deselect drink if already selected
      } else {
        return [...prev, type]; // Add drink to selection
      }
    });
  };

  // Function to save selected drinks to Firebase
  const handleSavePreferences = async () => {
    if (selectedDrinks.length === 0) {
      // If no drinks are selected, show an alert
      Alert.alert('Please select at least one drink.');
      return;
    }

    try {
      // Prepare the settings data to be updated
      const settingsData = {
        drinks: selectedDrinks,  // Add selected drinks here
        allergies: [],  // If you have allergies, add them here
        ingredients: [], // Add selected ingredients if needed
      };

      // Call the addPreferencesToSettings function to save data to Firestore
      await addPreferencesToSettings(user.uid, settingsData); // Use the new function
      console.log('Drinks preferences saved successfully!');
      router.push('/ingredients');  // Navigate to the next screen
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <View className='bg-zinc-100 dark:bg-zinc-900 h-full'>
      <View className='flex px-7 m-0 gap-8 justify-center h-[85%]'>
        <TabHeader title='What type of drinks do you enjoy?' isMain={true}/>
        <View className='flex gap-1 justify-center items-center'>
          {['Cocktail', 'Ordinary Drink', 'Punch / Party Drink', 'Shot', 'Coffee / Tea'].map((type) => (
            <TouchableOpacity
              key={type}
              className={`border-[1px] border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 w-[60%] ${selectedDrinks.includes(type) ? 'bg-green-600' : ''}`}
              onPress={() => handleSelectDrink(type)}
            >
              <Text className={`font-bmedium text-lg text-center ${selectedDrinks.includes(type) ? 'text-zinc-50' : 'text-zinc-900 dark:text-zinc-50'}`}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton title='Next' handlePress={handleSavePreferences}/>
      </View>
    </View>
  );
};

export default DrinkPreferencesScreen;
