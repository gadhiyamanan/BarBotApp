/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
} from 'react-native';
import {Button, Overlay, Icon, CheckBox} from 'react-native-elements';
import {withNavigation} from 'react-navigation';
import HeaderComponent from '../components/HeaderComponent';
import Spacer from '../components/Spacer';
import {
  addNewBottle,
  refreshRecipes,
  addRecipe,
  cleanPumps,
  removeAllBottles,
  checkAlcoholMode,
  setAlcoholMode,
} from '../api/Control';
import {toUpper} from '../utils/Tools';
import EditIngredientsComponent from '../components/EditIngredientsComponent';
import LoadingComponent from '../components/LoadingComponent';

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

const recipeOverlayWidth = screenWidth / 1.2;
//const recipeOverlayHeight = screenHeight/1.2;
const recipeOverlayHeight = 570;
const iconScale = 0.8;
const buttonSpacing = 30;

class BarbotScreen extends React.Component {
  static navigationOptions = {
    header: <HeaderComponent backVisible={true} />,
  };

  componentDidMount() {
    checkAlcoholMode().then(res => {
      this.setState({
        alcoholMode: res,
      });
    });
  }

  state = {
    newBottleVisible: false,
    newRecipeVisible: false,
    inputBottle: '',
    recipeName: '',
    recipeIngredients: [],
    recipeAmounts: [],
    ingredientCount: 0,
    alcoholMode: false,
    alcoholCheck: false,
    loadingMessage: '',
    loadingTitle: '',
    showLoading: false,
  };

  //Callback for EditIngredients Component
  saveRecipe(recipeIngreds, recipeAmts) {
    if (
      this.state.recipeName !== '' &&
      recipeIngreds.length > 0 &&
      recipeAmts.length > 0
    ) {
      var saveName = this.state.recipeName;
      addRecipe(this.state.recipeName, recipeIngreds, recipeAmts).then(res => {
        console.log('Add Recipe result: ' + res);
        if (res === true) {
          Alert.alert(
            'Success',
            'Successfully added ' + saveName + ' recipe!',
            [
              {
                text: 'OK',
                onPress: () => {
                  refreshRecipes()
                    .then(res => {
                      this.props.navigation.state.params.reloadMenu();
                    })
                    .catch(err => {
                      console.log(err);
                      this.props.navigation.state.params.reloadMenu();
                    });
                },
              },
            ],
          );
        } else {
          Alert.alert(
            'Failed to add ' + saveName + ' recipe! Try again later.',
          );
        }
      });
      this.setState({
        newRecipeVisible: false,
        recipeName: '',
        recipeIngredients: [],
        recipeAmounts: [],
        ingredientCount: 0,
      });
    } else {
      Alert.alert('You must fill out all the appropriate fields!');
    }
  }

  render() {
    return (
      <View style={styles.mainView}>
        <LoadingComponent
          title={this.state.loadingTitle}
          message={this.state.loadingMessage}
          visible={this.state.showLoading}
        />
        <Text style={styles.headerText}>Manage Menu</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                newBottleVisible: true,
              });
            }}>
            <ImageBackground
              style={{height: 120 * iconScale, width: 120 * iconScale}}
              source={require('../assets/newBottleIcon.png')}
            />
            <Text style={styles.iconText}>New Bottle</Text>
          </TouchableOpacity>

          <Spacer width={buttonSpacing} />

          <TouchableOpacity
            onPress={() => {
              this.setState({
                newRecipeVisible: true,
              });
            }}>
            <ImageBackground
              style={{height: 120 * iconScale, width: 120 * iconScale}}
              source={require('../assets/menuIcon.png')}
            />
            <Text style={styles.iconText}>New Recipe</Text>
          </TouchableOpacity>
        </View>

        <Spacer height={35} />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => {
              setAlcoholMode(!this.state.alcoholMode)
                .then(() => {
                  this.props.navigation.state.params.reloadMenu();
                  this.setState({
                    alcoholMode: !this.state.alcoholMode,
                  });
                })
                .catch(error => {
                  console.log(error);
                  Alert.alert('There was an error switching to Alcohol Mode');
                });
            }}>
            <ImageBackground
              style={{
                height: 120 * iconScale,
                width: 120 * iconScale,
                marginLeft: 10,
              }}
              source={require('../assets/alcoholModeIcon.png')}
            />
            <Text style={styles.iconText}>
              {this.state.alcoholMode
                ? 'Disable\n Alcohol Mode'
                : 'Enable\n Alcohol Mode'}
            </Text>
          </TouchableOpacity>

          <Spacer width={buttonSpacing} />

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Confirm Pump Flush',
                'This will flush all pumps for 10 seconds. Be sure to remove all bottles and replace with water prior to flushing! Are you sure you want to continue?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('User canceled pump flush!'),
                    style: 'cancel',
                  },
                  {
                    text: 'Confirm',
                    onPress: () => {
                      console.log('Starting flush of all pumps...');
                      this.setState({
                        showLoading: true,
                        loadingMessage: 'Flushing your ingredient pumps...',
                        loadingTitle: 'Flushing Pumps',
                      });
                      cleanPumps()
                        .then(res => {
                          this.setState({
                            showLoading: false,
                            loadingMessage: '',
                            loadingTitle: '',
                          });
                        })
                        .catch(err => {
                          console.log(err);
                          this.setState({
                            showLoading: false,
                            loadingMessage: '',
                            loadingTitle: '',
                          });
                        });
                    },
                  },
                ],
              );
            }}>
            <ImageBackground
              style={{height: 120 * iconScale, width: 120 * iconScale}}
              source={require('../assets/flushIcon.png')}
            />
            <Text style={styles.iconText}>Flush Pumps</Text>
          </TouchableOpacity>
        </View>
        <Spacer height={70} />

        <Overlay
          isVisible={this.state.newBottleVisible}
          width={screenWidth / 1.3}
          height={265}
          overlayStyle={styles.overlay}>
          <>
            <View style={styles.backButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    newBottleVisible: false,
                    alcoholCheck: false,
                  });
                }}>
                <Icon name="back" size={33} type="antdesign" />
              </TouchableOpacity>
            </View>

            <Text style={styles.textStyle}>Add Bottle</Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 18, marginTop: 10}}>Bottle Name: </Text>
              <TextInput
                style={styles.textInput}
                maxLength={24}
                onChangeText={text => {
                  this.setState({
                    inputBottle: text,
                  });
                }}
              />
            </View>
            <Spacer height={10} />
            <CheckBox
              title="Is alcohol?"
              checked={this.state.alcoholCheck}
              containerStyle={{
                borderRadius: 10,
                backgroundColor: 'white',
              }}
              onPress={() => {
                this.setState({
                  alcoholCheck: !this.state.alcoholCheck,
                });
              }}
            />
            <Spacer height={20} />
            <Button
              title="Add Bottle"
              buttonStyle={styles.lightButtonStyle}
              onPress={() => {
                addNewBottle(
                  this.state.inputBottle,
                  this.state.alcoholCheck ? 'true' : 'false',
                ).then(res => {
                  console.log(res);
                  if (res === true) {
                    this.setState(
                      {
                        showLoading: false,
                      },
                      () => {
                        setTimeout(() => {
                          Alert.alert('Successfully added new bottle!');
                        }, 500);
                      },
                    );
                  }
                });
                this.setState({
                  newBottleVisible: false,
                  inputBottle: '',
                  alcoholCheck: false,
                  loadingMessage: 'BarBot is adding new bottle...',
                  loadingTitle: 'Adding New Bottle',
                  showLoading: true,
                });
              }}
            />
          </>
        </Overlay>

        <Overlay
          isVisible={this.state.newRecipeVisible}
          width={recipeOverlayWidth}
          height={recipeOverlayHeight}
          overlayStyle={styles.overlay}>
          <>
            <View style={styles.backButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    newRecipeVisible: false,
                    recipeName: '',
                    recipeIngredients: [],
                    recipeAmounts: [],
                    ingredientCount: 0,
                  });
                }}>
                <Icon name="back" size={33} type="antdesign" />
              </TouchableOpacity>
            </View>

            <Text style={styles.textStyle}>Add Recipe</Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 18, marginTop: 10}}>Cocktail Name: </Text>
              <TextInput
                style={styles.textInput}
                maxLength={24}
                onChangeText={text => {
                  this.setState({
                    recipeName: text,
                  });
                }}
              />
            </View>
            <Spacer height={15} />

            <EditIngredientsComponent
              recipeIngredients={this.state.recipeIngredients}
              recipeAmounts={this.state.recipeAmounts}
              saveRecipe={this.saveRecipe.bind(this)}
            />
          </>
        </Overlay>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Confirm Bottle Removal',
                'This will return all excess ingredients to their respective bottles. Are you sure you want to continue?',
                [
                  {
                    text: 'Cancel',
                    onPress: () =>
                      console.log('User canceled full bottle removal!'),
                    style: 'cancel',
                  },
                  {
                    text: 'Confirm',
                    onPress: () => {
                      console.log('Starting removal of all bottles...');
                      this.setState({
                        showLoading: true,
                        loadingMessage:
                          'Please wait while BarBot removes your bottles.',
                        loadingTitle: 'Removing Bottles',
                      });

                      removeAllBottles()
                        .then(response => {
                          if (response === 'true') {
                            this.props.navigation.state.params.resetBottles();
                            Alert.alert('Successfully removed all bottles!');
                          } else if (response === 'busy') {
                            Alert.alert(
                              'BarBot is busy right now! Try again soon.',
                            );
                          } else if (response === 'error') {
                            Alert.alert(
                              'There was an error trying to remove all bottles!',
                            );
                          } else {
                            Alert.alert('Failed to remove all bottles!');
                          }

                          this.setState({
                            showLoading: false,
                          });
                        })
                        .catch(err => {
                          console.log(err);
                          this.setState({showLoading: false});
                        });
                    },
                  },
                ],
              );
            }}>
            <ImageBackground
              style={{height: 120 * iconScale, width: 120 * iconScale}}
              source={require('../assets/removeAllIcon.png')}
            />
            <Text style={styles.iconText}>{'Remove\n All Bottles'}</Text>
          </TouchableOpacity>

          <Spacer width={buttonSpacing} />

          <TouchableOpacity
            disabled={false} //REMOVE WHEN FINISHED
            onPress={() => {
              this.props.navigation.navigate('EditRecipe');
            }}>
            <ImageBackground
              style={{
                height: 120 * iconScale,
                width: 120 * iconScale,
                marginLeft: 20,
              }}
              source={require('../assets/editRecipeIcon.png')}
            />
            <Text style={styles.iconText}>{'Manage Recipes'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default withNavigation(BarbotScreen);

const styles = StyleSheet.create({
  mainView: {
    alignItems: 'center',
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#617E8C',
  },

  headerText: {
    fontSize: 22,
    textDecorationLine: 'underline',
    paddingBottom: 10,
  },

  buttonStyle: {
    backgroundColor: '#3E525C',
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  lightButtonStyle: {
    borderRadius: 20,
    width: 175,
    backgroundColor: '#7295A6',
    alignSelf: 'center',
  },

  textStyle: {
    fontSize: 20,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  ingredientText: {
    fontSize: 16,
    textAlign: 'center',
  },

  subtext: {
    fontSize: 18,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  textInput: {
    height: 40,
    width: screenWidth / 2.5,
    borderColor: 'gray',
    borderWidth: 2,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 15,
    paddingHorizontal: 7,
  },

  overlay: {
    borderRadius: 20,
    backgroundColor: 'lightgray',
  },

  backButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },

  scrollContainer: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    maxHeight: 50,
  },

  buttonRow: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 90,
    alignContent: 'center',
  },

  iconText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
