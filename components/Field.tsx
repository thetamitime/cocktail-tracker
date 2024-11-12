import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { icons, iconsDark } from '@/constants';

interface FieldProps {
    title: string,
    value: string,
    isDark: boolean,
    placeholder: string,
    handleChangeText: (e: string) => void,
    otherStyles?: string,
    keyboardType?: string,
    secureTextEntry?: boolean,
}

export const Field: React.FC<FieldProps> = ({ ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const icon = props.isDark ? iconsDark : icons;

    return (
        <View>
            <Text className='text-xl font-bmedium text-zinc-900 dark:text-zinc-50 mb-2'>{ props.title }</Text>

            <View className="w-full p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border-[1px] border-zinc-200 dark:border-zinc-700 flex flex-row items-center mb-5">
                <TextInput 
                    className="flex-1 text-zinc-900 dark:text-zinc-50 font-bregular text-lg leading-6"
                    value={ props.value }
                    placeholder={ props.placeholder }
                    placeholderTextColor={`${props.isDark ? '#A0A0A9' : '#D3D3D7'}`}
                    onChangeText={ props.handleChangeText }
                    secureTextEntry={props.title === "Password" && !showPassword}
                />

                {props.title === "Password" && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image
                        source={!showPassword ? icon.hide : icon.show}
                        className="w-6 h-6"
                        resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}
