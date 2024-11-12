import { View, Text, Image, ImageSourcePropType, TouchableOpacity } from 'react-native'
import React, { FC } from 'react'
import { router } from 'expo-router'

interface TabHeaderProps {
    title: string,
    isMain: boolean,
    name?: string,
    handleLeftPress?: () => void,
    handleRightPress?: () => void,
    otherStyles?: string,
    leftIcon?: ImageSourcePropType,
    rightIcon?: ImageSourcePropType,
}

export const TabHeader: React.FC<TabHeaderProps> = ({...props}) => {
  const bothIcons = (props.leftIcon || props.rightIcon) ? 1 : 0;

  return (
    <View className={`pt-28 w-11/12 ${props.otherStyles}
    ${bothIcons && 'w-full flex flex-row items-center'} ${props.rightIcon && 'justify-between'} ${props.leftIcon && 'gap-3'}`}>
      {props.leftIcon && 
        <TouchableOpacity
          onPress={props.handleLeftPress ? props.handleLeftPress : () => router.back()}
        >
          <Image source={props.leftIcon} className={`${props.isMain ? 'w-8 h-8 mb-2' : 'w-6 h-6'}`}/>
        </TouchableOpacity>
      }
      
      <Text className={`font-bbold text-zinc-900 ${props.isMain ? 'text-4xl' : 'text-3xl text-center max-w-xs'} dark:text-zinc-50`}>{ props.title } {props.name && 
        <Text className='text-orange-600 dark:text-orange-500'>{ props.name }</Text>
      }{props.name && '!'}
      </Text>

      {props.rightIcon && 
        <TouchableOpacity onPress={ props.handleRightPress }>
          <Image source={props.rightIcon} className={`${props.isMain ? 'w-9 h-9 mb-2' : 'w-7 h-7'}`}/>
        </TouchableOpacity>
      }
    </View>
  )
}
