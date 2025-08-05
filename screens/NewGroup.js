import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import {SafeArea, MemberList, Loader} from '../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import ApiService from '../services/ApiService';
import {useSelector} from 'react-redux';
import storage from '@react-native-firebase/storage';

export default function NewGroup(props) {
  const {user} = useSelector(state => state.authReducer);
  const [avatar, setAvatar] = useState({uri: ''});
  const [fullName, setFullName] = useState('');
  const [isEnabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [members, setMembers] = useState(props.route?.params?.members);

  useEffect(() => {
    if (fullName.trim().length > 3 && avatar.uri !== '') setEnabled(true);
    else setEnabled(false);
  }, [fullName, avatar]);

  const uploadMedia = async () => {
    setVisible(true);
    let {path, filename} = avatar;
    let uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path;
    await Commons.uploadToFirebase(uploadUri, filename)
      .then(async snapshot => {
        if (snapshot.state === 'success') {
          const url = await storage().ref(filename).getDownloadURL();
          createGroup(url);
        }
      })
      .catch(error => {
        console.log(error);
        setVisible(false);
        Commons.toast('Uploading Error');
      });
  };

  const createGroup = async url => {
    let membersToAdd = [user._id];
    members.map(item => {
      membersToAdd.push(item._id);
    });

    let body = {
      users: membersToAdd,
      name: fullName,
      image: url,
    };
    await ApiService.post(Endpoints.groups, body, user.token)
      .then(res => {
        props.navigation.pop(2);
        chats.push(res.data);
        dispatch(updateChats());
      })
      .catch(err => {
        setVisible(false);
        console.log(err);
      });
  };

  const pickImages = async () => {
    await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
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
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.tab_bar}
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
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  color: Colors.light_grey,
                  fontSize: Commons.size(16),
                  fontWeight: '400',
                }}>
                Cancel
              </Text>
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
              Create a group
            </Text>
            <Text
              style={{
                fontFamily: Fonts.sans_regular,
                color: 'transparent',
                fontSize: Commons.size(16),
                fontWeight: '400',
              }}>
              Cancel
            </Text>
          </View>

          <View
            style={{
              marginTop: Commons.size(42),
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
                <Images.GroupAvatar
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
            Title
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
            Group Members
          </Text>
          <View
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
            }}>
            <MemberList
              data={members}
              removeMemeber={index => {
                if (index > -1) {
                  members.splice(index, 1);
                  setMembers(members);
                }
              }}
            />

            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[Colors.start, Colors.end]}
                style={{
                  width: Commons.size(48),
                  height: Commons.size(48),
                  borderRadius: Commons.size(24),
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: Commons.size(20),
                }}>
                <Images.Plus stroke={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{flex: 1}} />

          <TouchableOpacity
            // onPress={() => props.navigation.pop(2)}
            onPress={() => uploadMedia()}
            activeOpacity={0.7}
            style={{
              borderRadius: Commons.size(10),
              overflow: 'hidden',
              marginVertical: Commons.size(35),
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
                  Create Group
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
                  Create Group
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Loader visible={visible} />
        </View>
      }
    />
  );
}
