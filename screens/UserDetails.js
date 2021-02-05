import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Header, Icon } from 'react-native-elements';
import firebase from 'firebase';
import { Avatar } from 'react-native-elements';
import db from '../config.js';
import { RFValue } from "react-native-responsive-fontSize";

export default class UserDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exchangeId: firebase.auth().currentUser.email,
            exchangerName: '',
            userId: this.props.navigation.getParam('details')["user_id"],
            requestId: this.props.navigation.getParam('details')["request_id"],
            itemName: this.props.navigation.getParam('details')["itemName"],
            item_description: this.props.navigation.getParam('details')["item_description"],
            userName: '',
            userContact: '',
            userAddress: '',
            userRequestDocId: '',
            updated: false,
            image: '#',
            userCurrencyCode: '',
            valueInEUR: this.props.navigation.getParam('details')["value"],
            exchangerCurrencyCode: '',
            value: '',
            rates: []
        }
    }

    getUserDetails() {
        db.collection('Users').where('emailId', '==', this.state.userId).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    this.setState({
                        userName: doc.data().firstName,
                        userContact: doc.data().contact,
                        userAddress: doc.data().address,
                        userCurrencyCode: doc.data().currencyCode
                    })
                })
            });

        db.collection('requested_items').where('request_id', '==', this.state.requestId).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    this.setState({ userRequestDocId: doc.id })
                })
            })
        this.callUserAPI()
    }

    fetchImage = (imageName) => {
        firebase
            .storage()
            .ref()
            .child("user_profiles/" + imageName)
            .getDownloadURL()
            .then((url) => {
                this.setState({ image: url });
                console.log(this.state.image)
            })
            .catch((error) => {
                this.setState({ image: "#" });
            });
    }

    getExchangerDetails = (userId) => {
        db.collection("Users").where('emailId', '==', userId).get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    this.setState({
                        exchangerName: doc.data().firstName + " " + doc.data().lastName,
                        exchangerCurrencyCode: doc.data().currencyCode
                    })
                })
            })
    }

    updateItemStatus = () => {
        db.collection('requested_items').doc(this.state.userRequestDocId).update({
            requested_by: this.state.userName,
            exchangeId: this.state.exchangeId,
            request_status: "Exchanger Interested"
        })

        this.setState({ updated: false })
    }

    addNotification = () => {
        var message = this.state.exchangerName + " has shown interest in exchanging " + this.state.itemName
        db.collection("all_notifications").add({
            "targeted_user_id": this.state.userId,
            "exchangerId": this.state.exchangeId,
            "request_id": this.state.requestId,
            "itemName": this.state.itemName,
            "date": firebase.firestore.FieldValue.serverTimestamp(),
            "notification_status": "unread",
            "message": message
        })
    }

    callUserAPI = async () => {
        if (this.state.currencyCode != 'EUR') {
            const api = `https://api.exchangeratesapi.io/latest?base=EUR`;

            await fetch(api)
                .then((results) => {
                    return results.json();
                })
                .then((data) => {
                    this.setState({
                        rates: data.rates,
                    });
                    this.convertToUserCurrency();
                });
        } else {
            this.setState({
                value: this.state.valueInEUR
            })
        }
    }

    convertToUserCurrency = () => {
        this.setState({
            value: Number.parseFloat(
                this.state.valueInEUR * this.state.rates[this.state.exchangerCurrencyCode]
            ).toFixed(0)
        })
    }

    componentDidMount() {
        this.getUserDetails();
        this.getExchangerDetails(this.state.exchangeId);
        this.fetchImage(this.state.userId)
    }

    render() {
        return (
            <View style={styles.container}>
                <Header
                    leftComponent={<Icon name='arrow-left' type='feather' color='#696969' onPress={() => this.props.navigation.goBack()} />}
                    centerComponent={{ text: "Exchange Item", style: { color: '#90A5A9', fontSize: RFValue(20), fontWeight: "bold", } }}
                    backgroundColor="#eaf8fe"
                />
                <ScrollView>
                    <Card
                        title={"Item Information"}
                        titleStyle={{ fontSize: RFValue(20) }}
                    >
                        <Card >
                            <Text style={{ fontWeight: 'bold' }}>Name : {this.state.itemName}</Text>
                        </Card>
                        <Card>
                            <Text style={{ fontWeight: 'bold' }}>Reason : {this.state.item_description}</Text>
                        </Card>
                        <Card>
                            <Text style={{ fontWeight: 'bold' }}>Value : {this.state.value + ' ' + this.state.exchangerCurrencyCode}</Text>
                        </Card>
                    </Card>
                    <Card
                        title={"User Information"}
                        titleStyle={{ fontSize: RFValue(20) }}
                    >
                        <Card>
                            <View style={{ flexDirection: 'row' }}>
                                <Avatar
                                    rounded
                                    source={{
                                        uri: this.state.image,
                                    }}
                                    size={"xlarge"}
                                />
                                <View>
                                    <Card>
                                        <Text style={{ fontWeight: 'bold' }}>Name: {this.state.userName}</Text>
                                    </Card>
                                    <Card>
                                        <Text style={{ fontWeight: 'bold' }}>Contact: {this.state.userContact}</Text>
                                    </Card>
                                    <Card>
                                        <Text style={{ fontWeight: 'bold' }}>Address: {this.state.userAddress}</Text>
                                    </Card>
                                </View>
                            </View>
                        </Card>
                    </Card>
                </ScrollView>
                {
                    this.state.userId !== this.state.exchangeId
                        ? (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    this.setState({ updated: true })
                                    if (this.state.updated === true) {
                                        this.updateItemStatus();
                                        this.addNotification();
                                        this.props.navigation.navigate('MyExchanges')
                                    }
                                }}>
                                <Text>I want to Exchange</Text>
                            </TouchableOpacity>
                        )
                        : null
                }
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        width: 200,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: 'orange',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
        alignSelf: 'center',
    }
})
