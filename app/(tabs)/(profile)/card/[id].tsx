import { View, Image, ScrollView, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TabHeader, CustomButton } from '@/components';
import { icons, iconsDark } from '@/constants';
import { useLocalSearchParams } from 'expo-router';
import { fetchCocktailById } from '@/api/cocktailApi';
import { useGlobal } from '@/context/GlobalProvider';
import { 
  addDrinkToFavorites, 
  addNoteToFirebase, 
  deleteNoteFromFirebase, 
  getUserFavorites, 
  getUserIngredients, 
  getNotesForDrink, 
  removeDrinkFromFavorites, 
  getUnits,
  getTheme
} from '@/api/firebaseFunctions';

const CocktailCard = () => {
  const { user } = useGlobal();
  const [liked, setLiked] = useState(false);
  const [cocktail, setCocktail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<boolean>();

  const params = useLocalSearchParams<{ id: string }>();
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
    const getAllDetails = async () => {
      try {
        const fetchedCocktail = await fetchCocktailById(params.id);
        setCocktail(fetchedCocktail);

        const unsubscribeFavorites = getUserFavorites(user.uid, (favorites) => {
          setLiked(favorites.some(favorite => favorite.idDrink === params.id));
        });

        const unsubscribeUnits = getUnits(user.uid, (units) => {
          setUnits(units);
        })

        return () => {
          unsubscribeFavorites();
          unsubscribeUnits();
        };
      } catch (err) {
        setError('Failed to load cocktail details.');
      } finally {
        setLoading(false);
      }
    };

    getAllDetails();
  }, [params.id, user.uid]);

  if (loading) return <LoadingPlaceholder />;
  if (error) return <Text>{error}</Text>;

  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient: string = cocktail[`strIngredient${i}`];
    const measure: string = cocktail[`strMeasure${i}`];
    if (ingredient) ingredients.push({ measure: measure || '', ingredient });
  }

  const handleLikePress = async () => {
    if (liked) {
      await removeDrinkFromFavorites(user.uid, params.id);
      setLiked(false);
    } else {
      await addDrinkToFavorites(user.uid, params.id);
      setLiked(true);
    }
  };

  return (
    <View className='flex-1 bg-zinc-100 px-7 justify-center items-center dark:bg-zinc-900'>
      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets={true}>
        <TabHeader
          title={cocktail.strDrink}
          isMain={false}
          leftIcon={icon.back}
          rightIcon={liked ? icon.liked : icon.like}
          handleRightPress={handleLikePress}
          otherStyles='mb-4 pt-24'
        />
        <View className='flex justify-center items-center gap-5 mt-8 mb-10'>
          <Image source={{ uri: cocktail.strDrinkThumb }} className='w-72 h-72 rounded-3xl' />
          <View className='flex gap-2 items-center justify-center'>
            <Text className='font-bbold text-2xl text-zinc-900 dark:text-zinc-50'>{cocktail.strDrink}</Text>
            <Text className='font-bmedium text-xl text-zinc-400 dark:text-zinc-500'>{cocktail.strCategory} in
              <Text className='text-orange-600 dark:text-orange-500'> {cocktail.strGlass}</Text>
            </Text>
          </View>
        </View>

        <View className='flex gap-8'>
          <IngredientsSection key="ingredients" icon={icon} data={ingredients} userId={user.uid} userUnits={units}/>
          <InstructionsSection key="instructions" icon={icon} data={cocktail.strInstructions} />
          <NotesSection key="notes" icon={icon} userId={user.uid} idDrink={cocktail.idDrink} isDark={!colorScheme}/>
        </View>
      </ScrollView>
    </View>
  );
};

const IngredientsSection: React.FC<{ 
  data: { measure: string; ingredient: string; }[], 
  userId: string, 
  userUnits: string,
  icon: any
}> = ({ data, userId, userUnits, icon }) => {
  const [counter, setCounter] = useState(1);
  const [isAddPressed, setAddPressed] = useState(false);
  const [isMinusPressed, setMinusPressed] = useState(false);
  const [barIngredients, setBarIngredients] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = getUserIngredients(userId, (ingredients) => {
      setBarIngredients(ingredients);
    });
    return unsubscribe;
  }, [userId]);

  const scaleMeasure = (measure: string, units: string) => {
    const numericPart = measure.match(/[\d\/\-.]+/g); // Matches numbers, fractions, and ranges
    const textPart = measure.replace(/[\d\/\-.]+/g, '').trim(); // Removes numbers and retains text
    
     // Determine if we need to convert based on textPart and units
    const isConversionNeeded = 
      (textPart.toLowerCase().includes('oz') && units === 'ml') ||
      (textPart.toLowerCase().includes('ml') && units === 'oz');

    // Set the appropriate conversion factor if conversion is needed
    const conversionFactor = isConversionNeeded ? (units === 'ml' ? 30 : Number((1 / 30).toFixed(2))) : 1;

    if (numericPart) {
      const scaledNumeric = numericPart.map(part => {
        if (part.includes('/')) {
          const [num, denom] = part.split('/').map(Number);
          return ((num / denom) * counter * conversionFactor);
        } else if (part.includes('-')) {
          const [min, max] = part.split('-').map(Number);
          return `${(min * counter * conversionFactor)}-${(max * counter * conversionFactor)}`;
        } else {
          return (Number(part) * counter * conversionFactor);
        }
      }).join('-');
      
      const updatedTextPart = isConversionNeeded
        ? textPart.replace(/oz|ml/i, units) // Replaces only 'oz' or 'ml', case-insensitively
        : textPart;

      return `${scaledNumeric} ${updatedTextPart}`;
    }


    return measure;
  };

  return (
    <View className='flex gap-5'>
      <View className='flex flex-row justify-between items-center'>
        <Text className='font-bmedium text-zinc-900 text-2xl dark:text-zinc-50'>Ingredients</Text>
        <View className='flex flex-row items-center gap-2'>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => setMinusPressed(true)}
            onPressOut={() => setMinusPressed(false)}
            onPress={() => setCounter(Math.max(1, counter - 1))}
          >
            <Image source={isMinusPressed ? icon.minusFilled : icon.minus} className='w-6 h-6' />
          </TouchableOpacity>
          <Text className='font-bregular text-xl text-zinc-400 dark:text-zinc-500'>{counter}</Text>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => setAddPressed(true)}
            onPressOut={() => setAddPressed(false)}
            onPress={() => setCounter(counter + 1)}
          >
            <Image source={isAddPressed ? icon.addFilled : icon.add} className='w-6 h-6' />
          </TouchableOpacity>
        </View>
      </View>
      <View className='flex gap-3'>
        {data.map((item, index) => {
          const hasIngredient = barIngredients.includes(item.ingredient);
          return (
            <View key={index} className={`
              py-4 px-6 w-full rounded-full 
              flex flex-row justify-between items-center 
              ${hasIngredient ? 'bg-green-600' : 'bg-zinc-50 dark:bg-zinc-800'}`}>
              <Text className={`font-bregular text-lg text-center ${hasIngredient ? 'text-zinc-50' : 'text-zinc-400 dark:text-zinc-500'}`}>
                {item.ingredient}
              </Text>
              <Text className={`
                font-bregular text-lg text-center 
                ${hasIngredient ? 'text-zinc-50' : 'text-zinc-400 dark:text-zinc-500'}`
              }>
                {scaleMeasure(item.measure, userUnits)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const InstructionsSection: React.FC<{ data: string, icon: any }> = ({ data, icon }) => {
  const steps = data.split('. ').filter(item => item.trim() !== '');

  return (
    <View className='flex gap-5'>
      <Text className='font-bmedium text-zinc-900 text-2xl dark:text-zinc-50'>Instructions</Text>
      <View className='flex gap-3'>
        {steps.length === 0 ? (
          <Text className='font-bregular text-lg text-center text-zinc-400 dark:text-zinc-500'>No additional steps needed.</Text>
        ) : (
          steps.map((item, index) => (
            <View key={index} className='p-5 w-full bg-zinc-50 rounded-xl flex justify-center items-start gap-3 dark:bg-zinc-800'>
              <Text className='font-bmedium text-base text-center text-zinc-400 dark:text-zinc-500'>{`Step ${index + 1}/${steps.length}`}</Text>
              <Text className='font-bregular text-lg text-left text-zinc-900 dark:text-zinc-200'>
                {index !== steps.length - 1 ? `${item}.` : item}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const NotesSection: React.FC<{ userId: string; idDrink: string, isDark: boolean }> = ({ userId, idDrink, isDark }) => {
  const [allNotes, setAllNotes] = useState<{ id: string; note: string; visible: boolean }[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const unsubscribe = getNotesForDrink(userId, idDrink, (notes) => {
      // Ensure each note from Firebase has the visible property and sort them by ID (Date)
      const updatedNotes = notes
        .map((note) => ({ ...note, visible: false }))
        .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()); // Sort by Date object

      setAllNotes(updatedNotes);
    });

    return () => unsubscribe();
  }, [userId, idDrink]);

  // Function to handle adding a new note
  const addNote = async () => {
    if (!newNote.trim()) return; // Prevent adding empty notes

    try {
      await addNoteToFirebase(userId, idDrink, newNote.trim());
      setNewNote(''); // Clear the input field
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  // Function to toggle the visibility of the delete button for a note
  const toggleVisibility = (noteId: string) => {
    setAllNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, visible: !note.visible } : note
      )
    );
  };

  const handleDeleteNote = async (noteId: string, noteText: string) => {
    try {
      await deleteNoteFromFirebase(userId, idDrink, noteId, noteText);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <View className='flex gap-5'>
      <Text className='font-bmedium text-zinc-900 text-2xl dark:text-zinc-50'>Notes</Text>
      <View className='flex gap-3 mb-3'>
        <TextInput
          value={newNote}
          placeholder='Create a new note'
          placeholderTextColor={`${!isDark ? '#D3D3D7' : '#E3E3E6'}`}
          multiline={true}
          className='p-5 bg-zinc-50 rounded-xl border-[1px] border-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50'
          onChangeText={setNewNote}
        />
        <CustomButton title='Add note' handlePress={addNote} />
        {allNotes.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleVisibility(item.id)}
            className='p-5 mb-4 w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl border-[1px] border-zinc-200 dark:border-zinc-700 flex justify-center items-start gap-3'
          >
            <Text className='font-bregular text-lg text-zinc-900 dark:text-zinc-50'>{item.note}</Text>
            {item.visible && (
              <TouchableOpacity className='bg-red-400 dark:bg-red-500 py-2 px-4 rounded-lg self-end' onPress={() => handleDeleteNote(item.id, item.note)}>
                <Text className='text-base text-zinc-50 font-bmedium'>Delete</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const LoadingPlaceholder = () => {
  return (
    <View className='flex-1 bg-zinc-100 dark:bg-zinc-900 px-7 justify-center items-center'>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className={`pt-28 w-11/12 flex flex-row items-center justify-between`}>
          <View className='bg-zinc-300 dark:bg-zinc-800 w-8 h-8 rounded-full animate-pulse' />
          <View className='bg-zinc-300 dark:bg-zinc-800 w-8 h-8 rounded-full animate-pulse' />
        </View>

        <View className='flex justify-center items-center gap-5 mt-8 mb-10'>
          <View className='w-72 h-72 bg-zinc-300 dark:bg-zinc-800 rounded-3xl animate-pulse' />
          <View className='flex gap-2 items-center justify-center'>
            <View className='bg-zinc-300 dark:bg-zinc-800 w-48 h-6 animate-pulse' />
            <View className='bg-zinc-300 dark:bg-zinc-800 w-32 h-6 animate-pulse' />
          </View>
        </View>

        <View className='flex gap-8'>
          <View className='flex gap-5'>
            <View className='bg-zinc-300 dark:bg-zinc-800 w-32 h-6 animate-pulse' />
            <View className='flex gap-3'>
              <View className='py-4 px-6 w-full rounded-full flex flex-row justify-between items-center bg-zinc-200 dark:bg-zinc-700 animate-pulse'>
                <View className='bg-zinc-300 dark:bg-zinc-800 w-20 h-6 animate-pulse' />
                <View className='bg-zinc-300 dark:bg-zinc-800 w-16 h-6 animate-pulse' />
              </View>
            </View>
          </View>

          <View className='flex gap-5'>
            <View className='bg-zinc-300 dark:bg-zinc-800 w-32 h-6 animate-pulse' />
            <View className='flex gap-3'>
              <View className='p-5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-xl flex justify-center items-start gap-3 animate-pulse'>
                <View className='bg-zinc-300 dark:bg-zinc-800 w-24 h-4 animate-pulse' />
                <View className='bg-zinc-300 dark:bg-zinc-800 w-full h-4 animate-pulse' />
              </View>
            </View>
          </View>

          <View className='flex gap-5'>
            <View className='bg-zinc-300 dark:bg-zinc-800 w-32 h-6 animate-pulse' />
            <View className='flex gap-3'>
              <View className='p-5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-xl border-[1px] border-zinc-300 dark:border-zinc-600 animate-pulse'>
                <View className= 'bg-zinc-300 dark:bg-zinc-800 w-full h-4 animate-pulse' />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CocktailCard;
