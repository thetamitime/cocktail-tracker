import { getTheme, getUserIngredients, getAvailableCocktails } from "@/api/firebaseFunctions";
import { TabHeader } from "@/components";
import { useGlobal } from "@/context/GlobalProvider";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useState, useEffect } from "react";
import { Text, View } from "react-native";
import CocktailsScreen from "./cocktails";
import IngredientsScreen from "./ingredients";

const Tab = createMaterialTopTabNavigator();

const CustomLabel: React.FC<{ label: string, focused: boolean, count?: number }> = ({ label, focused, count = 0 }) => {
  return (
    <View className="flex flex-row justify-center items-center gap-1"> 
      <Text className={`font-bmedium text-lg ${focused ? 'text-orange-600' : 'text-zinc-900 dark:text-zinc-50'}`}>{label}</Text>
      <View className={`w-8 rounded-full justify-center items-center ${focused ? 'bg-orange-600' : 'bg-zinc-200 dark:bg-zinc-600'}`}>
        <Text className={`font-bregular text-base ${focused ? 'text-zinc-50' : 'text-zinc-400'}`}>{count}</Text>
      </View>
    </View>
  );
};

export default function TabLayout() { 
  const { user } = useGlobal();   
  const [ingredientCount, setIngredientCount] = useState<number>(0);
  const [availableCocktailsCount, setAvailableCocktailsCount] = useState<number>(0);
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

  useEffect(() => {
    if (!user) return; // Ensure user is available

    // Listener for user ingredients
    const unsubscribeIngredients = getUserIngredients(user.uid, (_, count) => {
      setIngredientCount(count);
    });

    // Listener for available cocktails
    const unsubscribeCocktails = getAvailableCocktails(user.uid, (count) => {
      setAvailableCocktailsCount(count);
    });

    // Cleanup the listeners on unmount
    return () => {
      unsubscribeIngredients();
      unsubscribeCocktails();
    };
  }, [user]);

  return (
    <View className='flex-1 bg-zinc-100 dark:bg-zinc-900 flex gap-5'>
      <TabHeader title='Your bar' isMain={true} otherStyles='px-7' />

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: `${!colorScheme ? "#F3F3F4" : '#18181B'}`,
            shadowOffset: {
              width: 0,
              height: 0, // for iOS
            },
            elevation: 0,
            zIndex: 0,
            height: 45,
          },
          tabBarContentContainerStyle: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
          },
          tabBarIndicatorContainerStyle: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#E9580C',
            borderRadius: 6,
            width: 60,
            height: 2,
            left: '17%'
          },
          tabBarLabelStyle: {
            textTransform: 'none'
          },
        }}
      >
        <Tab.Screen 
          name="ingredients" 
          component={IngredientsScreen} 
          options={{ 
            tabBarLabel: ({ focused }) => (
              <CustomLabel label="Ingredients" count={ingredientCount} focused={focused} />
            ) 
          }} 
        />
        <Tab.Screen 
          name="cocktails" 
          component={CocktailsScreen} 
          options={{ 
            tabBarLabel: ({ focused }) => (
              <CustomLabel label="Cocktails" count={availableCocktailsCount} focused={focused} />
            ) 
          }} 
        />
      </Tab.Navigator>
    </View>
  );
}
