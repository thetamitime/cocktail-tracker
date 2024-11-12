import { View, TextInput, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { icons, iconsDark } from '@/constants';
import { useGlobal } from '@/context/GlobalProvider';
import { getTheme } from '@/api/firebaseFunctions';

interface SearchFieldProps {
    value: string;
    placeholder: string;
    isDark: boolean;
    handleChangeText: (e: string) => void;
    handleSubmit?: () => void;
    otherStyles?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
    value,
    placeholder,
    isDark,
    handleChangeText,
    handleSubmit,
    otherStyles,
}) => {
    const icon = isDark ? iconsDark : icons;  // Directly use the prop

    return (
        <View className={`${otherStyles} p-4 mt-6 rounded-full bg-zinc-50 dark:bg-zinc-800 flex flex-row gap-5 items-center`}>
            <TouchableOpacity onPress={handleSubmit}>
                <Image
                    source={icon.search}
                    className="w-6 h-6"
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <TextInput 
                className="flex-1 text-zinc-900 dark:text-zinc-50 font-bregular text-lg leading-6 drop-shadow-lg"
                value={value}
                placeholder={placeholder}
                placeholderTextColor={`${!isDark ? '#A0A0A9' : '#71717A'}`}  // Use isDark directly
                onChangeText={(text) => {
                    handleChangeText(text);
                }}
                onSubmitEditing={handleSubmit}
            />
        </View>
    );
};
