import { fetchDrinksByCategoryWithPreferences, fetchRandomCocktail } from '@/api/cocktailApi';
import { getTheme, fetchUserPreferences } from '@/api/firebaseFunctions';
import { TabHeader, SearchField, CustomButton, Subtitle, DrinkDisplay } from '@/components';
import { icons } from '@/constants';
import { useGlobal } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Button, ActivityIndicator } from 'react-native';

const HomeScreen = () => {
  const { user } = useGlobal();
  const [defaultDrinks, setDefaultDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [colorScheme, setColorScheme] = useState<boolean>();

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

  const loadDefaultDrinks = async () => {
    try {
      setLoading(true);
      if (user && user.uid) {
        const preferences = await fetchUserPreferences(user.uid);
        const randomCategory = preferences.drinks[Math.floor(Math.random() * preferences.drinks.length)];
        const drinks = await fetchDrinksByCategoryWithPreferences(randomCategory, preferences);
        setDefaultDrinks(drinks);
      }
    } catch (error) {
      console.error("Error loading drinks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.uid) {
      loadDefaultDrinks();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Loading placeholder component with similar structure
  if (loading) {
    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 px-7 pb-5">
        <View>
          <TabHeader title="What would you like to mix today?" isMain={true} />
          <SearchField placeholder="Search for drink" value="" handleChangeText={() => {}} isDark={!colorScheme}/>
          <CustomButton title="Get random recipe" containerStyles="mt-3" handlePress={() => {}} />
          <Subtitle title="Categories" canExpand={false} />
          <View className="flex flex-row justify-between mt-4">
            {[...Array(4)].map((_, index) => (
              <View
                key={index}
                className="bg-zinc-50 dark:bg-zinc-800 w-[80px] h-[90px] rounded-xl flex items-center justify-center drop-shadow-lg"
              >
                <ActivityIndicator size="small" color="#000" />
              </View>
            ))}
          </View>
          <Subtitle title="Just for you" otherStyles="mt-10 mb-2" canExpand={false} />
        </View>
        <FlatList
          data={Array(5).fill({})} // Placeholder array for loading items
          keyExtractor={(_, index) => `placeholder-${index}`}
          renderItem={() => (
            <View className="bg-gray-200 rounded-xl w-full h-20 my-2" />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      <FlatList
        data={defaultDrinks}
        keyExtractor={(item) => item.idDrink}
        showsVerticalScrollIndicator={false}
        className="px-7 pb-5"
        ListHeaderComponent={() => <HomeHeader isDark={!!colorScheme}/>}
        renderItem={({ item }) => <DrinkDisplay id={item.idDrink} mode="default" />}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text className='text-zinc-900 dark:text-zinc-50 text-xl font-bmedium'>No drinks found. Try reloading!</Text>
            <Button title="Reload" onPress={loadDefaultDrinks} />
          </View>
        )}
      />
    </View>
  );
};

const Category: React.FC<{title: string}> = ({ title }) => (
  <TouchableOpacity
    className="bg-zinc-50 dark:bg-zinc-800 drop-shadow-lg rounded-xl w-[80px] py-3 mt-4 flex items-center justify-center gap-1"
    activeOpacity={0.7}
    onPress={() => router.push(`/category/${title}`)}
  >
    <Image source={icons[title.toLowerCase()]} className="w-8 h-8" resizeMode="contain" />
    <Text className="font-bregular text-base text-zinc-900 dark:text-zinc-50">{title}</Text>
  </TouchableOpacity>
);

const HomeHeader: React.FC<{isDark: boolean}> = ({isDark}) => {
  const [query, setQuery] = useState('');

  const handleRandomCocktail = async () => {
    try {
      const randomCocktail = await fetchRandomCocktail();
      if (randomCocktail) {
        router.push(`/card/${randomCocktail.idDrink}`);
      }
    } catch (error) {
      console.error('Error fetching random cocktail:', error);
    }
  };

  return (
    <View>
      <TabHeader title="What would you like to mix today?" isMain={true} />
      <SearchField
        placeholder="Search for drink"
        value={query}
        handleChangeText={(e) => setQuery(e)}
        handleSubmit={() => router.push(`/searchCocktail/${query}`)}
        isDark={isDark}
      />
      <CustomButton title="Get random recipe" containerStyles="mt-3" handlePress={handleRandomCocktail} />
      <Subtitle title="Categories" canExpand={true} handlePress={() => router.push('/all-categories')} otherStyles="mt-8" />
      <View className="flex flex-row justify-between">
        <Category title="Ordinary" />
        <Category title="Cocktail" />
        <Category title="Beer" />
        <Category title="Coffee" />
      </View>
      <Subtitle title="Just for you" canExpand={false} otherStyles="mt-10 mb-2" />
    </View>
  );
};

export default HomeScreen;
