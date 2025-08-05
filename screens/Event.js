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
import {SafeArea, MessageList} from '../components';
import {Commons, Images, Fonts, Colors} from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import Modal from 'react-native-modal';

export default function Event(props) {
  const [visible, setVisible] = useState(false);

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.tab_bar}
      child={
        <View style={{flex: 1, backgroundColor: Colors.background}}>
          <View
            style={{
              padding: Commons.size(15),
              backgroundColor: Colors.tab_bar,
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
                fontSize: Commons.size(18),
                fontFamily: Fonts.sans_regular,
                color: Colors.white,
                fontWeight: '500',
              }}>
              Event
            </Text>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <Images.Invoice
                height={Commons.size(24)}
                width={Commons.size(24)}
              />
            </TouchableOpacity>
          </View>

          <View style={{flex: 1}}>
            <MessageList data={[]} />
          </View>

          <View
            style={{
              backgroundColor: Colors.background,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              padding: Commons.size(15),
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                borderWidth: 1,
                paddingHorizontal: Commons.size(15),
                alignItems: 'center',
                borderColor: Colors.light_grey,
                borderRadius: Commons.size(100),
                height: Commons.size(50),
              }}>
              <TextInput
                style={{
                  flex: 1,
                  color: Colors.white,
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                }}
                placeholder={'Write a message...'}
                placeholderTextColor={Colors.white_light}
              />

              <TouchableOpacity
                onPress={() => {
                  Commons.navigate(props.navigation, 'create_poll');
                }}>
                <Images.Poll />
              </TouchableOpacity>
            </View>

            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[Colors.start, Colors.end]}
              style={{
                width: Commons.size(50),
                height: Commons.size(50),
                marginLeft: Commons.size(15),
                borderRadius: Commons.size(25),
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Images.Send height={Commons.size(25)} width={Commons.size(25)} />
            </LinearGradient>
          </View>

          <Modal
            statusBarTranslucent={true}
            isVisible={visible}
            backdropColor={Colors.white_light}
            backdropOpacity={0.5}
            onBackdropPress={() => {
              setVisible(false);
            }}
            onBackButtonPress={() => {
              setVisible(false);
            }}>
            <View
              style={{
                borderRadius: Commons.size(15),
                backgroundColor: Colors.background,
                padding: Commons.width(0.05),
                overflow: 'hidden',
              }}>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={{alignSelf: 'flex-end'}}>
                <Images.Close
                  height={Commons.size(30)}
                  width={Commons.size(30)}
                  stroke={Colors.light_grey}
                />
              </TouchableOpacity>

              <Image
                source={Images.qr}
                style={{
                  height: Commons.width(0.75),
                  width: Commons.width(0.75),
                  marginVertical: Commons.size(20),
                  borderRadius: Commons.size(5),
                  alignSelf: 'center',
                }}
              />

              <TouchableOpacity
                onPress={() => setVisible(false)}
                activeOpacity={0.7}
                style={{
                  borderRadius: Commons.size(10),
                  overflow: 'hidden',
                  marginBottom: Commons.size(35),
                  alignSelf: 'center',
                  backgroundColor: Colors.disabled,
                }}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    width: Commons.width(0.75),
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
                    Close
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      }
    />
  );
}
