import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import {SafeArea, ChatList} from '../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import ApiService from '../services/ApiService';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {updateChats} from '../store/actions/ChatActions';
import storage from '@react-native-firebase/storage';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import Modal from 'react-native-modal';

export default function Chat(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const {chats} = useSelector(state => state.chatReducer);
  var msgRef = useRef(null);
  var chatRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [chat, setChat] = useState(
    props.route.params.chat_id
      ? chats.find(c => c._id === props.route.params.chat_id)
      : null,
  );
  const userId = props.route?.params?.user;
  const [newItemAdded, setNewItemAdded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    if (chat && chat.messages.length > 0) {
      chatRef.current.scrollToIndex({
        animated: true,
        index: chat.messages.length - 1,
      });
    }
  }, [chat]);

  useEffect(() => {
    if (poll) {
      processCommentOnPost(null);
    }
  }, [poll]);

  const onPollCreated = val => {
    setPoll(val);
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
            // if (chat) {
            //   let index = chats.indexOf(chat);
            //   if (!chats[index].messages) chats[index].messages = [];
            //   chats[index].messages.push({
            //     type: 'image',
            //     user: user,
            //     image: obj.path,
            //     createdAt: new Date().toISOString(),
            //   });
            //   dispatch(updateChats(chats));
            //   chatRef.current.scrollToIndex({
            //     animated: true,
            //     index: chat.messages.length - 1,
            //   });
            // } else {
            //   createChat();
            // }

            uploadMedia(obj);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const uploadMedia = async obj => {
    let {path, filename} = obj;
    let uploadUri = Platform.OS === 'ios' ? path.replace('file://', '') : path;
    await Commons.uploadToFirebase(uploadUri, filename)
      .then(async snapshot => {
        if (snapshot.state === 'success') {
          const url = await storage().ref(filename).getDownloadURL();
          processCommentOnPost(url);
        }
      })
      .catch(error => {
        console.log(error);
        Commons.toast('Uploading Error');
        // let index = chats.indexOf(chat);
        // if (chats[index].messages && chats[index].messages.length > 0) {
        //   chats[index].messages.splice(chats[index].messages.length - 1, 1);
        //   dispatch(updateChats(chats));
        //   chatRef.current.scrollToIndex({
        //     animated: true,
        //     index: chat.messages.length - 1,
        //   });
        // }
      });
  };

  const Item = ({item, index}) => {
    let me = user;
    let id = item.user._id ? item.user._id : item.user;
    return (
      <View
        style={{
          margin: Commons.size(10),
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: id === me._id ? 'flex-end' : 'flex-start',
          }}>
          {chat &&
            typeof chat === 'object' &&
            chat.type === 'group' &&
            id !== me._id && (
              <Image
                source={{uri: item.user.avatar}}
                style={{
                  height: Commons.size(40),
                  width: Commons.size(40),
                  borderRadius: Commons.size(20),
                  resizeMode: 'cover',
                  marginRight: Commons.size(10),
                }}
              />
            )}
          <View
            style={{
              padding: item.type === 'text' ? Commons.size(7) : 0,
              maxWidth: '85%',
              minWidth: '35%',
              backgroundColor: id === me._id ? Colors.white : Colors.secondary,
              borderRadius: Commons.size(7),
            }}>
            {item.type === 'text' && (
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(14),
                  color: id === me._id ? Colors.black : Colors.white,
                }}>
                {item.type === 'text' ? item.text : ''}
              </Text>
            )}

            {item.type === 'image' && (
              <Image
                source={{uri: item.url}}
                style={{
                  height: Commons.size(160),
                  width: Commons.size(160),
                  resizeMode: 'cover',
                  borderRadius: Commons.size(5),
                }}
              />
            )}

            {item.type === 'poll' && (
              <View style={{padding: Commons.size(7)}}>
                <Text
                  style={{
                    color: Colors.black,
                    fontFamily: Fonts.gilroy_medium,
                    fontSize: Commons.size(22),
                  }}>
                  Poll
                </Text>

                <Text
                  style={{
                    color: Colors.black,
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(15),
                    marginTop: Commons.size(10),
                  }}>
                  {item.poll.question}
                </Text>

                {item.poll.choices.map((item, index) => {
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: Commons.size(5),
                      }}>
                      <TouchableOpacity
                        style={{
                          height: Commons.size(12),
                          width: Commons.size(12),
                          borderRadius: Commons.size(6),
                          borderColor: Colors.disabled,
                          borderWidth: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: Commons.size(5),
                        }}>
                        <TouchableOpacity
                          style={{
                            height: Commons.size(6),
                            width: Commons.size(6),
                            borderRadius: Commons.size(3),
                            backgroundColor: Colors.disabled,
                          }}
                        />
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontFamily: Fonts.sans_regular,
                          color: Colors.black,
                          fontSize: Commons.size(12),
                        }}>
                        {item}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
        <Text
          style={{
            fontFamily: Fonts.sans_medium,
            color: Colors.white_light,
            alignSelf: id === me._id ? 'flex-end' : 'flex-start',
            fontSize: Commons.size(11),
            marginTop: Commons.size(5),
          }}>
          {moment(item.createdAt).format('h:mm a-DD/MM')}
        </Text>
      </View>
    );
  };

  const createChat = async msg => {
    await ApiService.post(
      Endpoints.chats,
      {
        type: 'direct',
        users: [user._id, userId._id],
      },
      user.token,
    )
      .then(async res => {
        let body = {
          type: !msg.includes('firebasestorage') ? 'text' : 'image',
          url: msg.includes('firebasestorage') ? msg : null,
          text: !msg.includes('firebasestorage') ? msg : null,
          chatId: res.data._id,
        };
        await ApiService.post(Endpoints.messages, body, user.token)
          .then(async res2 => {
            await ApiService.get(Endpoints.chats, user.token, res.data._id)
              .then(async res3 => {
                setChat(res3.data);
                chats.push(res3.data);
                dispatch(updateChats(chats));
              })
              .catch(err3 => {
                console.log(err3);
              });
          })
          .catch(err2 => {
            console.log(err2);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const processCommentOnPost = async msg => {
    // if (!msg.includes('firebasestorage')) {
    //   if (chat) {
    //     let index = chats.indexOf(chat);
    //     if (!chats[index].messages) chats[index].messages = [];
    //     chats[index].messages.push({
    //       type: 'text',
    //       user: user,
    //       text: msg,
    //       createdAt: new Date().toISOString(),
    //     });
    //     dispatch(updateChats(chats));
    //     chatRef.current.scrollToIndex({
    //       animated: true,
    //       index: chat.messages.length - 1,
    //     });
    //   } else createChat();
    // }

    if (!chat) {
      createChat(msg);
    } else {
      let body = {
        type: poll
          ? 'poll'
          : !msg.includes('firebasestorage')
          ? 'text'
          : 'image',
        url: poll ? null : msg.includes('firebasestorage') ? msg : null,
        text: poll ? null : !msg.includes('firebasestorage') ? msg : null,
        poll: poll ? poll : null,
        chatId: chat._id,
      };
      await ApiService.post(Endpoints.messages, body, user.token)
        .then(async res => {
          await ApiService.get(Endpoints.chats, user.token, chat._id)
            .then(async res2 => {
              setChat(res2.data);
              let index = chats.indexOf(chats.find(c => c._id === chat._id));
              chats[index] = res2.data;
              dispatch(updateChats(chats));
            })
            .catch(err3 => {
              console.log(err3);
            });
        })
        .catch(err => {
          console.log(err);
          Commons.toast('Message sending error');
          // let index = chats.indexOf(post);
          // if (chats[index].messages && chats[index].messages.length > 0) {
          //   chats[index].messages.splice(chats[index].messages.length - 1, 1);
          //   dispatch(updateChats(chats));
          //   chatRef.current.scrollToIndex({
          //     animated: true,
          //     index: chat.messages.length - 1,
          //   });
          // }
        });
    }
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      StatusBarColor={Colors.tab_bar}
      child={
        <View style={{flex: 1}}>
          <View
            style={{
              padding: Commons.width(0.05),
              flexDirection: 'row',
              backgroundColor: Colors.tab_bar,
              alignItems: 'center',
            }}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Images.ChevronBack
                height={Commons.size(22)}
                width={Commons.size(13)}
              />
            </TouchableOpacity>

            <View
              style={{
                marginLeft: Commons.size(19),
                marginRight: Commons.size(8),
              }}>
              <TouchableOpacity
                onPress={() => {
                  if (chat && chat.type === 'direct') {
                    Commons.navigate(props.navigation, 'profileX', {
                      otherUser: chat.users.find(u => u._id !== user._id),
                    });
                  }
                }}>
                <Image
                  source={{
                    uri: chat
                      ? chat.type === 'direct'
                        ? chat.users.find(u => u._id !== user._id).avatar
                        : chat.group.image
                      : userId.avatar,
                  }}
                  style={{
                    height: Commons.size(32),
                    width: Commons.size(32),
                    borderRadius: Commons.size(16),
                  }}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                flex: 1,
              }}
              onPress={() => {
                if (
                  chat &&
                  typeof chat === 'object' &&
                  chat.type === 'direct'
                ) {
                  Commons.navigate(props.navigation, 'profileX', {
                    otherUser: chat.users.find(u => u._id !== user._id),
                  });
                }
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontSize: Commons.size(16),
                  color: Colors.white,
                }}>
                {chat && typeof chat === 'object'
                  ? chat.type === 'direct'
                    ? chat.users.find(u => u._id !== user._id).firstName
                    : chat.group.name
                  : userId.firstName}
              </Text>
            </TouchableOpacity>

            {chat && chat.type === 'group' && chat.group.event && (
              <TouchableOpacity onPress={() => setVisible(true)}>
                <Images.Invoice
                  height={Commons.size(24)}
                  width={Commons.size(24)}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{marginLeft: Commons.size(10)}}
              onPress={() => {}}>
              <Images.More />
            </TouchableOpacity>
          </View>

          {/* <ChatList
            style={{
              marginBottom: Commons.size(60),
              marginTop: 0,
              paddingTop: Commons.size(15),
            }}
            canTouch={false}
          /> */}

          <FlatList
            ref={chatRef}
            style={{flexGrow: 1}}
            contentContainerStyle={{flexGrow: 1}}
            initialScrollIndex={chat ? chat.messages.length - 1 : 0}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                chatRef.current?.scrollToIndex({
                  index: chat ? chat.messages.length - 1 : 0,
                  animated: true,
                });
              });
            }}
            showsVerticalScrollIndicator={false}
            data={chat ? chat.messages : []}
            renderItem={Item}
            keyExtractor={item => item._id}
            // ListFooterComponent={<View style={{height: Commons.size(55)}} />}
          />

          <View
            style={{
              width: Commons.width(0.9),
              height: Commons.size(60),
              // position: 'absolute',
              // bottom: 0,
              alignSelf: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                height: Commons.size(45),
                width: Commons.size(45),
                borderRadius: Commons.size(22.5),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.tab_bar,
              }}
              onPress={pickImages}>
              <Images.Gallery />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                borderRadius: Commons.size(22),
                paddingHorizontal: Commons.size(10),
                marginLeft: Commons.size(8),
                height: Commons.size(45),
                backgroundColor: Colors.tab_bar,
              }}>
              <TextInput
                ref={input => {
                  msgRef = input;
                }}
                maxLength={300}
                style={{
                  flex: 1,
                  color: Colors.white,
                  fontSize: Commons.size(14),
                  fontFamily: Fonts.sans_regular,
                  fontWeight: '400',
                }}
                returnKeyType={'done'}
                value={messageText}
                onChangeText={text => setMessageText(text)}
                onSubmitEditing={e => {
                  if (messageText.trim().length > 0) {
                    processCommentOnPost(messageText);
                    msgRef.clear();
                  }
                }}
                placeholder={'Type message here...'}
                placeholderTextColor={Colors.light_grey}
              />

              {chat && chat.type === 'group' && chat.group.event && (
                <TouchableOpacity
                  onPress={() => {
                    Commons.navigate(props.navigation, 'create_poll', {
                      onPollCreated: val => {
                        onPollCreated(val);
                      },
                    });
                  }}>
                  <Images.Poll />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => {
                if (messageText.trim().length > 0) {
                  processCommentOnPost(messageText);
                  msgRef.clear();
                }
              }}>
              <Images.Send height={Commons.size(30)} width={Commons.size(30)} />
            </TouchableOpacity>
          </View>

          <Modal
            statusBarTranslucent={false}
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
