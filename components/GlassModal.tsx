import { View, Modal, TouchableOpacity, FlatList, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CustomButton } from './CustomButton';
import { Subtitle } from './Subtitle';
import { fetchAllGlasses } from '@/api/cocktailApi';

interface GlassModalProps {
    visible: boolean,
    onClose: () => void,
    onSelectGlass: (glassTypes: (string)[]) => void,
    selectedGlasses: (string)[],
}

export const GlassModal: React.FC<GlassModalProps> = ({ visible, onClose, onSelectGlass, selectedGlasses }) => {
    const [allGlasses, setAllGlasses] = useState<{strGlass: string}[]>([]);
    const [currentSelectedGlasses, setCurrentSelectedGlasses] = useState<(string)[]>(selectedGlasses);

    useEffect(() => {
        const getAllGlasses = async () => {
            const glasses = await fetchAllGlasses();
            setAllGlasses(glasses);
        }
        
        getAllGlasses();
    }, []);

    const toggleGlassSelection = (glassType: string) => {
        setCurrentSelectedGlasses((prevSelected) =>
            prevSelected.includes(glassType)
                ? prevSelected.filter((item) => item !== glassType)
                : [...prevSelected, glassType]
        );
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
                    data={allGlasses} // Use all glasses data
                    keyExtractor={(item) => item.strGlass}
                    contentContainerClassName='pt-8 flex h-full justify-between'
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Subtitle title='Choose your serve' canExpand={false} otherStyles='mb-4' />
                    }
                    numColumns={2}
                    columnWrapperClassName='py-1 gap-2'
                    renderItem={({ item }) =>
                        <TouchableOpacity
                            key={item.strGlass}
                            className={`w-fit rounded-full border-[1px] border-zinc-900 dark:border-zinc-200 py-1 px-4 
                            ${currentSelectedGlasses.includes(item.strGlass) ? 'bg-zinc-900 dark:bg-zinc-200' : ''}`}
                            onPress={() => toggleGlassSelection(item.strGlass)}
                            activeOpacity={1}
                        >
                            <Text className={`text-base text-center font-bregular 
                            ${currentSelectedGlasses.includes(item.strGlass) ? 'text-zinc-50 dark:text-zinc-900' : 'text-zinc-900 dark:text-zinc-200'}`}
                            >
                                {item.strGlass}
                            </Text>
                        </TouchableOpacity>
                    }
                    ListFooterComponent={
                        <CustomButton
                            title='Done'
                            handlePress={() => {
                                onSelectGlass(currentSelectedGlasses);
                                onClose();
                            }}
                            containerStyles='mt-6'
                        />
                    }
                />
            </View>
        </Modal>
    );
};