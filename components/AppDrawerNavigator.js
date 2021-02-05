import React from 'react';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { AppTabNavigator } from './AppTabNavigator'
import CustomSideBarMenu from './CustomSideBarMenu';
import SettingScreen from '../screens/SettingScreen';
import MyExchanges from '../screens/MyExchanges';
import NotificationScreen from '../screens/NotifiactionScreen';
import { StackNavigator } from './StackNavigator';
import { Icon } from 'react-native-elements';

export const AppDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: AppTabNavigator,
    navigationOptions:{
      drawerIcon: <Icon name='home' type='font-awesome' />
    }
  },
  Setting: {
    screen: SettingScreen,
    navigationOptions:{
      drawerIcon: <Icon name='cog' type='font-awesome' />
    }
  },
  Notification: {
    screen: NotificationScreen,
    navigationOptions:{
      drawerIcon: <Icon name='bell' type='font-awesome' />
    }
  },
  'My Exchanges': {
    screen: MyExchanges,
    navigationOptions:{
      drawerIcon: <Icon name='stack-exchange' type='font-awesome' />
    }
  },
  'Recieved Items': {
    screen: StackNavigator,
    navigationOptions:{
      drawerIcon: <Icon name='get-pocket' type='font-awesome' />
    }
  }
},
  {
    contentComponent: CustomSideBarMenu
  },
  {
    initialRouteName: 'Home'
  })
