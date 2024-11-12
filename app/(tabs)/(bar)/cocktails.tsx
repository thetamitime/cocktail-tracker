import { fetchCocktailByIngredient } from "@/api/cocktailApi";
import { getUserIngredients, updateAvailableCocktails } from "@/api/firebaseFunctions";
import { CustomButton, DrinkDisplay } from "@/components";
import { useGlobal } from "@/context/GlobalProvider";
import { useState, useEffect } from "react";
import { FlatList, TouchableOpacity, View, Text } from "react-native";

export default function CocktailsScreen() {
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [filteredDrinks, setFilteredDrinks] = useState<any[]>([]); // Adjust the type based on your drink structure
  const [displayedCount, setDisplayedCount] = useState(10); // Initial count of cocktails to display

  const { user } = useGlobal();

  useEffect(() => {
    const unsubscribe = getUserIngredients(user.uid, (ingredients) => {
      setUserIngredients(ingredients);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    const fetchDrinks = async () => {
      if (userIngredients.length > 0) {
        const drinksWithIngredients: any[] = [];

        // Fetch cocktails for each ingredient
        for (const ingredient of userIngredients) {
          const cocktails = await fetchCocktailByIngredient(ingredient);
          drinksWithIngredients.push(...cocktails);
        }

        // Remove duplicates based on idDrink
        const uniqueDrinks = Array.from(new Set(drinksWithIngredients.map(d => d.idDrink)))
          .map(id => drinksWithIngredients.find(d => d.idDrink === id));

        setFilteredDrinks(uniqueDrinks);

        // Update available cocktails count in Firestore
        const availableCocktailsCount = uniqueDrinks.length;
        await updateAvailableCocktails(user.uid, availableCocktailsCount); // Call the function to update count
      } else {
        setFilteredDrinks([]); // No ingredients, no drinks
        await updateAvailableCocktails(user.uid, 0); // Reset count to 0 if no ingredients
      }
    };

    fetchDrinks();
  }, [userIngredients]);

  const loadMore = () => {
    setDisplayedCount(prevCount => prevCount + 10); // Load 10 more cocktails
  };

  const renderFooter = () => {
    if (displayedCount < filteredDrinks.length) {
      return (
        <CustomButton title='Load More' handlePress={loadMore}/>
      );
    }
    return null; // Return null if no more cocktails to load
  };

  return (
    <View className="bg-zinc-100 dark:bg-zinc-900">
      <FlatList
        data={filteredDrinks.slice(0, displayedCount)} // Limit the number of displayed cocktails
        keyExtractor={item => item.idDrink}
        className="mt-5 px-7 h-full"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => 
          <DrinkDisplay id={item.idDrink} mode="cocktailScreen"/>
        }
        ListFooterComponent={renderFooter} // Use renderFooter for the footer component
      />
    </View>
  );
}
