import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import firebase from 'firebase';
import db from '../config';
import { Card, Header, Icon, Avatar } from 'react-native-elements'
import { RFValue } from 'react-native-responsive-fontsize';


export default class ItemDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: firebase.auth().currentUser.email,
            itemName: this.props.navigation.getParam('item')['itemName'],
            itemDescription: this.props.navigation.getParam('item')['item_description'],
            exchangeId: this.props.navigation.getParam('item')['exchangeId'],
            valueInEUR: this.props.navigation.getParam('item')['value'],
            exchangerName: '',
            exchangerContact: '',
            exchangerAddress: '',
            currencyCode: '',
            image: '#',
            value: ''
        }
    }

    getUserDetails = () => {
        db.collection('Users').where('emailId', '==', this.state.userId).onSnapshot(snapshot => {
            snapshot.forEach(doc => {
                this.setState({
                    currencyCode: doc.data().currencyCode
                })
            })
        })
    }

    getExchangerDetails = () => {
        db.collection('Users').where('emailId', '==', this.state.exchangeId).onSnapshot(snapshot => {
            snapshot.forEach(doc => {
                var info = doc.data()
                this.setState({
                    exchangerName: info.firstName + ' ' + info.lastName,
                    exchangerAddress: info.address,
                    exchangerContact: info.contact,
                })
            })
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
                this.state.valueInEUR * this.state.rates[this.state.currencyCode]
            ).toFixed(0)
        })
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

    componentDidMount = () => {
        this.getUserDetails();
        this.callUserAPI();
        this.getExchangerDetails();
        this.fetchImage(this.state.exchangeId)
    }

    render() {
        return (
            <View>
                <Header
                    leftComponent={<Icon name='arrow-left' type='feather' color='#696969' onPress={() => this.props.navigation.goBack()} />}
                    centerComponent={{ text: "Item Details", style: { color: '#90A5A9', fontSize: RFValue(20), fontWeight: "bold", } }}
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
                            <Text style={{ fontWeight: 'bold' }}>Reason : {this.state.itemDescription}</Text>
                        </Card>
                        <Card>
                            <Text style={{ fontWeight: 'bold' }}>Value : {this.state.value + ' ' + this.state.currencyCode}</Text>
                        </Card>
                    </Card>
                    <Card
                        title={"Exchanger Information"}
                        titleStyle={{ fontSize: RFValue(20) }}
                    >
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
                                    <Text style={{ fontWeight: 'bold' }}>Name: {this.state.exchangerName}</Text>
                                </Card>
                                <Card>
                                    <Text style={{ fontWeight: 'bold' }}>Contact: {this.state.exchangerContact}</Text>
                                </Card>
                                <Card>
                                    <Text style={{ fontWeight: 'bold' }}>Address: {this.state.exchangerAddress}</Text>
                                </Card>
                            </View>
                        </View>
                    </Card>
                </ScrollView>
            </View>
        )
    }
}