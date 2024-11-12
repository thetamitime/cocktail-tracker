import React, { FC } from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/components/index";

export default function TabLayout () {
  return (
    <Tabs initialRouteName="(home)" tabBar={props => <TabBar { ...props }/>}>
      <Tabs.Screen name="(home)" options={{ headerShown: false }} />
      <Tabs.Screen name="(search)" options={{ headerShown: false }} />
      <Tabs.Screen name="(bar)" options={{ headerShown: false} } />
      <Tabs.Screen name="(profile)" options={{ headerShown: false} } />
    </Tabs>
  )
}