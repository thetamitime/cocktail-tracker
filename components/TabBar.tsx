import { View, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TabBarButton } from './TabBarButton';
import { useState, useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { getTheme } from '@/api/firebaseFunctions';
import { useGlobal } from '@/context/GlobalProvider';

export const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
    const [colorScheme, setColorScheme] = useState<boolean | undefined>(undefined);
    const { user } = useGlobal();

    useEffect(() => {
        const getColorScheme = async () => {
            try {
                if (user && user.uid) {
                    const unsubscribeScheme = getTheme(user.uid, (fetchedDark) => {
                        setColorScheme(fetchedDark);
                    });
                    return unsubscribeScheme; // Ensure to clean up the subscription if necessary
                }
            } catch (err) {
                console.log('Failed to get theme:', err);
            }
        };

        if (user) {
            getColorScheme();
        }
    }, [user]);

    const buttonWidth = dimensions.width / state.routes.length;

    const onTabBarLayout = (e: LayoutChangeEvent) => {
        setDimensions({
            height: e.nativeEvent.layout.height,
            width: e.nativeEvent.layout.width,
        });
    };

    const tabPositionX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: tabPositionX.value }],
        };
    });

    return (
        <View className='w-full bg-zinc-100 dark:bg-zinc-900'>
            <View
            onLayout={onTabBarLayout}
            className="flex-row items-start justify-center h-20 bg-zinc-100/80 dark:bg-zinc-800/70 backdrop-blur-md rounded-t-3xl"
        >
            <Animated.View
                className="bg-zinc-50 dark:bg-zinc-800 absolute left-0 rounded-t-3xl"
                style={[
                    animatedStyle,
                    {
                        height: dimensions.height,
                        width: buttonWidth,
                    },
                ]}
            />
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    tabPositionX.value = withSpring(buttonWidth * index, { duration: 500, dampingRatio: 1 });
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                return (
                    <TabBarButton
                        key={route.name}
                        onPress={onPress}
                        routeName={route.name}
                        isFocused={isFocused}
                        colorScheme={colorScheme}  // Pass colorScheme as prop
                    />
                );
            })}
        </View>
        </View>
    );
};
