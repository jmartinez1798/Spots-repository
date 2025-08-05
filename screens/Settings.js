import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Switch,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import {SafeArea, ChatList} from '../components';
import {Colors, Images, Fonts, Commons} from '../utils';
import {logout} from '../store/actions/AuthActions';
import {updateStories, updateMineStories} from '../store/actions/StoryActions';
import {updatePosts} from '../store/actions/PostActions';
import {updateSpots} from '../store/actions/SpotActions';
import {updateEvents} from '../store/actions/EventActions';
import {updateChats} from '../store/actions/ChatActions';
import {useDispatch} from 'react-redux';

export default function Settings(props) {
  const dispatch = useDispatch();
  const [isNotification, setNotification] = useState(false);

  return (
    <SafeArea
      statusBarTransculent={false}
      child={
        <View style={{flex: 1}}>
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
              Settings
            </Text>
            <Images.Back
              height={Commons.size(24)}
              width={Commons.size(24)}
              stroke={'transparent'}
            />
          </View>

          <View
            style={{
              flex: 1,
              width: Commons.width(0.9),
              marginTop: Commons.size(30),
              alignSelf: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('auth', {
                  auth_type: 'change_number',
                  user: null,
                });
              }}
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                  fontSize: Commons.size(16),
                }}>
                Change phone number
              </Text>

              <Images.ChevronForward
                height={Commons.size(24)}
                width={Commons.size(24)}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                marginTop: Commons.size(20),
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                  fontSize: Commons.size(16),
                }}>
                Push notifications
              </Text>

              <Switch
                trackColor={{false: '#E9E9EA', true: Colors.primary}}
                thumbColor={Colors.white}
                ios_backgroundColor="#E9E9EA"
                onValueChange={state => setNotification(!isNotification)}
                value={isNotification}
              />
            </TouchableOpacity>

            <Text
              style={{
                fontFamily: Fonts.sans_medium,
                color: Colors.primary,
                fontWeight: '400',
                marginTop: Commons.size(40),
                fontSize: Commons.size(16),
              }}>
              More
            </Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('privacy_policy')}
              style={{
                flexDirection: 'row',
                marginTop: Commons.size(20),
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                  fontSize: Commons.size(16),
                }}>
                About us
              </Text>

              <Images.ChevronForward
                height={Commons.size(24)}
                width={Commons.size(24)}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => props.navigation.navigate('privacy_policy')}
              style={{
                flexDirection: 'row',
                marginTop: Commons.size(20),
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                  fontSize: Commons.size(16),
                }}>
                Privacy Policy
              </Text>

              <Images.ChevronForward
                height={Commons.size(24)}
                width={Commons.size(24)}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => props.navigation.navigate('terms_n_conditions')}
              style={{
                flexDirection: 'row',
                marginTop: Commons.size(20),
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                  fontSize: Commons.size(16),
                }}>
                Terms &amp; Conditions
              </Text>

              <Images.ChevronForward
                height={Commons.size(24)}
                width={Commons.size(24)}
              />
            </TouchableOpacity>

            <View style={{flex: 1}} />

            <TouchableOpacity
              onPress={() => {
                dispatch(logout());
                dispatch(updateMineStories([]));
                dispatch(updateStories([]));
                dispatch(updateChats([]));
                dispatch(updateEvents([]));
                dispatch(updatePosts([]));
                dispatch(updateSpots([]));
                Commons.reset(props.navigation, 'start');
              }}
              style={{
                flexDirection: 'row',
                marginVertical: Commons.size(20),
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: Fonts.sans_regular,
                  color: Colors.primary,
                  fontWeight: '400',
                  fontSize: Commons.size(16),
                }}>
                Logout
              </Text>

              <Image
                source={Images.logout}
                style={{width: Commons.size(24), height: Commons.size(24)}}
              />
              {/* <Images.ChevronForward
                height={Commons.size(24)}
                width={Commons.size(24)}
              /> */}
            </TouchableOpacity>
          </View>
        </View>
      }
    />
  );
}
