import { View, Text, FlatList, Button, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CustomButton, DrinkDisplay, SearchField, TabHeader } from '@/components';
import { icons, iconsDark } from '@/constants';
import { fetchCocktailsByCategory } from '@/api/cocktailApi';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '@/api/firebaseFunctions';
import { useGlobal } from '@/context/GlobalProvider';

const ViewAllScreen: React.FC = () => {
  const [cocktails, setCocktails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [colorScheme, setColorScheme] = useState<boolean>();

  const params = useLocalSearchParams<{ category: string, hasSearch?: string }>();
  const { user } = useGlobal();
  
  const hasSearch = params.hasSearch === 'true';
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
  
  const categoryMapping: { [key: string]: string } = {
    'Ordinary': 'Ordinary Drink',
    'Cocktails': 'Cocktail',
    'Punch': 'Punch / Party Drink',
    'Other': 'Other / Unknown',
    'Coffee': 'Coffee / Tea'
  };

  const adjustedCategory = categoryMapping[params.category] || params.category;
  const title = adjustedCategory.charAt(0).toUpperCase() + adjustedCategory.slice(1);

  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadCocktailsFromStorage = async () => {
      try {
        const storedCocktails = await AsyncStorage.getItem(`cocktails_${adjustedCategory}`);
        if (storedCocktails) {
          const parsedCocktails = JSON.parse(storedCocktails);
          setCocktails(parsedCocktails);
        } else {
          await getCocktailsByCategory();
        }
      } catch (error) {
        setError("Failed to load cocktails from storage.");
      } finally {
        setLoading(false);
      }
    };

    loadCocktailsFromStorage();
  }, [adjustedCategory]);

  const getCocktailsByCategory = async () => {
    setLoading(true);
    try {
      const fetchedCocktails = await fetchCocktailsByCategory(adjustedCategory);
      if (fetchedCocktails && fetchedCocktails.length > 0) {
        setCocktails(fetchedCocktails);
        await AsyncStorage.setItem(`cocktails_${adjustedCategory}`, JSON.stringify(fetchedCocktails));
      } else {
        setError('No cocktails found for this category.');
      }
    } catch (err) {
      setError('Failed to load cocktails.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setVisibleCount(prevCount => {
      const newCount = prevCount + 20;
      return newCount > cocktails.length ? cocktails.length : newCount;
    });
  };

  const renderFooter = () => {
    if (cocktails.length > visibleCount) {
      return (
        <CustomButton title='Load More' handlePress={loadMore} containerStyles='mt-4'/>
      );
    }
    
    return null;
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View>
        <Text style={{ color: 'red' }}>{error}</Text>
        <Button title="Retry" onPress={getCocktailsByCategory} />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-zinc-100 dark:bg-zinc-900 px-7'>
      <FlatList
        data={cocktails.slice(0, visibleCount)}
        keyExtractor={item => item.idDrink}
        className='pb-4'
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className='bg-zinc-100 dark:bg-zinc-900 mb-4'>
            <TabHeader title={title} isMain={true} leftIcon={icon.back} />
          </View>
        }
        renderItem={({ item }) =>
          <DrinkDisplay id={item.idDrink} mode='default'/>
        }
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default ViewAllScreen;
