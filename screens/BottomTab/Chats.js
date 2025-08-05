import React, {useState} from 'react';
import {Text, View, TouchableOpacity, TextInput} from 'react-native';
import {SafeArea, ChatList} from '../../components';
import {Colors, Images, Fonts, Commons, Endpoints} from '../../utils';
import ApiService from '../../services/ApiService';
import {updateChats} from '../../store/actions/ChatActions';
import LinearGradient from 'react-native-linear-gradient';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';

export default function Chats(props) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.authReducer);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(-1);
  const isFocused = useIsFocused();
  const [search, setSearch] = useState('');
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    getChats();
  }, [isFocused]);

  useEffect(() => {
    if (search.trim().length > 0)
      dispatch(
        updateChats(
          allData.filter(
            ad =>
              (ad.type === 'direct' &&
                ad.users.find(u =>
                  u.firstName.toLowerCase().includes(search.toLowerCase()),
                )) ||
              (ad.type === 'group' &&
                ad.group.name.toLowerCase().includes(search.toLowerCase())),
          ),
        ),
      );
    else {
      handleDataWithSelectedTab();
    }
  }, [search]);

  useEffect(() => {
    handleDataWithSelectedTab();
  }, [selectedTab]);

  const handleDataWithSelectedTab = () => {
    if (selectedTab === 0) {
      dispatch(updateChats(allData));
    } else if (selectedTab === 1) {
      dispatch(updateChats(allData.filter(ad => ad.type === 'direct')));
    } else if (selectedTab === 2) {
      dispatch(
        updateChats(
          allData.filter(ad => ad.type === 'group' && !ad.group.event),
        ),
      );
    } else if (selectedTab === 3) {
      dispatch(
        updateChats(
          allData.filter(ad => ad.type === 'group' && ad.group.event),
        ),
      );
    }
  };

  const getChats = async () => {
    setRefreshing(true);
    await ApiService.get(Endpoints.chats, user.token)
      .then(res => {
        setAllData(res.data);
        // handleDataWithSelectedTab();
        setSelectedTab(0);
        setRefreshing(false);
      })
      .catch(err => {
        console.log(err);
        setRefreshing(false);
      });
  };

  return (
    <SafeArea
      statusBarTransculent={false}
      statusBarColor={Colors.tab_bar}
      child={
        <View style={{flex: 1}}>
          <Text
            style={{
              marginTop: Commons.size(20),
              alignSelf: 'center',
              width: Commons.width(0.9),
              fontSize: Commons.size(24),
              fontWeight: '700',
              color: Colors.white,
              fontFamily: Fonts.sans_regular,
            }}>
            Messages
          </Text>

          <View
            style={{
              height: Commons.size(44),
              width: Commons.width(0.9),
              borderWidth: 1,
              borderColor: Colors.light_black,
              borderRadius: Commons.size(7),
              alignSelf: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              paddingHorizontal: Commons.size(7),
              marginTop: Commons.size(15),
            }}>
            <Images.Search
              stroke={Colors.light_black}
              height={Commons.size(15)}
              width={Commons.size(15)}
            />
            <TextInput
              style={{
                flex: 1,
                fontSize: Commons.size(15),
                color: Colors.white,
                marginHorizontal: Commons.size(5),
                fontFamily: Fonts.sans_regular,
                fontWeight: '400',
              }}
              value={search}
              onChangeText={setSearch}
              blurOnSubmit={true}
              returnKeyType={'search'}
              placeholder={'Search'}
              placeholderTextColor={Colors.light_black}
            />
          </View>

          <View
            style={{
              width: Commons.width(0.9),
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.tab_bar,
              borderRadius: Commons.size(8),
              height: Commons.size(35),
              marginTop: Commons.size(15),
            }}>
            <TouchableOpacity
              onPress={() => setSelectedTab(0)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                overflow: 'hidden',
                borderRadius: Commons.size(8),
              }}
              disabled={selectedTab === 0}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={
                  selectedTab === 0
                    ? [Colors.start, Colors.end]
                    : ['transparent', 'transparent']
                }
                style={{
                  height: Commons.size(35),
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    alignSelf: 'center',
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  All
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab(1)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                overflow: 'hidden',
                borderRadius: Commons.size(8),
              }}
              disabled={selectedTab === 1}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={
                  selectedTab === 1
                    ? [Colors.start, Colors.end]
                    : ['transparent', 'transparent']
                }
                style={{
                  height: Commons.size(35),
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    alignSelf: 'center',
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  Direct
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab(2)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                overflow: 'hidden',
                borderRadius: Commons.size(8),
              }}
              disabled={selectedTab === 2}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={
                  selectedTab === 2
                    ? [Colors.start, Colors.end]
                    : ['transparent', 'transparent']
                }
                style={{
                  height: Commons.size(35),
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    alignSelf: 'center',
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  Group
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab(3)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                overflow: 'hidden',
                borderRadius: Commons.size(8),
              }}
              disabled={selectedTab === 3}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={
                  selectedTab === 3
                    ? [Colors.start, Colors.end]
                    : ['transparent', 'transparent']
                }
                style={{
                  height: Commons.size(35),
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    alignSelf: 'center',
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  Event
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <ChatList
            navigation={props.navigation}
            canTouch={true}
            getChats={getChats}
            refreshing={refreshing}
          />

          <TouchableOpacity
            onPress={() => Commons.navigate(props.navigation, 'new_chat')}
            activeOpacity={0.6}
            style={{
              height: Commons.size(50),
              width: Commons.size(50),
              borderRadius: Commons.size(25),
              position: 'absolute',
              right: Commons.size(20),
              bottom: Commons.size(174),
              overflow: 'hidden',
            }}>
            <Images.NewChat
              height={Commons.size(50)}
              width={Commons.size(50)}
            />
          </TouchableOpacity>
        </View>
      }
    />
  );
}
