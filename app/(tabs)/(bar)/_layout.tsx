import React from 'react'
import { Stack } from 'expo-router'

const BarLayout = () => {
  return (
    <Stack initialRouteName='bar' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='bar'/>
    </Stack>
  )
}

export default BarLayout