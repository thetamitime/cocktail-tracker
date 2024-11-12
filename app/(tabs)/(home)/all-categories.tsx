import { fetchAllCategories } from '@/api/cocktailApi';
import { getTheme } from '@/api/firebaseFunctions';
import { TabHeader } from '@/components';
import { icons, iconsDark } from '@/constants';
import { useGlobal } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'

const allCategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const loadCategories = async () => {
          try {
              const fetchedCategories = await fetchAllCategories();
              setCategories(fetchedCategories);
          } catch (error) {
              setError('Failed to load categories.');
          } finally {
              setLoading(false);
          }
      };

      loadCategories();
  }, []);

  if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
      return (
          <View>
              <Text style={{ color: 'red' }}>{error}</Text>
          </View>
      );
  }
    
  console.log(categories);
  return (
    <View className='flex-1 bg-zinc-100 dark:bg-zinc-900 px-7'>
      <FlatList
        data={categories}
        keyExtractor={item => item.strCategory}
        className='pb-4'
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className='bg-zinc-100 dark:bg-zinc-900 mb-8'>
            <TabHeader title='All categories' isMain={true} leftIcon={ icon.back }/>
          </View> 
        }
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
        renderItem={({item}) => 
          <CategoryDisplay category={item.strCategory}/>
        }
      />
    </View>
  )
}

const CategoryDisplay: React.FC<{category: string}> = ({ category }) => {
  const icon = category.split(' ')[0].toLowerCase();
  return (
    <TouchableOpacity 
      className='flex gap-2 bg-zinc-50 dark:bg-zinc-800 justify-center items-center w-[48%] p-5 border-[1px] rounded-xl border-zinc-200 dark:border-zinc-700'
      onPress={() => router.push(`/category/${category.split(' / ')[0]}`)}
    >
      <Image source={ icons[icon] } className='w-16 h-16'/>
      <Text className='text-zinc-900 dark:text-zinc-50'>{category}</Text>
    </TouchableOpacity>
  )
}

export default allCategoriesScreen