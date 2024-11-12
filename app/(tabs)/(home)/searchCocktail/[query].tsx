import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CustomButton, DrinkDisplay, SearchField, TabHeader } from '@/components';
import { icons, iconsDark } from '@/constants';
import { useLocalSearchParams } from 'expo-router';
import { fetchCocktailByName } from '@/api/cocktailApi';
import { Drink } from '../../(search)/search';
import { useGlobal } from '@/context/GlobalProvider';
import { getTheme } from '@/api/firebaseFunctions';

const SearchCocktails: React.FC = () => {
  const params = useLocalSearchParams<{ query: string }>();
  const [fetchedDrinks, setFetchedDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  const { user } = useGlobal();
  const [colorScheme, setColorScheme] = useState<boolean>();
  const icon = !colorScheme ? icons : iconsDark;

  useEffect(() => {
    const getColorScheme = async () => {
      try {
        const unsubscribeScheme = await getTheme(user.uid, (fetchedDark) => {
          setColorScheme(fetchedDark); // Update units with the value from Firestore
        });
        return unsubscribeScheme; // Return unsubscribe function for cleanup
      } catch (err) {
          console.log('Failed to get dark.', err);
      }
    };

    getColorScheme();
  }, [user.uid]);

  useEffect(() => {
    const getCocktailByName = async () => {
      const drinksFromApi = await fetchCocktailByName(params.query);

      // Check if drinks were found
      if (drinksFromApi === "None Found") {
        setFetchedDrinks([]);
      } else {
        const sortedDrinks = drinksFromApi.sort((a: Drink, b: Drink) => {
          return a.strDrink.localeCompare(b.strDrink); // Compare by drink name
        });

        setFetchedDrinks(sortedDrinks);
      }

      setLoading(false); 
    }

    getCocktailByName();
  }, [params.query]);

  const loadMore = () => {
    setVisibleCount((prevCount) => {
      const newCount = prevCount + 10; // Increase the count by 20
      return newCount > fetchedDrinks.length ? fetchedDrinks.length : newCount; // Ensure it doesn't exceed the total number of fetched drinks
    });
  };

  const renderDrinkItem = ({ item }: { item: Drink }) => {
    return <DrinkDisplay id={item.idDrink} mode={'default'} />;
  };

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 px-7">
      <FlatList
        data={fetchedDrinks.slice(0, visibleCount)}
        keyExtractor={(item) => item.idDrink}
        className="pb-4"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className="bg-zinc-100 dark:bg-zinc-900 mb-4">
            <TabHeader title={`Search: "${params.query}"`} isMain={true} leftIcon={icon.back} />
            {loading ? ( // Conditional rendering based on loading state
              <View className="h-[65%] justify-center items-center">
                <ActivityIndicator size="large" color="#a0aec0" />
              </View>
            ) : fetchedDrinks.length === 0 ? (
              <View className="h-full justify-center items-center">
                <Text className="text-lg text-zinc-400 dark:text-zinc-500">Nothing found.</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={renderDrinkItem}
        ListFooterComponent={
          fetchedDrinks.length > visibleCount ? (
            <View className="mt-4">
              <CustomButton title="Load More" handlePress={loadMore} containerStyles="mt-4" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default SearchCocktails;
