import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { icons, iconsDark } from '@/constants';
import { fetchIngredientByName } from '@/api/cocktailApi';

interface IngredientDisplayProps {
  strIngredient: string;
  isDark: boolean;
  canBeChosen?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export const IngredientDisplay: React.FC<IngredientDisplayProps> = ({
  strIngredient,
  isSelected,
  onSelect,
  onDelete,
  isDark,
  ...props
}) => {
  const [ingredient, setIngredient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const icon = isDark ? iconsDark : icons;

  useEffect(() => {
    const getCocktailDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedIngredient = await fetchIngredientByName(strIngredient);
        if (fetchedIngredient) {
          setIngredient(fetchedIngredient);
        } else {
          throw new Error("No ingredient data found");
        }
      } catch (err) {
        setError('Failed to load ingredient details.');
        console.error('Error fetching ingredient by name:', err);
      } finally {
        setLoading(false);
      }
    };

    getCocktailDetails();
  }, [strIngredient]);

  if (loading) {
    return (
      <View className='flex flex-row justify-between items-center my-3'>
        <View className='flex flex-row gap-4 justify-center items-center'>
          <View className='w-20 h-20 bg-gray-300 dark:bg-zinc-800 rounded-2xl' /> 
          <View className='w-32 h-6 bg-gray-300 dark:bg-zinc-800 rounded-md' /> 
        </View>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex flex-row justify-between items-center my-3'>
        <Text className='text-gray-500'>{error}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      className='flex flex-row justify-between items-center my-3'
      activeOpacity={1}
      onPress={onSelect}
    >
      <View className='flex flex-row gap-4 justify-center items-center'>
        <Image
          source={{ uri: `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(strIngredient)}.png` }}
          className='w-20 h-20 rounded-2xl'
          resizeMode='cover'
        />
        <Text className='font-bmedium text-lg text-zinc-900 dark:text-zinc-50 leading-5'>{ingredient?.strIngredient}</Text>
      </View>
      {isSelected && !onDelete && (
        <Image
          source={icon.checkBoxFilled}
          className='w-7 h-7'
        />
      )}
      {isSelected && onDelete && (
        <TouchableOpacity onPress={onDelete}>
          <Image
            source={icon.trash}
            className='w-7 h-7'
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
