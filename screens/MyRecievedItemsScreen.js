import React from "react";
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MyHeader from '../components/MyHeader';
import db from '../config';
import firebase from 'firebase'
import { Icon, ListItem } from "react-native-elements";
import { RFValue } from 'react-native-responsive-fontsize';

export default class MyRecievedItemsScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            userId: firebase.auth().currentUser.email,
            recievedItems: []
        }
    }

    getAllRecievedItems = () => {
        db.collection('requested_items').where('user_id', '==', this.state.userId)
            .where('request_status', '==', 'Closed').onSnapshot(snapshot => {
                var recievedItems = snapshot.docs.map(doc => doc.data());
                this.setState({
                    recievedItems: recievedItems,
                });
            })
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({ item, i }) => (
        <ListItem
            key={i}
            leftElement={<Icon name="get-pocket" type="font-awesome" color='#696969' />}
            rightElement={
                <TouchableOpacity style={{
                    backgroundColor: 'black',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: 3,
                    borderWidth: 2,
                    borderColor: 'yellow',
                    borderRadius: 2,
                    fontSize: RFValue(20)
                }} onPress={() => this.props.navigation.navigate('ItemDetails', { "item": item })} >
                    View Item Details
                </TouchableOpacity>}
            title={'  ' + item.itemName}
            titleStyle={{ color: 'black', fontWeight: 'bold', fontSize: RFValue(20) }}
            subtitle={'  Exchnaged by: ' + item.exchangeId}
            bottomDivider
        />
    )

    componentDidMount = () => {
        this.getAllRecievedItems()
    }

    render() {
        return (
            <View>
                <MyHeader title='Recieved Items' navigation={this.props.navigation} />
                <View style={{ flex: 0.9 }} >
                    {this.state.recievedItems.length === 0 ?
                        (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>You have not recieved any items yet</Text>
                            </View>
                        ) :
                        (
                            <FlatList
                                keyExtractor={this.keyExtractor}
                                data={this.state.recievedItems}
                                renderItem={this.renderItem}
                            />
                        )
                    }
                </View>
            </View>
        )
    }
}