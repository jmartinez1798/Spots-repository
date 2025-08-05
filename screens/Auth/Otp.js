import React, {useState, useEffect, useRef} from 'react';
import {
  BackHandler,
  Text,
  Keyboard,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {SafeArea, Loader} from '../../components';
import {Commons, Images, Fonts, Colors, Endpoints} from '../../utils';
import {useDispatch, useSelector} from 'react-redux';
import ApiService from '../../services/ApiService';
import {login} from '../../store/actions/AuthActions';
import messaging from '@react-native-firebase/messaging';

const Otp = props => {
  var pin1Ref = useRef(null);
  var pin2Ref = useRef(null);
  var pin3Ref = useRef(null);
  var pin4Ref = useRef(null);

  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [pin3, setPin3] = useState('');
  const [pin4, setPin4] = useState('');

  const disabledPin = {
    borderRadius: Commons.size(10),
    backgroundColor: 'transparent',
    borderColor: Colors.in_active,
    borderWidth: 1,
  };

  const enabledPin = {
    borderRadius: Commons.size(10),
    backgroundColor: Colors.active_pin,
    borderColor: Colors.secondary,
    borderWidth: 1,
  };

  const [pin1Focus, setPin1Focus] = useState(disabledPin);
  const [pin2Focus, setPin2Focus] = useState(disabledPin);
  const [pin3Focus, setPin3Focus] = useState(disabledPin);
  const [pin4Focus, setPin4Focus] = useState(disabledPin);

  const [showResend, setShowResend] = useState(false);
  const [showDesign, setShowDesign] = useState(false);
  const [visible, setVisible] = useState(false);

  const [refresh, setRefresh] = useState(null);
  const [countDown, setCountDown] = useState(60);
  const timerRef = useRef(countDown);

  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  var auth_type = props.route.params.auth_type;
  var number = props.route.params.number;
  var pin = user.authVerificationCode;
  var interval = null;

  var title =
    auth_type === 'sign_in'
      ? 'Login'
      : auth_type === 'change_number'
      ? 'Change Phone Number'
      : 'Create an account';

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    setPin1(pin.charAt(0));
    setPin2(pin.charAt(1));
    setPin3(pin.charAt(2));
    setPin4(pin.charAt(3));

    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let pinX = pin1 + pin2 + pin3 + pin4;
    if (pinX.length === 4) {
      Keyboard.dismiss();
      setVisible(true);
      setTimeout(() => {
        navigate(pinX);
      }, 1000);
    }
  }, [pin1, pin2, pin3, pin4]);

  useEffect(() => {
    if (!showResend && countDown !== 0) {
      interval = setInterval(() => {
        timerRef.current -= 1;
        if (timerRef.current < 0) {
          setShowResend(true);
          clearInterval(interval);
        } else {
          setCountDown(timerRef.current);
        }
      }, 1000);
    }
  }, [showResend]);

  async function navigate(pinX) {
    const body = {
      code: pinX,
    };
    if (auth_type === 'change_number') {
      await ApiService.patch(Endpoints.change_number_verify, body, user.token)
        .then(res => {
          Commons.toast('Number successfully changed. Kindly sign in again.');
          useDispatch(logout());
          navigateScreen('start');
        })
        .catch(err => {
          setVisible(false);
        });
    } else {
      await ApiService.patch(
        Endpoints.signup_verify,
        body,
        user.token,
        user._id,
      )
        .then(async res => {
          if (res.status) {
            let obj = res.data;
            let deviceToken;
            try {
              deviceToken = await messaging().getToken();
            } catch (err) {}
            await ApiService.patch(
              Endpoints.user,
              {
                deviceId: deviceToken,
              },
              user.token,
              user._id,
            )
              .then(res2 => {
                if (res2.status) {
                  if (auth_type === 'sign_up') {
                    dispatch(login(obj));
                    navigateScreen('profile_builder');
                  } else {
                    dispatch(login(obj));
                    if (obj.firstName) {
                      navigateScreen('dashboard');
                    } else {
                      navigateScreen('profile_builder');
                    }
                  }
                }
              })
              .catch(err => {
                console.log(err);
              });
          } else {
            Commons.toast(res.errCode);
          }
          setVisible(false);
        })
        .catch(err => {
          console.log(err);
          setVisible(false);
        });
    }
  }

  function navigateScreen(screen) {
    Commons.reset(props.navigation, screen);
  }

  function handleBackButtonClick() {
    props.navigation.goBack();
    return true;
  }

  function renderResend() {
    if (showResend) {
      return (
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: Colors.text_dark,
              fontSize: 16,
              fontFamily: Fonts.sans_regular,
            }}>
            Didn't receive code?
          </Text>
          <TouchableOpacity
            style={{marginHorizontal: 10}}
            onPress={() => {
              setShowResend(false);
              timerRef.current = 60;
              setCountDown(60);
            }}>
            <Text
              style={{
                alignSelf: 'center',
                fontSize: Commons.size(16),
                fontWeight: '400',
                color: Colors.secondary,
                fontFamily: Fonts.sans_medium,
              }}>
              Request Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: Colors.white,
              fontSize: Commons.size(16),
              fontFamily: Fonts.sans_regular,
            }}>
            Resend code in 00 : {countDown}
          </Text>
        </View>
      );
    }
  }

  return (
    <SafeArea
      statusBarTransculent={false}
      child={
        <View style={{flex: 1}}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              flex: 1,
              marginTop: Commons.size(20),
              paddingBottom: Commons.size(50),
            }}
            showVerticalScrollIndicator={false}>
            <View
              style={{
                flexDirection: 'row',
                width: Commons.width(0.9),
                alignSelf: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  handleBackButtonClick();
                }}>
                <Images.RoundBack fill={Colors.white} />
              </TouchableOpacity>

              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(20),
                  flex: 1,
                  color: Colors.white,
                  textAlign: 'center',
                  alignSelf: 'center',
                }}>
                {title}
              </Text>

              <Images.RoundBack fill={Colors.background} />
            </View>

            <Text
              style={{
                fontSize: Commons.size(28),
                fontWeight: '400',
                fontFamily: Fonts.sans_medium,
                color: Colors.white,
                marginTop: Commons.size(50),
                alignSelf: 'center',
                width: Commons.width(0.9),
              }}>
              Enter 4 digit code sent to Mobile Number
            </Text>

            <Text
              style={{
                fontSize: Commons.size(16),
                fontWeight: '400',
                fontFamily: Fonts.sans_regular,
                color: Colors.white_light,
                alignSelf: 'center',
                width: Commons.width(0.9),
              }}>
              We sent it to the number {number}
            </Text>

            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: Commons.size(30),
                paddingBottom: Commons.size(40),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  justifyContent: 'space-around',
                  width: Commons.width(0.9),
                }}>
                <View style={pin1Focus}>
                  <TextInput
                    style={{
                      width: Commons.width(0.18),
                      height: Commons.width(0.18),
                      fontSize: Commons.size(24),
                      textAlign: 'center',
                      color: Colors.primary,
                      fontFamily: Fonts.sans_medium,
                    }}
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    maxLength={1}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      pin2Ref.focus();
                    }}
                    onFocus={() => setPin1Focus(enabledPin)}
                    onBlur={() => {
                      if (pin1.length === 0) setPin1Focus(disabledPin);
                    }}
                    value={pin1}
                    onChangeText={text => {
                      if (text.length == 1) {
                        pin2Ref.focus();
                      }
                      setPin1(text);
                    }}
                    autoCorrect={false}
                    ref={ref => {
                      pin1Ref = ref;
                    }}
                  />
                </View>

                <View style={pin2Focus}>
                  <TextInput
                    style={{
                      width: Commons.width(0.18),
                      height: Commons.width(0.18),
                      fontSize: Commons.size(24),
                      textAlign: 'center',
                      color: Colors.primary,
                      fontFamily: Fonts.sans_medium,
                    }}
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    returnKeyType={'next'}
                    maxLength={1}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      pin3Ref.focus();
                    }}
                    onFocus={() => setPin2Focus(enabledPin)}
                    onBlur={() => {
                      if (pin2.length === 0) setPin2Focus(disabledPin);
                    }}
                    value={pin2}
                    onChangeText={text => {
                      if (text.length == 1) {
                        pin3Ref.focus();
                      }
                      setPin2(text);
                    }}
                    autoCorrect={false}
                    onKeyPress={({nativeEvent}) => {
                      if (nativeEvent.key === 'Backspace') pin1Ref.focus();
                    }}
                    ref={ref => {
                      pin2Ref = ref;
                    }}
                  />
                </View>

                <View style={pin3Focus}>
                  <TextInput
                    style={{
                      width: Commons.width(0.18),
                      height: Commons.width(0.18),
                      fontSize: Commons.size(24),
                      textAlign: 'center',
                      color: Colors.primary,
                      fontFamily: Fonts.sans_medium,
                    }}
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    maxLength={1}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      pin3Ref.focus();
                    }}
                    onFocus={() => setPin3Focus(enabledPin)}
                    onBlur={() => {
                      if (pin3.length === 0) setPin3Focus(disabledPin);
                    }}
                    value={pin3}
                    onChangeText={text => {
                      if (text.length == 1) {
                        pin4Ref.focus();
                      }
                      setPin2(text);
                    }}
                    autoCorrect={false}
                    onKeyPress={({nativeEvent}) => {
                      if (nativeEvent.key === 'Backspace') pin2Ref.focus();
                    }}
                    ref={ref => {
                      pin3Ref = ref;
                    }}
                  />
                </View>

                <View style={pin4Focus}>
                  <TextInput
                    style={{
                      width: Commons.width(0.18),
                      height: Commons.width(0.18),
                      fontSize: Commons.size(24),
                      textAlign: 'center',
                      color: Colors.primary,
                      fontFamily: Fonts.sans_medium,
                    }}
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    maxLength={1}
                    onFocus={() => setPin4Focus(enabledPin)}
                    onBlur={() => {
                      if (pin4.length === 0) setPin4Focus(disabledPin);
                    }}
                    value={pin4}
                    onChangeText={text => setPin4(text)}
                    autoCorrect={false}
                    onKeyPress={({nativeEvent}) => {
                      if (nativeEvent.key === 'Backspace') pin3Ref.focus();
                    }}
                    ref={ref => {
                      pin4Ref = ref;
                    }}
                  />
                </View>
              </View>
            </View>

            <View style={{flex: 1}} />

            {renderResend()}
          </ScrollView>
          <Loader visible={visible} />
        </View>
      }
    />
  );
};

export default Otp;
