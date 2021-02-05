import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Picker,
} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import { RFValue } from 'react-native-responsive-fontSize';

const API = 'https://api.exchangeratesapi.io/latest'

export default class WelcomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      emailId: '',
      password: '',
      clicked: false,
      isModalVisible: false,
      firstName: '',
      lastName: '',
      address: '',
      contact: '',
      confirmPassword: '',
      currencyCode: [],
      selectedValue: 'Currency Code'
    };
  }

  login = async (email, password) => {
    if (this.state.clicked === true) {
      if (email && password) {
        await firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then(() => {
            alert('User Login Successful.');
            this.props.navigation.navigate('Home');
          })
          .catch((error) => {
            var message = error.message;
            alert(message);
          });
      } else {
        alert('Enter your details');
      }
    }
  };

  signUp = async (email, password) => {
    if (
      this.state.firstName != '' &&
      this.state.address != '' &&
      this.state.contact != '' &&
      this.state.selectedValue != 'Currency Code'
    ) {
      if (this.state.clicked === true) {
        if (password === this.state.confirmPassword) {
          if (email && password) {
            await firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then(() => {
                alert('User SignUp Successful.');
                this.props.navigation.navigate('Home');
              })
              .catch((error) => {
                var message = error.message;
                alert(message);
              });

            db.collection('Users').add({
              contact: this.state.contact,
              address: this.state.address,
              firstName: this.state.firstName,
              lastName: this.state.lastName,
              emailId: this.state.emailId,
              password: this.state.password,
              currencyCode: this.state.selectedValue
            });
          } else {
            alert('Enter your password and email id.');
          }
        } else {
          alert('Your passwords do not match.\nPlease check your password.');
        }
      }
    } else {
      alert('Enter your details.');
    }
  };

  getCurrencyCodes = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => {
        this.setState({
          currencyCode: [data.base, ...Object.keys(data.rates).sort()]
        })
      })
  }

  componentDidMount = () => {
    this.getCurrencyCodes()
  }

  render() {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.isModalVisible}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.text3}>Registration Form</Text>
              <TextInput
                placeholder="First Name"
                placeholderTextColor="white"
                style={styles.input3}
                maxLength={20}
                onChangeText={(val) => this.setState({ firstName: val })}
                value={this.state.firstName}
              />

              <TextInput
                placeholder="Last Name"
                placeholderTextColor="white"
                style={styles.input3}
                maxLength={20}
                onChangeText={(val) => this.setState({ lastName: val })}
                value={this.state.lastName}
              />

              <TextInput
                placeholder="Address"
                placeholderTextColor="white"
                style={styles.input3}
                multiline={true}
                onChangeText={(val) => this.setState({ address: val })}
                value={this.state.address}
              />

              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="white"
                style={styles.input3}
                maxLength={10}
                keyboardType="numeric"
                onChangeText={(val) => this.setState({ contact: val })}
                value={this.state.contact}
              />

              <Picker
                selectedValue={this.state.selectedValue} onValueChange={(val) => {
                  this.setState({
                    selectedValue: val
                  })
                }}
                style={{
                  fontSize: RFValue(15),
                  fontWeight: 'bold',
                  borderRadius: 3,
                  borderWidth: 2,
                  backgroundColor: 'purple',
                  marginTop: 15,
                  padding: 2,
                  textAlign: 'center'
                }}>
                <Picker.Item label='Currency Code' value='Currency Code' color='white' />
                {this.state.currencyCode.map(op => (
                  <Picker.Item label={op} value={op} />
                ))}
              </Picker>

              <TextInput
                placeholder="Email Address"
                placeholderTextColor="white"
                style={styles.input3}
                keyboardType="email-address"
                onChangeText={(val) => this.setState({ emailId: val })}
                value={this.state.emailId}
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor="white"
                style={styles.input3}
                secureTextEntry={true}
                onChangeText={(val) => this.setState({ password: val })}
                value={this.state.password}
              />

              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="white"
                style={styles.input3}
                secureTextEntry={true}
                onChangeText={(val) => this.setState({ confirmPassword: val })}
                value={this.state.confirmPassword}
              />

              <TouchableOpacity
                style={styles.container2}
                onPress={() => {
                  this.setState({ clicked: true });
                  this.signUp(this.state.emailId, this.state.password);
                }}>
                <Text style={styles.text4}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.container3}
                onPress={() => {
                  this.setState({
                    clicked: false,
                    isModalVisible: false,
                  });
                }}>
                <Text style={styles.text4}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <KeyboardAvoidingView style={{ alignItems: 'center', marginTop: 20 }}>
          <View>
            <Text style={{ textAlign: 'center', fontSize: RFValue(25) }}>
              Barter App
            </Text>
          </View>
          <View>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              keyboardType="email-address"
              onChangeText={(text) => {
                this.setState({
                  emailId: text,
                });
              }}
              value={this.state.emailId}
            />

            <TextInput
              style={styles.input2}
              secureTextEntry={true}
              placeholder="Password"
              onChangeText={(text) => {
                this.setState({
                  password: text,
                });
              }}
              value={this.state.password}
            />
          </View>
          <View>
            <TouchableOpacity
              style={styles.container}
              onPress={() => {
                this.setState({ clicked: true })
                this.login(this.state.emailId, this.state.password);
              }}>
              <Text style={styles.text2}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.container}
              onPress={() => {
                this.setState({ isModalVisible: true });
              }}>
              <Text style={styles.text2}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: RFValue(15),
    borderRadius: 3,
    borderWidth: 2,
    alignSelf: 'center',
    padding: 2,
    backgroundColor: 'yellow',
    fontWeight: 'bold',
  },
  input2: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: RFValue(15),
    borderRadius: 3,
    borderWidth: 2,
    alignSelf: 'center',
    padding: 2,
    backgroundColor: 'yellow',
    fontWeight: 'bold',
  },
  input3: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: RFValue(15),
    borderRadius: 3,
    borderWidth: 2,
    alignSelf: 'center',
    padding: 2,
    backgroundColor: 'purple',
    fontWeight: 'bold',
  },
  container: {
    fontSize: RFValue(25),
    backgroundColor: 'black',
    fontWeight: 'bold',
    borderRadius: 5,
    borderWidth: 2,
    alignSelf: 'center',
    marginTop: 10,
    padding: 2,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'green',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text2: {
    color: 'white',
    fontSize: RFValue(15),
    padding: 2,
  },

  text3: {
    fontSize: RFValue(25),
    fontWeight: 'bold',
    backgroundColor: 'yellow',
    padding: 5,
    borderRadius: 5,
    color: 'red',
    textAlign: "center",
  },

  container2: {
    backgroundColor: 'brown',
    padding: 2,
    marginTop: 10,
    borderRadius: 3,
    borderWidth: 2,
    fontSize: RFValue(15),
  },

  container3: {
    backgroundColor: 'blue',
    padding: 2,
    marginTop: 10,
    borderRadius: 3,
    borderWidth: 1,
    fontSize: RFValue(15),
  },
  text4: {
    fontSize: RFValue(20),
    color: 'white',
  },
});