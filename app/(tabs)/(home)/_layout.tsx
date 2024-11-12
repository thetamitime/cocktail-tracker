import React from 'react'
import { Stack } from 'expo-router'

const HomeLayout = () => {
  return (
    <Stack initialRouteName='home' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='home'/>
      <Stack.Screen name='all-categories'/>
    </Stack>
  )
}

export default HomeLayout