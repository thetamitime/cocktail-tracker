import { View, Text, Switch } from 'react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { getTheme, setThemeInFirestore } from '@/api/firebaseFunctions';
import { useGlobal } from '@/context/GlobalProvider';

export const ThemeSwitcher: React.FC<{isDark: boolean}> = ({isDark}) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const { user } = useGlobal();
    const { toggleColorScheme } = useColorScheme();

    useEffect(() => {
        const getColorScheme = async () => {
            try {
                if(user && user.uid) {
                    const unsubscribeScheme = await getTheme(user.uid, (fetchedDark) => {
                        setIsEnabled(fetchedDark); // Update state based on Firestore value
                    });
                    return unsubscribeScheme; // Cleanup function
                }
            } catch (err) {
                console.log('Failed to get dark mode preference.', err);
            }
        };

        getColorScheme();
    }, [user]);

    const toggleSwitch = () => {
        const newEnabledState = !isEnabled;
        setIsEnabled(newEnabledState);
        toggleColorScheme(); // Switch between light and dark theme
        setThemeInFirestore(user.uid, newEnabledState); // Update Firestore with the new theme state
    };

    return (
        <View className='py-3 flex flex-row justify-between items-center'>
            <Text className='font-bregular text-lg text-zinc-900 dark:text-zinc-50'>Dark theme</Text>
            <Switch
                style={{ transform: [{ scale: 0.8 }], marginRight: -5 }}
                thumbColor='#F9F9F9'
                ios_backgroundColor="#F9F9F9"
                onValueChange={toggleSwitch}
                value={isEnabled}
            />
        </View>
    );
};
