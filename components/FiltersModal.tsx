import { View, Text, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TabHeader } from './TabHeader';
import { icons, iconsDark } from '@/constants';
import { Subtitle } from './Subtitle';
import { CustomButton } from './CustomButton';
import {} from './CombinedIngredientsModal';
import { fetchAllCategories } from '@/api/cocktailApi';
import GlassModal from './GlassModal';
import { IngredientDisplay } from './IngredientDisplay';

// Define the Filters interface for the filtering options
export interface Filters {
    sorting: string;
    alcoholic: string[];
    category: string[];
    glass: string[];
    ingredients: string[];
}

// Define the props for the FiltersModal component
interface FiltersModalProps {
    visible: boolean;
    onClose: () => void;
    onApplyFilters: (filters: Filters) => void;
    isDark: boolean;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({ visible, onClose, onApplyFilters, isDark }) => {
    const [ingredientsModal, setIngredientsModal] = useState(false);
    const [glassModal, setGlassModal] = useState(false);
    const [allCategories, setAllCategories] = useState<{ strCategory: string }[]>([]);

    // State for filter selections
    const [sortMethod, setSortMethod] = useState('ascending');
    const [selectedAlcoholic, setSelectedAlcoholic] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [selectedGlassType, setSelectedGlassType] = useState<string[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

    const icon = isDark ? iconsDark : icons;

    // Fetch all categories on component mount
    useEffect(() => {
        const getAllCategories = async () => {
            const categories = await fetchAllCategories();
            setAllCategories(categories);
        };

        getAllCategories();
    }, []);

    // Handle applying the selected filters
    const handleApplyFilters = () => {
        const filters: Filters = {
            sorting: sortMethod,
            alcoholic: selectedAlcoholic,
            category: selectedCategory,
            glass: selectedGlassType,
            ingredients: selectedIngredients,
        };
        onApplyFilters(filters); // Pass the filters back to the parent component
        onClose(); // Close the modal
    };

    // Toggle between ascending and descending sort methods
    const toggleSortMethod = () => {
        setSortMethod(prevSortMethod =>
            prevSortMethod === 'ascending' ? 'descending' : 'ascending'
        );
    };

    // Toggle the selected alcoholic options
    const toggleAlcoholicOption = (option: string) => {
        setSelectedAlcoholic(prevSelected =>
            prevSelected.includes(option)
                ? prevSelected.filter(item => item !== option)
                : [...prevSelected, option]
        );
    };

    // Toggle the selected categories
    const toggleCategories = (option: string) => {
        setSelectedCategory(prevSelected =>
            prevSelected.includes(option)
                ? prevSelected.filter(item => item !== option)
                : [...prevSelected, option]
        );
    };

    // Set selected glass types
    const handleSelectGlass = (glassTypes: string[]) => {
        setSelectedGlassType(glassTypes);
    };

    // Set selected ingredients
    const handleSelectIngredient = (ingredients: string[]) => {
        setSelectedIngredients(ingredients);
    };

     // Function to delete an ingredient
    const handleDeleteIngredient = (ingredient: string) => {
        setSelectedIngredients((prev) => prev.filter((item) => item !== ingredient));
    };

    // Reset filters to default values
    const resetFilters = () => {
        setSortMethod('ascending');
        setSelectedAlcoholic([]);
        setSelectedCategory([]);
        setSelectedGlassType([]);
        setSelectedIngredients([]);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            transparent={true}
        >
            <IngredientsModal
                visible={ingredientsModal}
                isDark={isDark}
                onClose={() => setIngredientsModal(false)}
                onSelectIngredient={handleSelectIngredient}
                selectedIngredients={selectedIngredients}
            />
            <GlassModal
                visible={glassModal}
                onClose={() => setGlassModal(false)}
                onSelectGlass={handleSelectGlass}
                selectedGlasses={selectedGlassType}
            />

            <ScrollView className='bg-zinc-50 dark:bg-zinc-900 px-7 rounded-t-3xl rounded-tr-3xl h-full' stickyHeaderIndices={[0]}>
                <TabHeader
                    title='Filters'
                    isMain={false}
                    leftIcon={icon.back}
                    handleLeftPress={onClose}
                    rightIcon={icon.erase}
                    handleRightPress={resetFilters} // Reset filters when the erase icon is pressed
                    otherStyles='bg-zinc-50 dark:bg-zinc-900'
                />

                <View className='mt-12 gap-7'>
                    {/* Sort by section */}
                    <View className='flex flex-row justify-start items-center'>
                        <Subtitle title='Sort by' canExpand={false} />
                        <TouchableOpacity onPress={toggleSortMethod} activeOpacity={0.6}>
                            <Text className='text-3xl font-bold text-orange-600'> {sortMethod}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Alcoholic options section */}
                    <View className='flex gap-4'>
                        <Subtitle title='Alcoholic options' canExpand={false} />
                        <View className='flex gap-1'>
                            {['Alcoholic', 'Non alcoholic', 'Optional alcohol'].map(option => (
                                <TouchableOpacity
                                    key={option}
                                    className='flex flex-row justify-between items-center w-full py-1'
                                    onPress={() => toggleAlcoholicOption(option)}
                                    activeOpacity={1}
                                >
                                    <Text className='text-xl font-regular text-zinc-900 dark:text-zinc-50'>{option.replace('_', ' ')}</Text>
                                    <Image
                                        source={selectedAlcoholic.includes(option) ? icon.checkBoxFilled : icon.checkBox}
                                        className='w-8 h-8'
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Ingredients section */}
                    <View className='flex gap-4'>
                        <Subtitle title='Ingredients' canExpand={false} />
                        <CustomButton
                            title='Add more'
                            handlePress={() => setIngredientsModal(true)}
                            containerStyles='bg-transparent border-[1px] border-zinc-400'
                            textStyles='text-zinc-400 dark:text-zinc-500'
                        />
                        {selectedIngredients.map((ingredient, index) => (
                            <IngredientDisplay 
                                key={index} 
                                strIngredient={ingredient} 
                                canBeChosen={false} 
                                isSelected={true}
                                onDelete={() => handleDeleteIngredient(ingredient)}
                                isDark={isDark}
                            />
                        ))}
                    </View>

                    {/* Category section */}
                    <View className='flex gap-4'>
                        <Subtitle title='Category' canExpand={false} />
                        <View className='flex flex-row flex-wrap gap-2'>
                            {allCategories.map(category => (
                                <TouchableOpacity
                                    key={category.strCategory}
                                    className={`rounded-full border-[1px] border-zinc-900 dark:border-zinc-200 py-2 px-4 ${selectedCategory.includes(category.strCategory) ? 'bg-zinc-900 dark:bg-zinc-200' : ''}`}
                                    onPress={() => toggleCategories(category.strCategory)}
                                    activeOpacity={1}
                                >
                                    <Text className={`text-lg text-center font-regular ${selectedCategory.includes(category.strCategory) ? 'text-zinc-50 dark:text-zinc-900' : 'text-zinc-900 dark:text-zinc-200'}`}>
                                        {category.strCategory}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Glass type section */}
                    <View className='flex gap-4'>
                        <Subtitle title='Glass type' canExpand={false} />
                        <CustomButton
                            title='Change glass types'
                            handlePress={() => setGlassModal(true)}
                            containerStyles='bg-transparent py-1 border-[1px] border-zinc-400'
                            textStyles='text-zinc-400'
                        />
                        <View className='flex flex-row flex-wrap gap-2'>
                            {selectedGlassType.map((glass, index) => (
                                <View
                                    key={index}
                                    className='rounded-full border-[1px] border-zinc-900 dark:border-zinc-200 py-2 px-4 bg-zinc-900 dark:bg-zinc-200'
                                >
                                    <Text className='text-lg text-center font-regular text-zinc-50 dark:text-zinc-900'>
                                        {glass}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View className='flex flex-row justify-between px-7 bg-zinc-50 dark:bg-zinc-900 py-4'>
                <CustomButton
                    title='Apply'
                    handlePress={handleApplyFilters}
                    containerStyles='bg-orange-600 px-4 py-2 rounded-full'
                />
            </View>
        </Modal>
    );
};