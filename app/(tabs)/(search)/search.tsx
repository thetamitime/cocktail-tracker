import { fetchRandomCocktails, fetchCocktailByName } from '@/api/cocktailApi';
import { getTheme } from '@/api/firebaseFunctions';
import { DrinkDisplay, TabHeader, SearchField, CustomButton, FiltersModal } from '@/components';
import { Filters } from '@/components/FiltersModal';
import { icons, iconsDark } from '@/constants';
import { useGlobal } from '@/context/GlobalProvider';
import debounce from 'lodash.debounce';
import { useState, useEffect, useCallback } from 'react';
import { View, Image, TouchableOpacity, FlatList, Text, ActivityIndicator } from 'react-native';


export interface Drink {
  idDrink: string;
  strDrink: string;
  strCategory: string;
  strDrinkThumb: string;
  strAlcoholic: string;
  strGlass: string;
  ingredients: string[];
  [key: string]: any;
}

const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [defaultDrinks, setDefaultDrinks] = useState<Drink[]>([]);
  const [fetchedDrinks, setFetchedDrinks] = useState<Drink[]>([]);
  const [filteredDrinks, setFilteredDrinks] = useState<Drink[]>([]);
  const [filters, setFilters] = useState<Filters>({
    ingredients: [],
    alcoholic: [],
    category: [],
    glass: [],
    sorting: 'ascending',
  });
  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [colorScheme, setColorScheme] = useState<boolean | null>(null); // Ensure it can be null initially
  const { user } = useGlobal();

  // Load default drinks on component mount
  useEffect(() => {
    const loadDefaultDrinks = async () => {
      const randomDrinks = await fetchRandomCocktails();
      setDefaultDrinks(randomDrinks);
      setFetchedDrinks(randomDrinks);
      setFilteredDrinks(randomDrinks);
      setLoading(false);
      setHasMounted(true);
    };

    loadDefaultDrinks();
  }, []);

  // Debounced function to fetch drinks based on search query
  const debouncedFetchDrinks = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim() === '') {
        setFetchedDrinks(defaultDrinks);
        return;
      }
      const drinksFromApi = await fetchCocktailByName(searchQuery);
      if (drinksFromApi.drinks === "None Found") {
        setFetchedDrinks([]);
      } else {
        setFetchedDrinks(drinksFromApi || []);
      }
    }, 500),
    [defaultDrinks]
  );

  // Fetch drinks based on the search query
  useEffect(() => {
    debouncedFetchDrinks(query);
    return () => {
      debouncedFetchDrinks.cancel();
    };
  }, [query, debouncedFetchDrinks]);

  // Handle filtering of drinks based on selected filters
  useEffect(() => {
    if (hasMounted && query === '' && filters?.ingredients?.length > 0) {
      const ingredientsString = filters.ingredients.join(',');
      const fetchFilteredCocktails = async () => {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v2/1/filter.php?i=${ingredientsString}`);
        const data = await response.json();
        if (data.drinks === "None Found") {
          setFilteredDrinks([]);
        } else {
          setFilteredDrinks(data.drinks || []);
        }
      };
      fetchFilteredCocktails();
    } else {
      filterDrinks(filters);
    }
  }, [query, filters, hasMounted]);

  // Filter drinks based on fetched drinks and selected filters
  useEffect(() => {
    filterDrinks(filters);
  }, [fetchedDrinks, filters]);

  const handleChangeText = (text: string) => {
    setQuery(text);
  };

  const filterDrinks = (selectedFilters?: Filters) => {
    let newFilteredDrinks = [...fetchedDrinks];

    if (selectedFilters?.alcoholic?.length) {
      newFilteredDrinks = newFilteredDrinks.filter(drink =>
        selectedFilters.alcoholic.includes(drink.strAlcoholic)
      );
    }

    if (selectedFilters?.category?.length) {
      newFilteredDrinks = newFilteredDrinks.filter(drink =>
        selectedFilters.category.includes(drink.strCategory)
      );
    }

    if (selectedFilters?.glass?.length) {
      newFilteredDrinks = newFilteredDrinks.filter(drink =>
        selectedFilters.glass.some(glass =>
          glass.toLowerCase() === drink.strGlass.toLowerCase()
        )
      );
    }

    if (selectedFilters?.ingredients?.length) {
      newFilteredDrinks = newFilteredDrinks.filter(drink =>
        selectedFilters.ingredients.some(ingredient =>
          Object.keys(drink)
            .filter(key => key.startsWith('strIngredient') && drink[key])
            .map(key => drink[key].toLowerCase())
            .includes(ingredient.toLowerCase())
        )
      );
    }

    const isAscending = selectedFilters?.sorting === 'ascending' || !selectedFilters?.sorting;
    newFilteredDrinks.sort((a, b) => 
      isAscending ? a.strDrink.localeCompare(b.strDrink) : b.strDrink.localeCompare(a.strDrink)
    );

    setFilteredDrinks(newFilteredDrinks);
  };

  const applyFilters = (selectedFilters: Filters) => {
    setFilters(selectedFilters);
    filterDrinks(selectedFilters);
  };

  const regenerateDrinks = async () => {
    const randomDrinks = await fetchRandomCocktails();
    setDefaultDrinks(randomDrinks);
    setFetchedDrinks(randomDrinks);
    filterDrinks(filters);
  };

  const renderDrinkItem = ({ item }: { item: Drink }) => {
    return <DrinkDisplay id={item.idDrink} mode={'default'} />;
  };

  const icon = colorScheme ? icons : iconsDark;

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

  return (
    <View className={`flex-1 ${colorScheme ? 'bg-zinc-900' : 'bg-zinc-100'} px-7`}>
      <FlatList
        data={filteredDrinks}
        keyExtractor={(item) => item.idDrink}
        showsVerticalScrollIndicator={false}
        extraData={{ query, filteredDrinks }}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className={`pb-4 ${colorScheme ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
            <TabHeader title="Search" isMain={true} />
            <View className="flex flex-row gap-2">
              <SearchField
                placeholder="Search for drink"
                value={query}
                handleChangeText={handleChangeText}
                otherStyles="flex-1"
                isDark={!!colorScheme}
              />
              <TouchableOpacity
                className="rounded-full bg-zinc-50 dark:bg-zinc-800 p-4 mt-6"
                onPress={() => setModalVisible(true)}
              >
                <Image source={icon.filter} className="w-6 h-6" />
              </TouchableOpacity>
            </View>
            <CustomButton title='Regenerate' handlePress={regenerateDrinks} containerStyles='mt-4' />
          </View>
        }
        renderItem={renderDrinkItem}
      />
      {loading ? (
        <View className="h-[65%] justify-center items-center">
          <ActivityIndicator size="large" color="#a0aec0" />
        </View>
      ) : filteredDrinks.length === 0 ? (
        <View className="h-[65%] justify-center items-center">
          <Text className="text-lg text-zinc-400 dark:text-zinc-500">Nothing found. Check your filters.</Text>
        </View>
      ) : null}

      <FiltersModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApplyFilters={applyFilters}
        isDark={!!colorScheme}
      />
    </View>
  );
};

export default SearchScreen;
