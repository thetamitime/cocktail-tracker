import { TouchableOpacity, Text } from 'react-native';
import React from 'react';

interface ButtonProps {
  title: string,
  large?: boolean,
  containerStyles?: string,
  textStyles?: string,
  handlePress: () => void,
}

export const CustomButton: React.FC<ButtonProps> = ({ ...props }) => {
  return (
    <TouchableOpacity
      onPress={ props.handlePress }
      activeOpacity={0.7} 
      className={`bg-orange-600 py-3 w-full mb-3 rounded-full justify-center items-center ${props.containerStyles}`}
    >
      <Text className={`${ props.large ? 'text-lg' : 'text-base' } font-bsemibold ${ props.textStyles ? props.textStyles : 'text-zinc-50'}`}>{ props.title }</Text>
    </TouchableOpacity>
  )
}