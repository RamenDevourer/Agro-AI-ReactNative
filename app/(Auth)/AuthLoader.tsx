import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const AuthLoader = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2d6a4f" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default AuthLoader;