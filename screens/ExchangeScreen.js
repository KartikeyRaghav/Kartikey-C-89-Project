import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import { RFValue } from 'react-native-responsive-fontsize'

const API = 'https://api.exchangeratesapi.io/latest'

export default class ExchangeScreen extends Component {
    constructor() {
        super();
        this.state = {
            userId: firebase.auth().currentUser.email,
            itemName: "",
            itemDescription: "",
            isExchangeRequestActive: false,
            request_status: '',
            docId: '',
            updated: false,
            exchangeId: '',
            userName: '',
            notificationId: '',
            currencyCode: '',
            valueIn: null,
            valueInEUR: null
        }
    }

    getUserDetails = () => {
        db.collection('Users').where('emailId', '==', this.state.userId).onSnapshot(snapshot => {
            snapshot.forEach(doc => {
                var info = doc.data();
                this.setState({
                    userName: info.firstName + ' ' + info.lastName,
                    currencyCode: info.currencyCode
                })
            })
        })
    }

    checkforExchanges = () => {
        db.collection('requested_items').where('user_id', '==', this.state.userId)
            .where('isRequestActive', '==', true).onSnapshot(snapshot => {
                snapshot.forEach(doc => {
                    var info = doc.data();
                    this.setState({
                        isExchangeRequestActive: info.isRequestActive,
                        request_status: info.request_status,
                        itemName: info.itemName,
                        docId: doc.id,
                        valueIn: info.value
                    })
                })
            })
        this.callUserAPI();
    }

    updateNotification = () => {
        db.collection('all_notifications').doc(this.state.notificationId).update({
            notification_status: 'read'
        })
    }

    sendNotification = () => {
        db.collection('all_notifications').add({
            targeted_user_id: this.state.exchangeId,
            itemName: this.state.itemName,
            message: this.state.userName + ' has recieved ' + this.state.itemName,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            notification_status: 'unread'
        })
        this.setState({
            isExchangeRequestActive: false,
            itemName: '',
        })
    }

    updateItemStatus = () => {
        if (this.state.updated === true) {
            db.collection('requested_items').where('itemName', '==', this.state.itemName)
                .where('user_id', '==', this.state.userId)
                .onSnapshot(snapshot => {
                    snapshot.forEach(doc => {
                        var item = doc.data();
                        this.setState({
                            request_status: item.request_status,
                            exchangeId: item.exchangeId
                        })
                    })
                })

            if (this.state.request_status != 'Item Sent') {
                alert('No body has sent your item');
            }
            else {
                db.collection('requested_items').doc(this.state.docId).update({
                    isRequestActive: false,
                    request_status: 'Closed'
                })

                this.setState({
                    request_status: '',
                    docId: '',
                    valueInEUR: ''
                })

                db.collection('all_notifications').where('itemName', '==', this.state.itemName)
                    .where('targeted_user_id', '==', this.state.userId).onSnapshot(snapshot => {
                        snapshot.forEach(doc => {
                            this.setState({
                                notificationId: doc.id,
                                exchangeId: doc.data().exchangerId
                            })
                            this.updateNotification();
                        })
                        this.sendNotification();
                    })
            }
        }
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
                valueInEUR: this.state.valueIn
            })
        }
    }

    convertToUserCurrency = () => {
        this.setState({
            valueInEUR: Number.parseFloat(
                this.state.valueIn * this.state.rates[this.state.currencyCode]
            ).toFixed(0)
        })
    }

    callAPI = async () => {
        if (this.state.currencyCode != 'EUR') {
            const api = `https://api.exchangeratesapi.io/latest?base=${this.state.currencyCode}`;

            await fetch(api)
                .then((results) => {
                    return results.json();
                })
                .then((data) => {
                    this.setState({
                        rates: data.rates,
                    });
                    this.convertToEuros();
                });
        } else {
            this.setState({
                valueIn: this.state.valueInEUR
            })
        }
    }

    convertToEuros = () => {
        this.setState({
            valueIn: Number.parseFloat(
                this.state.valueInEUR * this.state.rates['EUR']
            ).toFixed(3)
        })
    }

    createUniqueId() {
        return Math.random().toString(36).substring(7);
    }

    addRequest = async (itemName, itemDescription) => {
        if (this.state.itemName != '' && this.state.itemDescription != '') {
            var userId = this.state.userId
            var randomRequestId = this.createUniqueId()
            await this.callAPI();
            db.collection('requested_items').add({
                "user_id": userId,
                "itemName": itemName,
                "item_description": itemDescription,
                "request_id": randomRequestId,
                'request_status': 'Open',
                'isRequestActive': true,
                value: this.state.valueIn,
            })

            this.setState({
                isExchangeRequestActive: true
            })

            return alert("Item Requested Successfully")
        } else {
            alert('Please enter the details of the item.');
        }
    }

    componentDidMount = () => {
        this.checkforExchanges();
        this.getUserDetails();
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MyHeader title="Exchange" navigation={this.props.navigation} />
                { this.state.isExchangeRequestActive === false ?
                    <KeyboardAvoidingView style={styles.keyBoardStyle}>
                        <TextInput
                            style={styles.formTextInput}
                            placeholder={"Enter item name"}
                            onChangeText={(text) => {
                                this.setState({
                                    itemName: text
                                })
                            }}
                            value={this.state.itemName}
                        />
                        <TextInput
                            style={styles.formTextInput}
                            placeholder={"Value"}
                            keyboardType='numeric'
                            onChangeText={(text) => {
                                this.setState({
                                    valueInEUR: text
                                })
                            }}
                            value={this.state.valueInEUR}
                        />

                        <TextInput
                            style={[styles.formTextInput, { height: 300 }]}
                            multiline
                            numberOfLines={8}
                            placeholder={"Enter item description"}
                            onChangeText={(text) => {
                                this.setState({
                                    itemDescription: text
                                })
                            }}
                            value={this.state.itemDescription}
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => { this.addRequest(this.state.itemName, this.state.itemDescription) }}
                        >
                            <Text>Request</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView> :
                    <View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                        <Text style={styles.text}>Item Name<br />{this.state.itemName}</Text>
                        <Text style={styles.text}>Item Value<br />{this.state.valueInEUR + ' ' + this.state.currencyCode}</Text>
                        <Text style={styles.text}>Item Status<br />{this.state.request_status}</Text>
                        <TouchableOpacity style={styles.container} onPress={() => {
                            this.setState({
                                updated: true
                            })
                            this.updateItemStatus()
                        }}>
                            I have recieved the item
                        </TouchableOpacity>
                    </View>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    keyBoardStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    formTextInput: {
        width: "75%",
        alignSelf: 'center',
        borderColor: 'blue',
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 20,
        padding: 2,
        textAlign: 'center',
        fontSize: RFValue(20)
    },
    button: {
        width: "75%",
        height: 70,
        fontSize: RFValue(30),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: "#ff5722",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 16,
        marginTop: 20
    },
    text: {
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'red',
        fontSize: RFValue(20),
        fontWeight: 'bold',
        padding: 3,
        margin: 10,
        textAlign: 'center'
    },
    container: {
        borderColor: 'green',
        borderWidth: 3,
        borderRadius: 5,
        padding: 2,
        margin: 10,
        backgroundColor: 'yellow',
        fontSize: RFValue(20),
        fontStyle: 'italic',
        color: 'red'
    },
})