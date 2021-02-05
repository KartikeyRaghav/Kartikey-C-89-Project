import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Picker
} from 'react-native';
import MyHeader from '../components/MyHeader'
import db from '../config'
import firebase from 'firebase';
import { RFValue } from "react-native-responsive-fontSize";

const API = 'https://api.exchangeratesapi.io/latest'

export default class SettingScreen extends Component {
  constructor() {
    super();
    this.state = {
      emailId: '',
      firstName: '',
      lastName: '',
      address: '',
      contact: '',
      docId: '',
      currencyCode: [],
      selectedValue: ''
    }
  }

  getUserDetails = () => {
    var email = firebase.auth().currentUser.email;
    db.collection('Users').where('emailId', '==', email).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var data = doc.data()
          this.setState({
            emailId: data.emailId,
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            contact: data.contact,
            docId: doc.id,
            selectedValue: data.currencyCode
          })
        });
      })
  }

  updateUserDetails = () => {
    db.collection('Users').doc(this.state.docId)
      .update({
        "firstName": this.state.firstName,
        "lastName": this.state.lastName,
        "address": this.state.address,
        "contact": this.state.contact,
        currencyCode: this.state.selectedValue
      })
    alert("Profile Updated Successfully")
  }

  getCurrencyCodes = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => {
        this.setState({
          currencyCode: [data.base, ...Object.keys(data.rates).sort()]
        })
      })
  }

  componentDidMount() {
    this.getUserDetails();
    this.getCurrencyCodes();
  }

  render() {
    return (
      <View>
        <MyHeader title="Settings" navigation={this.props.navigation} />
        <View style={styles.container} >
          <View style={styles.formContainer}>
            <TextInput
              style={styles.formTextInput}
              placeholder={"First Name"}
              maxLength={8}
              onChangeText={(text) => {
                this.setState({
                  firstName: text
                })
              }}
              value={this.state.firstName}
            />

            <TextInput
              style={styles.formTextInput}
              placeholder={"Last Name"}
              maxLength={8}
              onChangeText={(text) => {
                this.setState({
                  lastName: text
                })
              }}
              value={this.state.lastName}
            />

            <TextInput
              style={styles.formTextInput}
              placeholder={"Contact"}
              maxLength={10}
              keyboardType={'numeric'}
              onChangeText={(text) => {
                this.setState({
                  contact: text
                })
              }}
              value={this.state.contact}
            />

            <TextInput
              style={styles.formTextInput}
              placeholder={"Address"}
              multiline={true}
              onChangeText={(text) => {
                this.setState({
                  address: text
                })
              }}
              value={this.state.address}
            />

            <Picker
              selectedValue={this.state.selectedValue} onValueChange={(val) => {
                this.setState({
                  selectedValue: val
                })
              }}
              style={{
                fontSize: RFValue(20),
                width: 300,
                borderRadius: 10,
                borderWidth: 1,
                marginTop: 20,
                textAlign: 'center',
                borderColor: '#ffab91',
                paddingLeft: 10
              }}>
              <Picker.Item label='Currency Code' value='Currency Code' />
              {this.state.currencyCode.map(op => (
                <Picker.Item label={op} value={op} />
              ))}
            </Picker>

            <TouchableOpacity style={styles.button}
              onPress={() => {
                this.updateUserDetails()
              }}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  formContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  formTextInput: {
    width: "75%",
    fontSize: RFValue(20),
    alignSelf: 'center',
    borderColor: '#ffab91',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
    padding: 10,
  },
  button: {
    width: "75%",
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
  buttonText: {
    fontSize: RFValue(25),
    fontWeight: "bold",
    color: "#fff"
  }
})
