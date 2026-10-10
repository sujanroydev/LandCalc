import React from 'react';
import { View } from 'react-native';

type SafeAreaProviderProps = {
  children: React.ReactNode;
};

export function SafeAreaProvider({ children }: SafeAreaProviderProps) {
  return <>{children}</>;
}

export const SafeAreaView = View;
