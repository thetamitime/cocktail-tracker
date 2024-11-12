import { View, Pressable, Image } from 'react-native';
import { icons, iconsDark } from '@/constants';
import { useGlobal } from '@/context/GlobalProvider';

interface TabBarButtonProps {
    onPress: () => void;
    routeName: string;
    isFocused: boolean;
    colorScheme: boolean | undefined;  // Add colorScheme prop
}

export const TabBarButton: React.FC<TabBarButtonProps> = ({ ...props }) => {
    // Ensure colorScheme is defined and pick icons accordingly
    const iconSet = props.colorScheme === undefined ? icons : !props.colorScheme ? iconsDark : icons;
    console.log(props.colorScheme)

    // Fallback if routeName does not exist in icon sets
    const iconSource = iconSet[props.routeName.replace(/[()]/g, "")] || iconSet['defaultIcon'];

    return (
        <Pressable onPress={props.onPress} className="flex-1 items-center justify-center h-full">
            <View className={`${props.isFocused ? '' : 'opacity-40 dark:opacity-60'} transition-opacity`}>
                <Image source={iconSource} className="w-8 h-8" />
            </View>
        </Pressable>
    );
};
