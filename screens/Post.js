import React, {useState} from 'react';
import {Text, View, TouchableOpacity, TextInput, Image} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {MessageList, SafeArea} from '../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import ApiService from '../services/ApiService';
import {useDispatch, useSelector} from 'react-redux';
import {updatePosts} from '../store/actions/PostActions';
import storage from '@react-native-firebase/storage';
import moment from 'moment';

export default function Post(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const {posts} = useSelector(state => state.postReducer);
  const [messageText, setMessageText] = useState('');
  const post = posts.find(p => p._id === props.route.params.post);
  let time = Commons.timeDiff(new Date(post.createdAt), new Date());
  const [newItemAdded, setNewItemAdded] = useState(false);

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
            let index = posts.indexOf(post);
            if (!posts[index].comments) posts[index].comments = [];
            posts[index].comments.push({
              user: user,
              image: obj.path,
              createdAt: new Date().toISOString(),
            });
            dispatch(updatePosts(posts));
            setNewItemAdded(true);

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
        let index = posts.indexOf(post);
        if (posts[index].comments && posts[index].comments.length > 0) {
          posts[index].comments.splice(posts[index].comments.length - 1, 1);
          dispatch(updatePosts(posts));
          setNewItemAdded(true);
        }
      });
  };

  const processLikePost = async id => {
    let index = posts.indexOf(post);
    let action = '';
    if (!posts[index].likes.includes(user._id)) {
      posts[index].likes.push(user._id);
      action = 'add';
    } else {
      let ind = posts[index].likes.indexOf(user._id);
      if (ind > -1) {
        posts[index].likes.splice(ind, 1);
      }
      action = 'remove';
    }
    dispatch(updatePosts(posts));
    await ApiService.post(Endpoints.like_post + id, null, user.token)
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let ind = posts[index].likes.indexOf(user._id);
          if (ind > -1) {
            posts[index].likes.splice(ind, 1);
          }
        } else {
          posts[index].likes.push(user._id);
        }
        dispatch(updatePosts(posts));
        console.log(err);
      });
  };

  const processReactPost = async id => {
    let index = posts.indexOf(post);
    let action = '';
    if (!posts[index].reactions.includes(user._id)) {
      posts[index].reactions.push(user._id);
      action = 'add';
    } else {
      let ind = posts[index].reactions.indexOf(user._id);
      if (ind > -1) {
        posts[index].reactions.splice(ind, 1);
      }
      action = 'remove';
    }
    dispatch(updatePosts(posts));
    await ApiService.post(Endpoints.react_post + id, null, user.token)
      .then(res => {})
      .catch(err => {
        if (action === 'add') {
          let ind = posts[index].reactions.indexOf(user._id);
          if (ind > -1) {
            posts[index].reactions.splice(ind, 1);
          }
        } else {
          posts[index].reactions.push(user._id);
        }
        dispatch(updatePosts(posts));
        console.log(err);
      });
  };

  const processCommentOnPost = async msg => {
    if (!msg.includes('firebasestorage')) {
      let index = posts.indexOf(post);
      if (!posts[index].comments) posts[index].comments = [];
      posts[index].comments.push({
        user: user,
        text: msg,
        createdAt: new Date().toISOString(),
      });
      dispatch(updatePosts(posts));
      setNewItemAdded(true);
    }

    let body = {
      image: msg.includes('firebasestorage') ? msg : null,
      text: !msg.includes('firebasestorage') ? msg : null,
      post: post._id,
    };
    await ApiService.post(Endpoints.comments, body, user.token)
      .then(res => {
        let index = posts.indexOf(post);
        posts[index] = res.data;
        dispatch(updatePosts(posts));
      })
      .catch(err => {
        console.log(err);
        Commons.toast('Message sending error');
        let index = posts.indexOf(post);
        if (posts[index].comments && posts[index].comments.length > 0) {
          posts[index].comments.splice(posts[index].comments.length - 1, 1);
          dispatch(updatePosts(posts));
          setNewItemAdded(true);
        }
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
              width: Commons.width(0.9),
              alignSelf: 'center',
              marginTop: Commons.size(15),
              paddingVertical: Commons.size(12),
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={() => props.navigation.goBack()}>
                <Images.Back
                  stroke={Colors.white}
                  height={Commons.size(24)}
                  width={Commons.size(24)}
                />
              </TouchableOpacity>

              <Image
                source={{uri: post.user.avatar}}
                style={{
                  height: Commons.size(40),
                  width: Commons.size(40),
                  borderRadius: Commons.size(20),
                  marginLeft: Commons.size(15),
                }}
              />

              <View style={{marginHorizontal: Commons.size(12), flex: 1}}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_medium,
                    fontSize: Commons.size(16),
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  {post.user.firstName}
                </Text>

                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(12),
                    fontWeight: '400',
                    color: Colors.white_light,
                  }}>
                  {time.days === 0 || time.days === '-1' || time.days === -1
                    ? time.hours === 0 ||
                      time.hours === '-1' ||
                      time.hours === -1
                      ? time.minutes === 0 ||
                        time.minutes === '-1' ||
                        time.minutes === -1
                        ? 'Few seconds ago'
                        : time.minutes + 'm ago'
                      : time.hours + 'h ago'
                    : time.days + 'd ago'}
                </Text>
              </View>
            </View>

            {post.text && (
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(14),
                  fontWeight: '400',
                  color: Colors.white,
                  marginTop: Commons.size(12),
                }}>
                {post.text}
              </Text>
            )}

            {((post.type === 'event' && post.event.coverImage) ||
              (post.type === 'spot' && post.spot.images.length > 0) ||
              post.images.length > 0) && (
              <Image
                source={{
                  uri:
                    post.type === 'event'
                      ? post.event.coverImage
                      : post.type === 'spot'
                      ? post.spot.images[0]
                      : post.images[0],
                }}
                style={{
                  height: Commons.size(220),
                  width: Commons.width(0.9),
                  borderRadius: Commons.size(10),
                  backgroundColor: Colors.background,
                  resizeMode: 'cover',
                  marginTop: Commons.size(12),
                }}
              />
            )}

            {post.type === 'event' && (
              <TouchableOpacity
                onPress={() => {
                  Commons.navigate(props.navigation, 'event_detail', {
                    event_id: post.event._id,
                  });
                }}>
                <View
                  style={{flexDirection: 'row', marginTop: Commons.size(10)}}>
                  <View
                    style={{
                      flex: 1,
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans_medium,
                        fontSize: Commons.size(18),
                        color: Colors.white,
                        fontWeight: '700',
                      }}>
                      {post.event.name}
                    </Text>

                    <Text
                      style={{
                        fontFamily: Fonts.sans_regular,
                        fontSize: Commons.size(12),
                        color: Colors.light_grey,
                        fontWeight: '400',
                      }}>
                      {post.event.location.address}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(12),
                      color: Colors.light_grey,
                      fontWeight: '400',
                    }}>
                    {moment(post.event.startTime).format('DD/MM/YY - h:mm a')}
                  </Text>
                </View>

                {post.event.visitors.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: Commons.size(10),
                    }}>
                    {post.event.visitors.slice(0, 4).map((item2, index2) => {
                      if (index2 < 3) {
                        return (
                          <View
                            style={{
                              height: Commons.size(30),
                              width: Commons.size(30),
                              borderRadius: Commons.size(15),
                              marginLeft:
                                index2 > 0 ? -1 * Commons.size(15) : 0,
                              borderWidth: 1,
                              borderBottomColor: Colors.background,
                              overflow: 'hidden',
                            }}>
                            <Image
                              source={{uri: item2.avatar}}
                              style={{
                                height: Commons.size(30),
                                width: Commons.size(30),
                                resizeMode: 'cover',
                              }}
                            />
                          </View>
                        );
                      }
                      return (
                        <View
                          style={{
                            height: Commons.size(30),
                            width: Commons.size(30),
                            borderRadius: Commons.size(15),
                            marginLeft: -1 * Commons.size(15),
                            borderWidth: 1,
                            borderBottomColor: Colors.background,
                            overflow: 'hidden',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: Colors.white,
                          }}>
                          <Text
                            style={{
                              color: Colors.primary,
                              fontWeight: '700',
                              fontFamily: Fonts.sans_regular,
                              fontSize: Commons.size(15),
                            }}>
                            +{post.event.visitors.length - 3}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
                {post.event.visitors.length > 0 && (
                  <Text
                    style={{
                      fontFamily: Fonts.sans_medium,
                      fontSize: Commons.size(12),
                      fontWeight: '700',
                      color: Colors.primary,
                    }}>
                    {post.event.visitors[0].firstName}{' '}
                    <Text
                      style={{
                        fontFamily: Fonts.sans_medium,
                        fontSize: Commons.size(12),
                        fontWeight: '400',
                        color: Colors.white,
                      }}>
                      {post.event.visitors.length > 2
                        ? `and ${
                            post.event.visitors.length - 1
                          } people are going`
                        : post.event.visitors.length > 1
                        ? `and 1 other is going`
                        : 'is going'}
                    </Text>
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {post.type === 'spot' && (
              <TouchableOpacity
                onPress={() => {
                  Commons.navigate(props.navigation, 'spot_details', {
                    spot: post.spot,
                  });
                }}>
                <View
                  style={{flexDirection: 'row', marginTop: Commons.size(10)}}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={post.spot.icon}
                      style={{
                        height: Commons.size(60),
                        width: Commons.size(60),
                        borderRadius: Commons.size(30),
                      }}
                    />
                    <View>
                      <Text
                        style={{
                          fontFamily: Fonts.sans_medium,
                          fontSize: Commons.size(18),
                          color: Colors.white,
                          fontWeight: '700',
                        }}>
                        {post.spot.name}
                      </Text>

                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        {post.spot.categories.map((item2, index2) => {
                          return (
                            <Text
                              style={{
                                fontFamily: Fonts.sans_regular,
                                fontSize: Commons.size(12),
                                fontWeight: '400',
                                color: Colors.white_light,
                              }}>
                              #{item2}{' '}
                            </Text>
                          );
                        })}
                      </View>

                      <Text
                        style={{
                          fontFamily: Fonts.sans_regular,
                          fontSize: Commons.size(12),
                          color: Colors.light_grey,
                          fontWeight: '400',
                        }}>
                        {post.spot.location.address}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(12),
                      color: Colors.light_grey,
                      fontWeight: '400',
                    }}>
                    {moment(post.spot.startTime).format('DD/MM/YY - h:mm a')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Commons.size(12),
              }}>
              <TouchableOpacity
                onPress={() => processLikePost(post._id)}
                style={{
                  backgroundColor: post.likes.includes(user._id)
                    ? Colors.active_pin
                    : Colors.feed_like_bg,
                  height: Commons.size(32),
                  borderRadius: Commons.size(20),
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    marginHorizontal: Commons.size(12),
                  }}>
                  <Images.Like />
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    fontWeight: '400',
                    color: Colors.white,
                    marginRight: Commons.size(12),
                  }}>
                  {post.likes.length}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => processReactPost(post._id)}
                style={{
                  backgroundColor: post.reactions.includes(user._id)
                    ? Colors.active_pin
                    : Colors.feed_like_bg,
                  height: Commons.size(32),
                  borderRadius: Commons.size(20),
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  marginHorizontal: Commons.size(8),
                }}>
                <View
                  style={{
                    marginHorizontal: Commons.size(12),
                  }}>
                  <Images.Fire />
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    fontWeight: '400',
                    color: Colors.white,
                    marginRight: Commons.size(12),
                  }}>
                  {post.reactions.length}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <MessageList
            data={post.comments}
            newItemAdded={newItemAdded}
            setNewItemAdded={setNewItemAdded}
          />

          <View
            style={{
              width: Commons.width(0.9),
              height: Commons.size(60),
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

            <TextInput
              ref={input => {
                msgRef = input;
              }}
              maxLength={300}
              multiline
              numberOfLines={5}
              style={{
                flex: 1,
                borderRadius: Commons.size(22),
                paddingHorizontal: Commons.size(10),
                backgroundColor: Colors.tab_bar,
                marginLeft: Commons.size(8),
                fontSize: Commons.size(14),
                fontFamily: Fonts.sans_regular,
                fontWeight: '400',
                height: Commons.size(45),
                color: Colors.white,
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
        </View>
      }
    />
  );
}
