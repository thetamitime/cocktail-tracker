import React from 'react'
import { Stack } from 'expo-router'

const ProfileLayout = () => {
  return (
    <Stack initialRouteName='profile' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='profile'/>
      <Stack.Screen name='settings'/>
    </Stack>
  )
}

export default ProfileLayout