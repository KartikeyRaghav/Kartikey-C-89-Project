import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import MyRecievedItemsScreen from '../screens/MyRecievedItemsScreen';
import ItemDetails from '../screens/ItemDetails';

export const StackNavigator = createStackNavigator({
    RecievedItemList: {
        screen: MyRecievedItemsScreen,
        navigationOptions: {
            headerShown: false
        }
    },
    ItemDetails: {
        screen: ItemDetails,
        navigationOptions: {
            headerShown: false
        }
    },
},
    {
        initialRouteName: 'RecievedItemList'
    }
);
