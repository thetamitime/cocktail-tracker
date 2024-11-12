import { getTheme, getUserIngredients, removeIngredientFromBar } from "@/api/firebaseFunctions";
import { CombinedIngredientsModal, IngredientDisplay } from "@/components";
import { icons } from "@/constants";
import { useGlobal } from "@/context/GlobalProvider";
import { useState, useEffect } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";

export default function IngredientsScreen() {
  const [ingredientsModalVisible, setIngredientsModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const { user } = useGlobal(); // Get the user ID from context

  const [colorScheme, setColorScheme] = useState<boolean | null>(null); // Ensure it can be null initially

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

  // Set up real-time listener for user ingredients
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = getUserIngredients(user.uid, setSelectedIngredients); // Use setSelectedIngredients directly
      return () => unsubscribe(); // Cleanup listener on unmount
    }
  }, [user]);

  // Function to delete an ingredient and update Firebase
  const handleDeleteIngredient = async (ingredient: string) => {
    if (user?.uid) {
      try {
        await removeIngredientFromBar(user.uid, ingredient);
        console.log('Ingredient removed from Firebase');
      } catch (error) {
        console.error('Error removing ingredient from Firebase:', error);
      }
    }
  };

  return (
    <View className="h-full bg-zinc-100 dark:bg-zinc-900">
      <TouchableOpacity 
        className="absolute z-10 right-4 bottom-8 bg-orange-600 shadow-sm w-16 h-16 justify-center items-center rounded-full" 
        activeOpacity={1} 
        onPress={() => setIngredientsModalVisible(true)}
      >
        <Image source={icons.plus} className='w-8 h-8'/>
      </TouchableOpacity>

      <CombinedIngredientsModal
        isDark={!colorScheme}
        visible={ingredientsModalVisible}
        onClose={() => setIngredientsModalVisible(false)}
        onSelectIngredient={() => null}
        selectedIngredients={selectedIngredients}
        isBarModal={true}
      />

      <FlatList
        data={selectedIngredients}
        keyExtractor={item => item}
        className="mt-5 px-7 pb-5"
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => 
          <IngredientDisplay
            isDark={!!colorScheme} 
            strIngredient={item} 
            canBeChosen={false} 
            isSelected={true} // Indicate that these ingredients are selected
            onDelete={() => handleDeleteIngredient(item)} // Pass delete function with Firebase update
          />
        }
      />
    </View>
  );
}
