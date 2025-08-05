import React, {useState, useEffect} from 'react';
import {Text, View, TouchableOpacity, TextInput, Image} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import {SafeArea, FollowerList, Loader} from '../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import moment from 'moment/moment';
import Geocoder from 'react-native-geocoding';
import {MAPS_API_KEY} from '@env';
import LocationEnabler from 'react-native-location-enabler';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import ApiService from '../services/ApiService';

export default function CreatePoll(props) {
  const {user} = useSelector(state => state.authReducer);
  const [isEnabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState([]);
  const [pollLength, setPollLength] = useState({
    days: 0,
    hours: 0,
  });

  useEffect(() => {
    let isChoicesEnabled = choices.length > 1 ? true : false;
    for (let choice of choices) {
      if (choice.trim().length === 0) {
        isChoicesEnabled = false;
        break;
      }
    }
    if (
      question.trim().length > 0 &&
      (pollLength.days > 0 || pollLength.hours > 0) &&
      isChoicesEnabled
    ) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [pollLength, choices, question]);

  const createPoll = async () => {
    setLoading(true);
    await ApiService.post(
      Endpoints.poll,
      {
        question: question,
        choices: choices,
        length: pollLength,
      },
      user.token,
    )
      .then(res => {
        props.route.params.onPollCreated(res.data);
        props.navigation.goBack();
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.background}
      child={
        <View style={{flex: 1}}>
          <View
            style={{
              marginTop: Commons.size(20),
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
            }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
              style={{width: Commons.size(60)}}>
              <Images.Close stroke={Colors.white} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
                fontSize: Commons.size(18),
                fontWeight: '400',
                textAlign: 'center',
              }}>
              Create Poll
            </Text>
            <TouchableOpacity
              onPress={() => {
                // props.navigation.goBack();
                createPoll();
              }}
              disabled={!isEnabled}>
              {isEnabled && (
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    width: Commons.size(60),
                    height: Commons.size(25),
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: Commons.size(6),
                    backgroundColor: Colors.avatar_bg,
                  }}>
                  <Text
                    style={{
                      fontSize: Commons.size(14),
                      fontFamily: Fonts.sans_regular,
                      fontWeight: '400',
                      color: Colors.white,
                    }}>
                    Create
                  </Text>
                </LinearGradient>
              )}
              {!isEnabled && (
                <View
                  style={{
                    width: Commons.size(60),
                    height: Commons.size(25),
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: Commons.size(6),
                    backgroundColor: Colors.avatar_bg,
                  }}>
                  <Text
                    style={{
                      fontSize: Commons.size(14),
                      fontFamily: Fonts.sans_regular,
                      fontWeight: '400',
                      color: Colors.white_light,
                    }}>
                    Create
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              width: Commons.width(0.9),
              alignSelf: 'center',
              alignItems: 'center',
              marginTop: Commons.size(25),
            }}>
            <View
              style={{
                height: Commons.size(50),
                width: Commons.size(50),
                borderRadius: Commons.size(25),
                overflow: 'hidden',
              }}>
              <Image
                source={{uri: user.avatar}}
                style={{height: Commons.size(50), width: Commons.size(50)}}
              />
            </View>

            <Text
              style={{
                flex: 1,
                marginHorizontal: Commons.size(10),
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
                fontSize: Commons.size(16),
                fontWeight: '400',
              }}>
              {user.firstName}
            </Text>
          </View>

          <TextInput
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              fontFamily: Fonts.sans_regular,
              color: Colors.white,
              marginTop: Commons.size(5),
              fontSize: Commons.size(14),
              fontWeight: '400',
            }}
            value={question}
            onChangeText={setQuestion}
            returnKeyType={'done'}
            placeholder={'Ask a question'}
            placeholderTextColor={Colors.white_light}
          />

          <ScrollView
            style={{flexGrow: 0}}
            contentContainerStyle={{
              width: Commons.width(0.9),
              alignSelf: 'center',
            }}>
            {choices.map((item, index) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: Commons.size(10),
                  }}>
                  <TextInput
                    key={index}
                    style={{
                      flex: 1,
                      width: Commons.width(0.9),
                      marginRight: Commons.size(10),
                      borderRadius: Commons.size(10),
                      borderWidth: 1,
                      borderColor:
                        item.trim().length > 0
                          ? Colors.primary
                          : Colors.white_light,
                      fontSize: Commons.size(16),
                      paddingHorizontal: Commons.size(10),
                      color: Colors.white,
                      fontFamily: Fonts.sans_regular,
                    }}
                    value={item}
                    onChangeText={text => {
                      choices[index] = text;
                      setChoices([...choices]);
                    }}
                    placeholder={`Choice ${index + 1}`}
                    placeholderTextColor={Colors.white_light}
                    returnKeyType={
                      index !== choices.length - 1 ? 'next' : 'done'
                    }
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setChoices(
                        choices.filter(c => choices.indexOf(c) !== index),
                      );
                    }}>
                    <Images.Close
                      height={Commons.size(25)}
                      width={Commons.size(25)}
                      stroke={Colors.white}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Commons.size(10),
              }}>
              <TextInput
                style={{
                  flex: 1,
                  width: Commons.width(0.9),
                  borderRadius: Commons.size(10),
                  borderWidth: 1,
                  borderColor: Colors.white_light,
                  fontSize: Commons.size(16),
                  paddingHorizontal: Commons.size(10),
                  color: Colors.white,
                  fontFamily: Fonts.sans_regular,
                  marginRight: Commons.size(10),
                }}
                editable={false}
                placeholder={`Add choice`}
                placeholderTextColor={Colors.white_light}
              />
              <TouchableOpacity
                onPress={() => {
                  setChoices([...choices, '']);
                }}>
                <Images.Plus
                  height={Commons.size(25)}
                  width={Commons.size(25)}
                  stroke={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={() =>
              Commons.navigate(props.navigation, 'poll_length', {
                setLength: val => {
                  setPollLength(val);
                },
              })
            }
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(10),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.tab_bar,
              padding: Commons.size(10),
              borderRadius: Commons.size(10),
            }}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white_light,
                  fontSize: Commons.size(12),
                  fontWeight: '400',
                }}>
                Poll Length
              </Text>

              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontSize: Commons.size(14),
                  fontWeight: '500',
                }}>
                {pollLength.days > 0 ? `${pollLength.days} Days ` : ''}
                {pollLength.hours > 0 ? `${pollLength.hours} Hours ` : ''}
              </Text>
            </View>

            <Images.ChevronForward />
          </TouchableOpacity>

          <Loader visible={loading} />
        </View>
      }
    />
  );
}
