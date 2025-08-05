import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {SafeArea, Loader} from '../components';
import PostList from '../components/PostList';
import {Colors, Images, Fonts, Commons, Endpoints} from '../utils';
import ApiService from '../services/ApiService';
import storage from '@react-native-firebase/storage';
import {useDispatch, useSelector} from 'react-redux';
import Modal from 'react-native-modal';
import moment from 'moment';
import {updatePosts} from '../store/actions/PostActions';

export default function CreatePost(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const {posts} = useSelector(state => state.postReducer);
  const [isEnabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmerEvent, setConfirmerEvent] = useState(false);
  const [confirmerSpot, setConfirmerSpot] = useState(false);
  const post = props.route.params
    ? posts.find(p => p._id === props.route.params.post)
    : null;
  const index = posts.indexOf(post);
  const isEdit = props.route.params ? props.route.params.isEdit : false;
  const [pics, setPics] = useState(
    post && post.images.length > 0 ? post.images : [],
  );
  const [caption, setCaption] = useState(post && post.text ? post.text : '');
  const [event, setEvent] = useState(post && post.event ? post.event : null);
  const [spot, setSpot] = useState(post && post.spot ? post.spot : null);

  useEffect(() => {
    if (loading) {
      if (pics.length > 0) uploadImages();
      else createPost([]);
    }
  }, [loading]);

  useEffect(() => {
    if (caption.trim().length > 0 || pics.length > 0 || spot || event)
      setEnabled(true);
    else setEnabled(false);
  }),
    [caption, pics, event, spot];

  const pickImages = async () => {
    await launchImageLibrary({
      mediaType: 'photo',
    })
      .then(async res => {
        await Commons.cropFile(res.assets[0].uri)
          .then(result => {
            setPics([...pics, result]);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  };

  const setPostType = (event, spot) => {
    setEvent(event);
    setSpot(spot);
  };

  const uploadImages = () => {
    let images = [];
    pics.forEach(async pic => {
      if (typeof pic === 'object') {
        let path = pic.path;
        let filename = pic.modificationDate;
        let uploadUri =
          Platform.OS === 'ios' ? path.replace('file://', '') : path;
        await Commons.uploadToFirebase(uploadUri, filename)
          .then(async snapshot => {
            if (snapshot.state === 'success') {
              const url = await storage().ref(filename).getDownloadURL();
              images.push(url);

              if (pics.indexOf(pic) === pics.length - 1) {
                createPost(images);
              }
            }
          })
          .catch(error => {
            console.log(error);
            setLoading(false);
          });
      } else {
        images.push(pic);
      }
    });
  };

  const createPost = async images => {
    if (isEdit) {
      await ApiService.patch(
        Endpoints.posts,
        {
          text: caption.trim(),
          type: event ? 'event' : spot ? 'spot' : 'normal',
          images: images,
          spot: spot ? spot._id : null,
          event: event ? event._id : null,
        },
        user.token,
        post._id,
      )
        .then(res => {
          setLoading(false);
          post.images = images;
          posts[index] = post;
          dispatch(updatePosts(posts));
          props.navigation.goBack();
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    } else {
      await ApiService.post(
        Endpoints.posts,
        {
          text: caption.trim(),
          type: event ? 'event' : spot ? 'spot' : 'normal',
          images: images,
          spot: spot ? spot._id : null,
          event: event ? event._id : null,
        },
        user.token,
      )
        .then(res => {
          posts.push(res.data);
          dispatch(updatePosts(posts));
          setLoading(false);
          props.navigation.goBack();
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  const deleteEvent = async () => {
    await ApiService.delete(Endpoints.events, event._id, user.token)
      .then(res => {
        post.event = null;
        setEvent(null);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const deleteSpot = async () => {
    await ApiService.delete(Endpoints.spots, spot._id, user.token)
      .then(res => {
        post.spot = null;
        setSpot(null);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.background}
      child={
        <ScrollView
          contentContainerStyle={{height: Commons.height() - Commons.size(25)}}>
          <View
            style={{
              marginTop: Commons.size(20),
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              width: Commons.width(0.9),
            }}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
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
              {isEdit ? 'Edit Post' : 'Create Post'}
            </Text>
            <TouchableOpacity
              onPress={() => setLoading(true)}
              disabled={!isEnabled}>
              {isEnabled && (
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[Colors.start, Colors.end]}
                  style={{
                    width: Commons.size(45),
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
                    {isEdit ? 'Edit' : 'Post'}
                  </Text>
                </LinearGradient>
              )}
              {!isEnabled && (
                <View
                  style={{
                    width: Commons.size(45),
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
                    {isEdit ? 'Edit' : 'Post'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={{
              width: Commons.width(0.9),
              flex: 1,
              alignSelf: 'center',
              textAlignVertical: 'top',
              fontFamily: Fonts.sans_regular,
              color: Colors.light_grey,
              fontSize: Commons.size(16),
              fontWeight: '400',
            }}
            value={caption}
            onChangeText={setCaption}
            multiline={true}
            numberOfLines={7}
            blurOnSubmit={true}
            returnKeyType={'done'}
            placeholder={'Whats on your mind'}
            placeholderTextColor={Colors.white_light}
          />

          {event && (
            <View
              style={{
                width: Commons.width(0.9),
                alignSelf: 'center',
                backgroundColor: Colors.tab_bar,
                borderRadius: Commons.size(15),
                padding: Commons.size(10),
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: Fonts.sans_regular,
                    color: Colors.white,
                    fontSize: Commons.size(20),
                    fontWeight: '400',
                  }}>
                  Attached Event
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (isEdit) {
                      setConfirmerEvent(true);
                    } else setEvent(null);
                  }}>
                  <Images.Close
                    height={Commons.size(20)}
                    width={Commons.size(20)}
                    stroke={Colors.white}
                    fill={Colors.white}
                  />
                </TouchableOpacity>
              </View>

              <Image
                source={{uri: event.coverImage}}
                style={{
                  height: Commons.size(150),
                  width: '100%',
                  resizeMode: 'cover',
                  marginTop: Commons.size(10),
                }}
              />
              <Text
                style={{
                  fontSize: Commons.size(14),
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                  marginTop: Commons.size(10),
                }}>
                {event.name}
              </Text>
              <Text
                ellipsizeMode="tail"
                numberOfLines={2}
                style={{
                  fontSize: Commons.size(12),
                  fontFamily: Fonts.sans_regular,
                  color: Colors.white,
                  fontWeight: '400',
                }}>
                {event.locationAddress}
              </Text>

              <View
                style={{
                  marginTop: Commons.size(20),
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Images.Calendar fill={Colors.white} />
                    <Text
                      style={{
                        fontSize: Commons.size(14),
                        fontFamily: Fonts.sans_regular,
                        color: Colors.white,
                        marginLeft: Commons.size(10),
                        fontWeight: '400',
                      }}>
                      From:{'    '}
                      {moment(event.startTime).format('DD/MM/YY - h:mm a')}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: Commons.size(15),
                    }}>
                    <Images.Calendar fill={Colors.white} />
                    <Text
                      style={{
                        fontSize: Commons.size(14),
                        fontFamily: Fonts.sans_regular,
                        color: Colors.white,
                        marginLeft: Commons.size(10),
                        fontWeight: '400',
                      }}>
                      To:{'    '}
                      {moment(event.endTime).format('DD/MM/YY - h:mm a')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {spot && (
            <View
              style={{
                alignItems: 'center',
                alignSelf: 'center',
                backgroundColor: Colors.tab_bar,
                width: Commons.width(0.9),
                marginTop: Commons.size(20),
                borderRadius: Commons.size(15),
                padding: Commons.size(10),
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: Fonts.sans_regular,
                    color: Colors.white,
                    fontSize: Commons.size(20),
                    fontWeight: '400',
                  }}>
                  Attached Spot
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (isEdit) {
                      setConfirmerSpot(true);
                    } else setSpot(null);
                  }}>
                  <Images.Close
                    height={Commons.size(20)}
                    width={Commons.size(20)}
                    stroke={Colors.white}
                    fill={Colors.white}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: Commons.size(10),
                }}>
                <Image
                  source={spot.icon}
                  style={{
                    height: Commons.size(60),
                    width: Commons.size(60),
                    borderRadius: Commons.size(30),
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
                    {spot.name}
                  </Text>

                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {spot.categories.map((item, index) => {
                      return (
                        <Text
                          style={{
                            fontFamily: Fonts.sans_regular,
                            fontSize: Commons.size(12),
                            fontWeight: '400',
                            color: Colors.white_light,
                          }}>
                          #{item}{' '}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              </View>

              <Image
                source={{uri: spot.images[0]}}
                style={{
                  width: '100%',
                  height: Commons.size(160),
                  borderRadius: Commons.size(15),
                  marginTop: Commons.size(15),
                }}
              />
            </View>
          )}

          <PostList data={pics} setPics={setPics} />

          <View
            style={{
              backgroundColor: Colors.tab_bar,
              borderTopLeftRadius: Commons.size(12),
              borderTopRightRadius: Commons.size(12),
              height: Commons.size(46),
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: Commons.size(5),
            }}>
            <TouchableOpacity
              onPress={pickImages}
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Images.Post />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Commons.navigate(props.navigation, 'create_event', {
                  setPostType: (event, spot) => {
                    setPostType(event, spot);
                  },
                });
              }}
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Images.Event fill={'yellow'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Commons.navigate(props.navigation, 'create_spot', {
                  setPostType: (event, spot) => {
                    setPostType(event, spot);
                  },
                });
              }}
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Images.Spot fill={Colors.primary} stroke={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Modal
            isVisible={confirmerEvent}
            onBackButtonPress={() => setConfirmerEvent(false)}
            onBackdropPress={() => setConfirmerEvent(false)}
            backdropColor={Colors.light_black}
            backdropOpacity={0.3}>
            <View
              style={{
                borderRadius: Commons.size(25),
                backgroundColor: Colors.black,
                padding: Commons.size(15),
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontWeight: 'bold',
                  fontSize: Commons.size(22),
                  alignSelf: 'center',
                  color: Colors.white,
                }}>
                Delete Event
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(12),
                  alignSelf: 'center',
                  color: Colors.white,
                  marginVertical: Commons.size(10),
                }}>
                Are you sure, you want to delete this event?
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: Commons.size(20),
                }}>
                <TouchableOpacity
                  onPress={() => setConfirmerEvent(false)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    marginRight: Commons.size(10),
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(14),
                      fontWeight: '600',
                      alignSelf: 'center',
                      color: Colors.white,
                      marginVertical: Commons.size(10),
                    }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setConfirmerEvent(false);
                    setTimeout(() => {
                      deleteEvent();
                    }, 300);
                  }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    marginLeft: Commons.size(10),
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(14),
                      fontWeight: '600',
                      alignSelf: 'center',
                      color: Colors.primary,
                      marginVertical: Commons.size(10),
                    }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            isVisible={confirmerSpot}
            onBackButtonPress={() => setConfirmerSpot(false)}
            onBackdropPress={() => setConfirmerSpot(false)}
            backdropColor={Colors.light_black}
            backdropOpacity={0.3}>
            <View
              style={{
                borderRadius: Commons.size(25),
                backgroundColor: Colors.black,
                padding: Commons.size(15),
              }}>
              <Text
                style={{
                  fontFamily: Fonts.sans_medium,
                  fontWeight: 'bold',
                  fontSize: Commons.size(22),
                  alignSelf: 'center',
                  color: Colors.white,
                }}>
                Delete Event
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.sans_regular,
                  fontSize: Commons.size(12),
                  alignSelf: 'center',
                  color: Colors.white,
                  marginVertical: Commons.size(10),
                }}>
                Are you sure, you want to delete this spot?
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: Commons.size(20),
                }}>
                <TouchableOpacity
                  onPress={() => setConfirmerSpot(false)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    marginRight: Commons.size(10),
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(14),
                      fontWeight: '600',
                      alignSelf: 'center',
                      color: Colors.white,
                      marginVertical: Commons.size(10),
                    }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setConfirmerSpot(false);
                    setTimeout(() => {
                      deleteSpot();
                    }, 300);
                  }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    marginLeft: Commons.size(10),
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans_regular,
                      fontSize: Commons.size(14),
                      fontWeight: '600',
                      alignSelf: 'center',
                      color: Colors.primary,
                      marginVertical: Commons.size(10),
                    }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Loader visible={loading} />
        </ScrollView>
      }
    />
  );
}
