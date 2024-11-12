import { View, Text } from 'react-native'
import React from 'react'
import RNPickerSelect from 'react-native-picker-select';

export const LanguagePicker: React.FC<{isDark: boolean}> = ({isDark}) => {
  return (
    <View className='py-3 flex flex-row justify-between items-center'>
        <Text className='font-bregular text-lg text-zinc-900 dark:text-zinc-50'>Select your language</Text>
        <RNPickerSelect
            darkTheme={isDark}
            style={{
                inputIOS: {
                    fontFamily: 'BeVietnamPro-Medium',
                    fontSize: 18,
                    color: '#E9580C'
                }
            }}
            placeholder={{}}
            onValueChange={(value) => console.log(value)}
            items={[
                { label: 'English', value: 'english' },
            ]}
        />
    </View>
  )
}
