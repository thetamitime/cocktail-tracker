import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

interface SubtitleProps {
    title: string,
    canExpand: boolean,
    otherStyles?: string,
    handlePress?: () => void,
}

export const Subtitle: React.FC<SubtitleProps> = ({ ...props }) => {
  return (
    <View className={`flex flex-row justify-between items-center ${props.otherStyles}`}>
        <Text className='text-3xl font-bbold text-zinc-900 dark:text-zinc-50'>{ props.title }</Text>
        { props.canExpand && 
        <TouchableOpacity
          onPress={ props.handlePress }
        >
            <Text className='font-bmedium text-base text-orange-600'>View all</Text>
        </TouchableOpacity> }
    </View>
  )
}