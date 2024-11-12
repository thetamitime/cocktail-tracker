import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const PrefsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='drink' options={{ headerShown: false }}/>
      <Stack.Screen name='ingredients' options={{ headerShown: false }}/>
      <Stack.Screen name='allergies' options={{ headerShown: false }}/>
    </Stack>
  )
}

export default PrefsLayout