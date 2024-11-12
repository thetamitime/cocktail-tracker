import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { icons, iconsDark } from '@/constants';
import { router } from 'expo-router';
import { fetchCocktailById } from '@/api/cocktailApi';
import { addDrinkToFavorites, getUserFavorites, removeDrinkFromFavorites, getUserIngredients, getTheme } from '@/api/firebaseFunctions';
import { useGlobal } from '@/context/GlobalProvider';

interface Cocktail {
  idDrink: string;
  strDrink: string;
  strCategory: string;
  strDrinkThumb: string;
  [key: string]: any;
}

interface DrinkDisplayProps {
  id: string;
  mode: 'default' | 'cocktailScreen'; // New mode prop
}

export const DrinkDisplay: React.FC<DrinkDisplayProps> = ({ id, mode }) => {
  const { user } = useGlobal();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [colorScheme, setColorScheme] = useState<boolean>();
  
  const icon = !colorScheme ? icons : iconsDark;

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

  useEffect(() => {
    const getCocktailDetails = async () => {
      try {
        const response = await fetchCocktailById(id);
        const fetchedCocktail: Cocktail = response?.drinks ? response.drinks[0] : response;

        if (fetchedCocktail) {
          setCocktail(fetchedCocktail);
          
          // Fetch user favorites and check if the current cocktail is liked
          const unsubscribeFavorites = getUserFavorites(user.uid, (favorites) => {
            setIsLiked(favorites.some(favorite => favorite.idDrink === id));
          });

          // If in cocktail screen mode, fetch available ingredients
          if (mode === 'cocktailScreen') {
            const unsubscribeIngredients = getUserIngredients(user.uid, (barIngredients) => {
              const ingredientsList: string[] = [];

              // Collect cocktail ingredients
              for (let i = 1; i <= 15; i++) {
                const ingredient = fetchedCocktail[`strIngredient${i}`];
                if (ingredient) ingredientsList.push(ingredient);
              }

              // Set available ingredients based on user's bar (case-insensitive comparison)
              const available = ingredientsList.filter(ing => 
                barIngredients.map(barIng => barIng.toLowerCase()).includes(ing.toLowerCase())
              );
              setAvailableIngredients(available);
            });

            // Cleanup listeners on unmount
            return () => {
              unsubscribeFavorites();
              unsubscribeIngredients();
            };
          } else {
            // Cleanup listener on unmount
            return () => unsubscribeFavorites();
          }
        } else {
          throw new Error("No cocktail data found");
        }
      } catch (err) {
        setError('Failed to load cocktail details.');
        console.error('Error fetching cocktail by ID:', id, err);
      } finally {
        setLoading(false);
      }
    };

    getCocktailDetails();
  }, [id, mode]);

  const ingredients: string[] = [];
  if (cocktail) {
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}`];
      if (ingredient) ingredients.push(ingredient);
    }
  }

  const handleLikePress = async () => {
    if (isLiked) {
      // If already liked, remove from favorites
      await removeDrinkFromFavorites(user.uid, id);
      setIsLiked(false);
    } else {
      // If not liked, add to favorites
      await addDrinkToFavorites(user.uid, id);
      setIsLiked(true);
    }
  };

  const Placeholder = () => (
    <View className="flex flex-row justify-between items-center my-3">
      <View className="w-28 h-28 rounded-2xl bg-zinc-300 dark:bg-zinc-800" />
      <View className="w-2/4 flex gap-1">
        <View className="h-6 bg-zinc-300 dark:bg-zinc-800 rounded-md" />
        <View className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded-md w-3/4" />
        <View className="flex flex-row flex-wrap gap-1 mt-1">
          {[...Array(3)].map((_, index) => (
            <View key={index} className="py-1 px-2 bg-zinc-300 dark:bg-zinc-800 rounded-md self-start h-2 w-2"></View>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) return <Placeholder />;
  if (error) return <Text>{error}</Text>;

  return (
    <TouchableOpacity
      key={cocktail?.idDrink}
      className="flex flex-row justify-between items-center my-3"
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: `/card/[id]` as never,
          params: {
            id: cocktail?.idDrink,
          } as never,
        })
      }
    >
      <Image 
        source={{ uri: cocktail?.strDrinkThumb }} 
        className="w-28 h-28 rounded-2xl" 
        resizeMode="cover" 
      />
      <View className="w-2/4 flex gap-1">
        <Text className="font-bsemibold text-xl text-zinc-900 dark:text-zinc-50 leading-5">{cocktail?.strDrink}</Text>
        <Text className="font-bregular text-base text-zinc-400 dark:text-zinc-500">{cocktail?.strCategory}</Text>
        <View className="flex flex-row flex-wrap gap-1 mt-1">
          {ingredients.map((ingr, index) => (
            <View 
              key={index} 
              className={`py-1 px-2 ${mode === 'cocktailScreen' ? availableIngredients.includes(ingr) ? 'bg-green-600' : 'bg-zinc-200 dark:bg-zinc-800' : 'bg-orange-600'} rounded-md self-start`}
            >
              <Text className={`font-bmedium text-sm text-center ${(mode !== 'cocktailScreen' || availableIngredients.includes(ingr)) ? 'text-zinc-50' : 'text-zinc-400'}`}>{ingr}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity onPress={handleLikePress} activeOpacity={0.5}>
        <Image source={!isLiked ? icon.like : icon.liked} className="w-8 h-8" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
