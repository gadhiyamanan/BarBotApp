import React from 'react';
import {createAppContainer, createStackNavigator, SafeAreaView} from 'react-navigation';
import HomeScreen from './src/screens/HomeScreen';
import BarbotScreen from './src/screens/BarbotScreen';
import BottleTutorial from './src/tutorials/BottleTutorial';

const App = () => {
  console.disableYellowBox = true; //REMOVE AFTER TESTING
  return (
      <AppContainer />
  );
};

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  
  ManageBarbot: {
    screen: BarbotScreen
  },

  BottleTut: {
    screen: BottleTutorial
  }
}, {
    initialRouteName: 'Home',
});

const AppContainer = createAppContainer(AppNavigator);

export default App;
