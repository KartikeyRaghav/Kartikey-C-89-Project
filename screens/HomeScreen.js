import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { ListItem } from 'react-native-elements'
import firebase from 'firebase';
import { RFValue } from 'react-native-responsive-fontsize';
import db from '../config'
import MyHeader from '../components/MyHeader';

export default class HomeScreen extends Component {
    constructor() {
        super()
        this.state = {
            requestedItemsList: []
        }
        this.requestRef = null
    }

    getRequestedItemsList = () => {
        this.requestRef = db.collection("requested_items").where('request_status', '==', 'Open')
            .onSnapshot((snapshot) => {
                var requestedItemsList = snapshot.docs.map(document => document.data());
                this.setState({
                    requestedItemsList: requestedItemsList
                });
            })
    }

    componentDidMount() {
        this.getRequestedItemsList()
    }

    componentWillUnmount() {
        this.requestRef();
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item, i }) => {
        return (
            <ListItem
                key={i}
                title={item.itemName}
                subtitle={item.item_description}
                titleStyle={{ color: 'black', fontWeight: 'bold' }}
                rightElement={
                    <TouchableOpacity style={styles.button} onPress={() => {
                        this.props.navigation.navigate("UserDetails", { "details": item })
                    }}>
                        <Text style={{ color: '#ffff' }}>Exchange</Text>
                    </TouchableOpacity>
                }
                bottomDivider
            />
        )
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MyHeader title="Home" navigation={this.props.navigation} />
                <View style={{ flex: 1 }}>
                    {
                        this.state.requestedItemsList.length === 0
                            ? (
                                <View style={styles.subContainer}>
                                    <Text style={{ fontSize: RFValue(20) }}>List Of All Requested Items</Text>
                                </View>
                            )
                            : (
                                <FlatList
                                    keyExtractor={this.keyExtractor}
                                    data={this.state.requestedItemsList}
                                    renderItem={this.renderItem}
                                />
                            )
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    subContainer: {
        flex: 1,
        fontSize: RFValue(20),
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        width: 100,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#000066",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
    }
})