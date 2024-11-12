import React from 'react'
import { Stack } from 'expo-router'

const SearchLayout = () => {
  return (
    <Stack initialRouteName='search' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='search'/>
    </Stack>
  )
}

export default SearchLayout