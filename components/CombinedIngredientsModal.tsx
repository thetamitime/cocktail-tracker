import { fetchAllIngredients } from '@/api/cocktailApi';
import { addIngredientsToBar } from '@/api/firebaseFunctions';
import { icons, iconsDark } from '@/constants';
import { useGlobal } from '@/context/GlobalProvider';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, Image, FlatList, ActivityIndicator, Text } from 'react-native';
import { CustomButton, IngredientDisplay, SearchField } from '.';

interface CombinedIngredientsModalProps {
    visible: boolean;
    isDark: boolean;
    onClose: () => void;
    onSelectIngredient: (selectedIngredients: string[]) => void | null;
    selectedIngredients: string[];
    isBarModal?: boolean; // Flag to differentiate between BarIngredientsModal and IngredientsModal
}

export const CombinedIngredientsModal: React.FC<CombinedIngredientsModalProps> = ({
    visible,
    isDark,
    onClose,
    onSelectIngredient,
    selectedIngredients,
    isBarModal = false // Default to false
}) => {
    const { user } = useGlobal();
    const [query, setQuery] = useState('');
    const [allIngredients, setAllIngredients] = useState<{ strIngredient1: string }[]>([]);
    const [filteredIngredients, setFilteredIngredients] = useState<{ strIngredient1: string }[]>([]);
    const [currentSelectedIngredients, setCurrentSelectedIngredients] = useState<string[]>(selectedIngredients);
    const [loading, setLoading] = useState(true);

    const icon = !isDark ? iconsDark : icons;

    useEffect(() => {
        setCurrentSelectedIngredients(selectedIngredients);
    }, [selectedIngredients]);

    useEffect(() => {
        const getAllIngredients = async () => {
            setLoading(true);
            const ingredients = await fetchAllIngredients();
            setAllIngredients(ingredients);

            const randomIngredients = ingredients.sort(() => 0.5 - Math.random()).slice(0, 10);
            setFilteredIngredients(randomIngredients);
            setLoading(false);
        };
        getAllIngredients();
    }, []);

    const debouncedSearchIngredients = useCallback(
        debounce((searchQuery: string) => {
            if (searchQuery.trim() === '') {
                const randomIngredients = allIngredients.sort(() => 0.5 - Math.random()).slice(0, 10);
                setFilteredIngredients(randomIngredients);
                return;
            }

            const filtered = allIngredients.filter(ingredient =>
                ingredient.strIngredient1.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredIngredients(filtered);
        }, 500),
        [allIngredients]
    );

    useEffect(() => {
        debouncedSearchIngredients(query);
        return () => {
            debouncedSearchIngredients.cancel();
        };
    }, [query, debouncedSearchIngredients]);

    const toggleIngredientsSelection = (ingredient: string) => {
        setCurrentSelectedIngredients((prevSelected) =>
            prevSelected.includes(ingredient)
                ? prevSelected.filter((item) => item !== ingredient)
                : [...prevSelected, ingredient]
        );
    };

    const handleDone = async () => {
        if (isBarModal && user?.uid) {
            try {
                await addIngredientsToBar(user.uid, currentSelectedIngredients); // Add ingredients to Firebase
                console.log('Ingredients added to Firebase');
            } catch (error) {
                console.error('Error adding ingredients to Firebase:', error);
            }
        }
        if (!isBarModal) onSelectIngredient(currentSelectedIngredients);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className='bg-zinc-100 dark:bg-zinc-900 h-full pt-16 rounded-t-3xl rounded-tr-3xl px-7 pb-5'>
                <FlatList
                    data={filteredIngredients}
                    keyExtractor={(item) => item.strIngredient1}
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={
                        <View className='bg-zinc-100 dark:bg-zinc-900 pb-6 flex flex-row gap-2'>
                            <SearchField
                                placeholder='Search for ingredient'
                                isDark={isDark}
                                value={query}
                                handleChangeText={setQuery}
                                otherStyles='flex-1'
                            />
                            <TouchableOpacity className='pl-4 mt-10' onPress={onClose}>
                                <Image source={icon.close} className='w-6 h-6' />
                            </TouchableOpacity>
                        </View>
                    }
                    ListEmptyComponent={() =>
                        loading ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : (
                            <Text className="text-center text-zinc-400 dark:text-zinc-500 mt-4">Nothing found</Text>
                        )
                    }
                    renderItem={({ item }) =>
                        <IngredientDisplay
                            isDark={isDark}
                            canBeChosen={true}
                            strIngredient={item.strIngredient1}
                            isSelected={currentSelectedIngredients.includes(item.strIngredient1)}
                            onSelect={() => toggleIngredientsSelection(item.strIngredient1)}
                        />
                    }
                />

                <CustomButton
                    title='Done'
                    handlePress={handleDone}
                    containerStyles='mt-6'
                />
            </View>
        </Modal>
    );
};
