import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import HomeScreen from '../screens/HomeScreen';
import UserDetails  from '../screens/UserDetails';

export const AppStackNavigator = createStackNavigator({
  ItemList : {
    screen : HomeScreen,
    navigationOptions:{
      headerShown : false
    }
  },
  UserDetails : {
    screen : UserDetails,
    navigationOptions:{
      headerShown : false
    }
  },

},
  {
    initialRouteName: 'ItemList'
  }
);
