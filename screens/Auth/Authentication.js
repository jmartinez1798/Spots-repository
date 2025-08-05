import React, {useState, useEffect, useRef} from 'react';
import {
  BackHandler,
  Text,
  Keyboard,
  View,
  Platform,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ToastAndroid,
  KeyboardAvoidingView,
  Image,
  Pressable,
  Button,
  TextInput,
} from 'react-native';
import {SafeArea, Loader} from '../../components';
import {Commons, Images, Fonts, Colors, Endpoints} from '../../utils';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import ApiService from '../../services/ApiService';
import {updateUser} from '../../store/actions/AuthActions';

const Authentication = props => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const [isBack, setIsBack] = useState(false);
  const [isEnabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [number, setNumber] = useState('');

  const [title, setTitle] = useState(
    props.route.params.auth_type === 'sign_in'
      ? 'Login'
      : props.route.params.auth_type === 'change_number'
      ? 'Change Phone Number'
      : 'Sign Up',
  );

  const [isChangeNumber, setChangeNumber] = useState(
    props.route.params.auth_type === 'change_number',
  );

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, []);

  useEffect(() => {
    if (!isBack && (number.length === 3 || number.length === 7))
      setNumber(number + ' ');
    else handleChange(number);
  }, [number]);

  useEffect(() => {
    if (visible) {
      process();
    }
  }, [visible]);

  const handleBackButtonClick = () => {
    props.navigation.goBack();
    return true;
  };

  const navigate = () => {
    Commons.navigate(props.navigation, 'otp', {
      auth_type: isChangeNumber
        ? 'change_number'
        : props.route.params.auth_type,
    });
  };

  const process = async () => {
    try {
      let body = {
        phoneNumber: '+92' + number.replace(/ /g, ''),
      };
      if (isChangeNumber) {
        await ApiService.post(Endpoints.change_number, body, user.token)
          .then(res => {
            dispatch(updateUser(res.data));
            setVisible(false);
            navigate();
          })
          .catch(err => {
            setVisible(false);
          });
      } else {
        await ApiService.post(Endpoints.user, body)
          .then(res => {
            dispatch(updateUser(res.data));
            setVisible(false);
            navigate();
          })
          .catch(err => {
            setVisible(false);
          });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = value => {
    if (value.replace(/ /g, '').length === 10) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      child={
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(20),
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
            Enter Your Mobile Number
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
            We’ll send you a confirmation code
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
              marginTop: Commons.size(10),
              alignSelf: 'center',
            }}>
            <Text
              style={{
                alignSelf: 'center',
                fontSize: Commons.size(28),
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
              }}>
              +92
            </Text>

            <TextInput
              style={{
                flex: 1,
                alignSelf: 'center',
                fontSize: Commons.size(28),
                marginTop: Commons.size(2),
                paddingHorizontal: Commons.size(10),
                color: Colors.white,
                fontFamily: Fonts.sans_regular,
              }}
              onKeyPress={({nativeEvent}) => {
                nativeEvent.key === 'Backspace'
                  ? setIsBack(true)
                  : setIsBack(false);
              }}
              keyboardType={'numeric'}
              maxLength={12}
              value={number}
              onChangeText={setNumber}
              autoCorrect={false}
              autoFocus={true}
              placeholder=""
              placeholderTextColor={Colors.white}
            />
          </View>

          <View style={{flex: 1}} />

          <TouchableOpacity
            onPress={() => setVisible(true)}
            activeOpacity={0.7}
            style={{
              borderRadius: Commons.size(10),
              overflow: 'hidden',
              marginBottom: Commons.size(35),
              alignSelf: 'center',
              backgroundColor: Colors.disabled,
            }}
            disabled={!isEnabled}>
            {isEnabled && (
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[Colors.start, Colors.end]}
                style={{
                  width: Commons.width(0.9),
                  height: Commons.size(50),
                  justifyContent: 'center',
                  paddingHorizontal: Commons.size(20),
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(18),
                    alignSelf: 'center',
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  Continue
                </Text>
              </LinearGradient>
            )}
            {!isEnabled && (
              <View
                style={{
                  width: Commons.width(0.9),
                  height: Commons.size(50),
                  justifyContent: 'center',
                  paddingHorizontal: Commons.size(20),
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(18),
                    alignSelf: 'center',
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  Continue
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Loader visible={visible} />
        </View>
      }
    />
  );
};

export default Authentication;
