import { View, Text, FlatList, Button, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { DrinkDisplay, SearchField, TabHeader } from '@/components';
import { icons, iconsDark } from '@/constants';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobal } from '@/context/GlobalProvider';
import { getTheme, getUserFavorites } from '@/api/firebaseFunctions';
import { fetchCocktailByName, fetchCocktailById } from '@/api/cocktailApi'; // Ensure these are imported
import debounce from 'lodash.debounce';

interface FavoriteDrink {
  idDrink: string;  // ID of the drink
  date: string;     // Date added (ISO string)
}

const ViewAllScreen: React.FC = () => {
  const { user } = useGlobal();
  const [cocktails, setCocktails] = useState<FavoriteDrink[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const params = useLocalSearchParams<{ category: string, hasSearch?: string }>();
  const hasSearch = params.hasSearch === 'true';
  const [query, setQuery] = useState('');
  const [filteredCocktails, setFilteredCocktails] = useState<FavoriteDrink[]>([]);
  const [loading, setLoading] = useState(true);

  const [colorScheme, setColorScheme] = useState<boolean | null>(null); // Ensure it can be null initially
  const icon = colorScheme ? iconsDark : icons;

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
    if (user?.uid) {
      const unsubscribe = getUserFavorites(user.uid, (favoriteDrinks) => {
        setCocktails(favoriteDrinks);
        setFilteredCocktails(favoriteDrinks); // Initialize filtered cocktails
        setLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  const debouncedFetchDrinks = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim() === '') {
        setFilteredCocktails(cocktails); // Reset to all cocktails if query is empty
        return;
      }

      // Fetch cocktails by name
      const drinksFromApi = await fetchCocktailByName(searchQuery);
      
      // Filter the cocktails based on the fetched drinks
      const matchingCocktails = cocktails.filter(cocktail => 
        drinksFromApi.some((drink: { idDrink: string; }) => drink.idDrink === cocktail.idDrink)
      );

      // Update filtered cocktails state
      setFilteredCocktails(matchingCocktails);
    }, 500),
    [cocktails] // Recreate the debounce function if cocktails change
  );

  // Fetch drinks based on the search query
  useEffect(() => {
    debouncedFetchDrinks(query);
    return () => {
      debouncedFetchDrinks.cancel(); // Cleanup debounce on unmount
    };
  }, [query, debouncedFetchDrinks]);

  const loadMore = () => {
    setVisibleCount(prevCount => {
      const newCount = prevCount + 20;
      return newCount > filteredCocktails.length ? filteredCocktails.length : newCount;
    });
  };

  const handleSearchTextChange = (text: string) => {
    setQuery(text);
  };

  return (
    <View className='flex-1 bg-zinc-100 dark:bg-zinc-900 px-7'>
      <FlatList
        data={filteredCocktails.slice(0, visibleCount)}
        keyExtractor={item => item.idDrink}
        className='pb-4'
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className='bg-zinc-100 dark:bg-zinc-900 mb-4'>
            <TabHeader title={params.category} isMain={true} leftIcon={icon.back} />
            {hasSearch && (
              <SearchField
                isDark={!!colorScheme}
                placeholder='Search for drink'
                value={query}
                handleChangeText={handleSearchTextChange}
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <DrinkDisplay id={item.idDrink} mode='default'/>
        )}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#3f8efc" />
      ) : filteredCocktails.length > visibleCount && (
        <Button title="Load More" onPress={loadMore}/>
      )}
      {filteredCocktails.length === 0 && !loading && (
        <View className="h-[65%] justify-center items-center">
          <Text className="text-lg text-zinc-400 dark:text-zinc-500">No drinks found.</Text>
        </View>
      )}
    </View>
  );
};

export default ViewAllScreen;
