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
import {SafeArea, Loader} from '../components';
import {Commons, Images, Fonts, Colors, Endpoints} from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import {updateUser} from '../store/actions/AuthActions';
import ApiService from '../services/ApiService';
import storage from '@react-native-firebase/storage';
import changeNavigationBarColor, {
  showNavigationBar,
} from 'react-native-navigation-bar-color';

export default function ProfileBuilder(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);

  const [avatar, setAvatar] = useState({
    uri: user && user.avatar ? user.avatar : '',
  });
  const [imageChanged, setImageChanged] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isEnabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const [fullName, setFullName] = useState(
    user && user.firstName ? user.firstName : '',
  );
  const [email, setEmail] = useState(user && user.email ? user.email : '');
  const [date, setDate] = useState(
    user && user.dob ? Commons.calculateDateFromObj(new Date(user.dob)) : '',
  );
  const [dateObj, setDateObj] = useState(
    user && user.dob ? new Date(user.dob) : new Date(Date.now()),
  );
  const [selectedGender, setSelectedGender] = useState(
    user && user.gender ? user.gender : '',
  );
  const [biography, setBiography] = useState(
    user && user.biography ? user.biography : '',
  );
  let isUpdate = props.route.params && props.route.params.isUpdate;
  let body = {};
  let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

  const changeNavColor = async () => {
    await changeNavigationBarColor(Colors.background, true);
  };

  useEffect(() => {
    changeNavColor();
    showNavigationBar();
  }, []);

  useEffect(() => {
    if (visible) {
      process();
    }
  }, [visible]);

  useEffect(() => {
    if (
      fullName.trim().length > 3 &&
      biography.trim().length > 3 &&
      date !== '' &&
      selectedGender !== '' &&
      reg.test(email) &&
      avatar.uri !== ''
    )
      setEnabled(true);
    else setEnabled(false);
  }, [fullName, date, selectedGender, email, avatar, biography]);

  const pickImages = async () => {
    await launchImageLibrary({
      mediaType: 'photo',
    })
      .then(async res => {
        await Commons.cropFile(res.assets[0].uri)
          .then(result => {
            let obj = {
              filename:
                result.modificationDate +
                result.path.substring(result.path.lastIndexOf('.')),
              uri: result.path,
              path: result.path,
            };
            setAvatar(obj);
            setImageChanged(true);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const process = () => {
    body = {
      firstName: fullName,
      gender: selectedGender,
      dob: dateObj.toISOString(),
      email: email,
      biography: biography,
    };
    if (imageChanged) uploadImage(body);
    else patchProfile();
  };

  const uploadImage = async body => {
    let {path, filename} = avatar;
    let uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path;
    await Commons.uploadToFirebase(uploadUri, filename)
      .then(async snapshot => {
        if (snapshot.state === 'success') {
          const url = await storage().ref(filename).getDownloadURL();
          body.avatar = url;
          patchProfile();
        }
      })
      .catch(error => {
        console.log(error);
        setVisible(false);
      });
  };

  const patchProfile = async () => {
    try {
      await ApiService.patch(Endpoints.user, body, user.token, user._id)
        .then(res => {
          ImagePicker.clean()
            .then(() => {
              dispatch(updateUser(res.data));
              if (isUpdate) {
                setVisible(false);
                props.navigation.goBack();
              } else {
                setVisible(false);
                Commons.reset(props.navigation, 'congrats');
              }
            })
            .catch(e => {
              console.log(e);
            });
        })
        .catch(err => {
          setVisible(false);
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      child={
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            marginTop: !isUpdate ? Commons.size(20) : 0,
          }}
          showVerticalScrollIndicator={false}>
          <View>
            {!isUpdate && (
              <View>
                <Text
                  style={{
                    width: Commons.width(0.9),
                    alignSelf: 'center',
                    fontSize: Commons.size(24),
                    color: Colors.white,
                    fontFamily: Fonts.sans_medium,
                  }}>
                  Set up your profile
                </Text>
                <Text
                  style={{
                    width: Commons.width(0.9),
                    fontSize: Commons.size(14),
                    alignSelf: 'center',
                    color: Colors.white_light,
                    fontFamily: Fonts.sans_regular,
                  }}>
                  Please fill in the details to set up your profile.
                </Text>
              </View>
            )}

            {isUpdate && (
              <View
                style={{
                  width: Commons.width(0.9),
                  marginTop: Commons.size(20),
                  alignSelf: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>
                  <Images.Back
                    stroke={Colors.white}
                    height={Commons.size(24)}
                    width={Commons.size(24)}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: Commons.size(16),
                    fontFamily: Fonts.sans_regular,
                    color: Colors.white,
                    fontWeight: '400',
                  }}>
                  Profile
                </Text>
                <Images.Back
                  height={Commons.size(24)}
                  width={Commons.size(24)}
                  stroke={'transparent'}
                />
              </View>
            )}

            <View
              style={{
                marginTop: Commons.size(30),
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: Commons.size(69),
                backgroundColor: Colors.avatar_bg,
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                onPress={
                  avatar.uri === ''
                    ? pickImages
                    : () => {
                        //   props.navigation.navigate('image_viewer', {
                        //     source: {uri: avatar.uri},
                        //   });
                      }
                }
                style={{
                  alignSelf: 'center',
                  height: Commons.size(138),
                  width: Commons.size(138),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: Commons.size(138),
                  backgroundColor: Colors.avatar_bg,
                  overflow: 'hidden',
                }}>
                {avatar.uri === '' && (
                  <Images.Avatar
                    height={Commons.size(60)}
                    width={Commons.size(60)}
                  />
                )}
                {avatar.uri !== '' && (
                  <Image
                    source={{uri: avatar.uri}}
                    style={{
                      height: Commons.size(138),
                      width: Commons.size(138),
                      resizeMode: 'cover',
                    }}
                  />
                )}
              </TouchableOpacity>
              {avatar.uri !== '' && (
                <TouchableOpacity
                  onPress={pickImages}
                  style={{
                    height: Commons.size(34),
                    width: Commons.size(34),
                    borderRadius: Commons.size(17),
                    overflow: 'hidden',
                    backgroundColor: Colors.primary,
                    alignSelf: 'flex-start',
                    alignItems: 'center',
                    justifyContent: 'center',
                    right: -1 * Commons.size(3),
                    top: Commons.size(3),
                    position: 'absolute',
                  }}>
                  <Images.Edit
                    height={Commons.size(16)}
                    width={Commons.size(16)}
                  />
                </TouchableOpacity>
              )}
            </View>

            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(20),
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(16),
                color: Colors.white,
                marginBottom: Commons.size(5),
              }}>
              Full Name
            </Text>
            <TextInput
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(5),
                borderRadius: Commons.size(10),
                borderWidth: 1,
                borderColor:
                  fullName.trim().length > 3
                    ? Colors.primary
                    : Colors.white_light,
                fontSize: Commons.size(16),
                paddingHorizontal: Commons.size(10),
                color: Colors.white,
                fontFamily: Fonts.sans_regular,
              }}
              value={fullName}
              onChangeText={setFullName}
              returnKeyType={'done'}
            />

            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(20),
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(16),
                  color: Colors.white,
                  marginRight: Commons.size(10),
                }}>
                Date of Birth
              </Text>
              <Images.Info height={Commons.size(18)} width={Commons.size(18)} />
            </View>
            <DatePicker
              modal
              mode="date"
              maximumDate={new Date(Date.now())}
              textColor={Colors.primary}
              open={showPicker}
              date={dateObj}
              onConfirm={date => {
                dateToSend = date.toISOString();
                let strDate =
                  (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
                  '-' +
                  (date.getMonth() > 8
                    ? date.getMonth() + 1
                    : '0' + (date.getMonth() + 1)) +
                  '-' +
                  date.getFullYear();
                const currentDate = strDate || date;

                setDate(currentDate);
                setShowPicker(false);
                setDateObj(date);
              }}
              onCancel={() => {
                setShowPicker(false);
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setShowPicker(true);
              }}
              style={{
                flexDirection: 'row',
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(5),
                borderRadius: Commons.size(10),
                borderWidth: 1,
                borderColor: date !== '' ? Colors.primary : Colors.white_light,
                paddingHorizontal: Commons.size(10),
              }}>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: Commons.size(16),
                  color: Colors.white,
                  fontFamily: Fonts.sans_regular,
                }}
                onFocus={() => {
                  setShowPicker(true);
                }}
                editable={false}
                value={date}
                onChangeText={text => handleChange()}
                maxLength={15}
                returnKeyType={'done'}
              />
              <TouchableOpacity
                style={{justifyContent: 'center'}}
                onPress={() => {
                  setShowPicker(true);
                }}>
                <Images.Calendar
                  fill={date !== '' ? Colors.primary : Colors.white_light}
                  height={Commons.size(25)}
                  width={Commons.size(25)}
                />
              </TouchableOpacity>
            </TouchableOpacity>

            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(20),
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(16),
                color: Colors.white,
                marginBottom: Commons.size(5),
              }}>
              Gender*
            </Text>
            <View
              style={{
                flex: 1,
                width: Commons.width(0.9),
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.48,
                  backgroundColor: 'transparent',
                  borderRadius: Commons.size(7),
                  borderWidth: 1,
                  borderColor:
                    selectedGender === 'male'
                      ? 'transparent'
                      : Colors.white_light,
                  overflow: 'hidden',
                }}
                onPress={() => setSelectedGender('male')}>
                {selectedGender === 'male' && (
                  <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    colors={[Colors.start, Colors.end]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: Commons.size(10),
                      }}>
                      <Images.Male
                        fill={
                          selectedGender === 'male'
                            ? Colors.white
                            : Colors.white_light
                        }
                      />
                      <Text
                        style={{
                          fontSize: Commons.size(14),
                          fontFamily: Fonts.sans_regular,
                          marginLeft: Commons.size(7),
                          color:
                            selectedGender === 'male'
                              ? Colors.white
                              : Colors.white_light,
                        }}>
                        Male
                      </Text>
                    </View>
                  </LinearGradient>
                )}
                {selectedGender !== 'male' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: Commons.size(10),
                    }}>
                    <Images.Male
                      fill={
                        selectedGender === 'male'
                          ? Colors.white
                          : Colors.white_light
                      }
                    />
                    <Text
                      style={{
                        fontSize: Commons.size(14),
                        fontFamily: Fonts.sans_regular,
                        marginLeft: Commons.size(7),
                        color:
                          selectedGender === 'male'
                            ? Colors.white
                            : Colors.white_light,
                      }}>
                      Male
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 0.48,
                  backgroundColor: 'transparent',
                  borderRadius: Commons.size(7),
                  borderWidth: 1,
                  borderColor:
                    selectedGender === 'female'
                      ? 'transparent'
                      : Colors.white_light,
                  overflow: 'hidden',
                }}
                onPress={() => setSelectedGender('female')}>
                {selectedGender === 'female' && (
                  <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    colors={[Colors.start, Colors.end]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: Commons.size(10),
                      }}>
                      <Images.Female
                        fill={
                          selectedGender === 'female'
                            ? Colors.white
                            : Colors.white_light
                        }
                      />
                      <Text
                        style={{
                          fontSize: Commons.size(14),
                          fontFamily: Fonts.sans_regular,
                          marginLeft: Commons.size(7),
                          color:
                            selectedGender === 'female'
                              ? Colors.white
                              : Colors.white_light,
                        }}>
                        Female
                      </Text>
                    </View>
                  </LinearGradient>
                )}
                {selectedGender !== 'female' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: Commons.size(10),
                    }}>
                    <Images.Female
                      fill={
                        selectedGender === 'female'
                          ? Colors.white
                          : Colors.white_light
                      }
                    />
                    <Text
                      style={{
                        fontSize: Commons.size(14),
                        fontFamily: Fonts.sans_regular,
                        marginLeft: Commons.size(7),
                        color:
                          selectedGender === 'female'
                            ? Colors.white
                            : Colors.white_light,
                      }}>
                      Female
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(20),
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(16),
                color: Colors.white,
                marginBottom: Commons.size(5),
              }}>
              Email Address*
            </Text>
            <TextInput
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(5),
                borderRadius: Commons.size(10),
                borderWidth: 1,
                borderColor: reg.test(email)
                  ? Colors.primary
                  : Colors.white_light,
                fontSize: Commons.size(16),
                paddingHorizontal: Commons.size(10),
                color: Colors.white,
                fontFamily: Fonts.sans_regular,
              }}
              maxLength={35}
              keyboardType={'email-address'}
              autoCapitalize={'none'}
              value={email}
              onChangeText={setEmail}
              returnKeyType={'done'}
            />

            <Text
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                marginTop: Commons.size(20),
                fontFamily: Fonts.sans_medium,
                fontSize: Commons.size(16),
                color: Colors.white,
                marginBottom: Commons.size(5),
              }}>
              Biography*
            </Text>
            <TextInput
              style={{
                width: Commons.width(0.9),
                textAlignVertical: 'top',
                height: Commons.size(120),
                alignSelf: 'center',
                marginTop: Commons.size(5),
                borderRadius: Commons.size(10),
                borderWidth: 1,
                borderColor:
                  biography.trim().length > 3
                    ? Colors.primary
                    : Colors.white_light,
                fontSize: Commons.size(16),
                paddingHorizontal: Commons.size(10),
                color: Colors.white,
                fontFamily: Fonts.sans_regular,
              }}
              maxLength={250}
              autoCapitalize={'sentences'}
              value={biography}
              onChangeText={setBiography}
              returnKeyType={'done'}
            />

            <TouchableOpacity
              onPress={() => setVisible(true)}
              activeOpacity={0.7}
              style={{
                marginTop: Commons.size(35),
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
                    Submit
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
                    {isUpdate ? 'Update Profile' : 'Submit'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Loader visible={visible} />
        </ScrollView>
      }
    />
  );
}
