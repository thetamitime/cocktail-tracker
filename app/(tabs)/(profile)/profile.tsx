import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { DrinkDisplay, Subtitle, TabHeader } from '@/components';
import { router } from 'expo-router';
import { icons, iconsDark, images } from '@/constants';
import { useGlobal } from '@/context/GlobalProvider';
import { getTheme, getUserFavorites, getUserIngredients, getUsername } from '@/api/firebaseFunctions';

const ProfileScreen = () => {
  const { user, loading } = useGlobal();
  const [username, setUsername] = useState<string | null>(null);
  const [ingredientCount, setIngredientCount] = useState<number>(0);
  const [likedDrinks, setLikedDrinks] = useState<any[]>([]); // Use appropriate type for favorite drinks

  useEffect(() => {
    if (!loading && user) {
      // Use the real-time listener for username updates
      const unsubscribe = getUsername(user.uid, (newUsername) => {
        setUsername(newUsername); // Update state with the new username
      });

      // Clean up the listener when the component unmounts or when the user changes
      return () => unsubscribe();
    }
  }, [loading, user]); 

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const unsubscribeIngredients = getUserIngredients(user.uid, (_, count) => {
          setIngredientCount(count);
        });
    
        const unsubscribe = getUserFavorites(user.uid, (likedDrinksData) => {
          setLikedDrinks(likedDrinksData);
        });

        return () => {
          unsubscribeIngredients();
          unsubscribe();
        };
      }
    };

    fetchUserData();
  }, [user]);

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
  
  const ProfileHeader: React.FC = () => {
    return (
      <View>
        <TabHeader
          title="Hello,"
          name={username || 'User'}
          isMain={true}
          rightIcon={icon.settings}
          handleRightPress={() => router.push('/settings')}
        />

        <View className="mt-6 mb-2 flex gap-4 items-center justify-center">
          <TouchableOpacity className="mb-2">
            <Image source={images.thumbnail} className="w-32 h-32 rounded-full" />
          </TouchableOpacity>

          <View className="flex flex-row items-center gap-4 px-3 py-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border-[1px] border-zinc-200 dark:border-zinc-700">
            <View className="flex gap-2 justify-center items-center">
              <Text className="font-bmedium text-base self-stretch text-zinc-400 dark:text-zinc-500">Total ingredients</Text>
              <Text className="font-bbold text-lg text-center self-stretch text-zinc-900 dark:text-zinc-200">{ingredientCount}</Text>
            </View>
            <View className="flex gap-2 justify-center items-center">
              <Text className="font-bmedium text-base self-stretch text-zinc-400 dark:text-zinc-500">Favourite drinks</Text>
              <Text className="font-bbold text-lg text-center self-stretch text-zinc-900 dark:text-zinc-200">{likedDrinks.length}</Text>
            </View>
          </View>
        </View>

        <Subtitle
          title="Your favourite drinks"
          canExpand={true}
          otherStyles="mt-8 mb-2"
          handlePress={() => router.push(`/category/Favourite drinks?hasSearch=true` as never)}
        />
      </View>
    );
  };

  const latestDrinks = likedDrinks
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sorting by date
    .slice(0, 5);

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      <FlatList
        data={latestDrinks} // Use the favorite drinks data here
        keyExtractor={item => item.idDrink} // Use the correct unique id for each drink
        showsVerticalScrollIndicator={false}
        className="px-7 pb-5"
        ListHeaderComponent={() => <ProfileHeader />}
        renderItem={({ item }) => <DrinkDisplay id={item.idDrink} mode='default'/>} // Pass the id of the favorite drink
      />
    </View>
  );
};

export default ProfileScreen;
