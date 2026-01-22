import { Tabs, router } from "expo-router";

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // hide header
        tabBarActiveTintColor: "#FF6347",
        tabBarInactiveTintColor: "#555",
      }}
    >
      <Tabs.Screen name="home/index" options={{ title: "Home" }} />
      <Tabs.Screen name="cart/index" options={{ title: "Cart" }} />
      <Tabs.Screen name="orders/order-details" options={{ title: "Orders" }} />
      <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="category/index" options={{ title: "Category" }} />
    </Tabs>
  );
}

