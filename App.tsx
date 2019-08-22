import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import AlarmControl from './AlarmControl';

export default function App() {
  return (
    <AlarmControl></AlarmControl>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden:{
    display:'none'
  }
  
});
