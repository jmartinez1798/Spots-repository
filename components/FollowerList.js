import React, {useState} from 'react';
import {useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import {Colors, Images, Fonts, Commons} from '../utils';
import LinearGradient from 'react-native-linear-gradient';

export default function FollowerList(props) {
  const [isGroup, setGroup] = useState(false);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const {chats} = useSelector(state => state.chatReducer);
  const {user} = useSelector(state => state.authReducer);

  useEffect(() => {
    if (props.selectedMembers) {
      props.setSelectedMembers(
        props.data.filter((item, index) => selectedIndexes.includes(index)),
      );
    }
  }, [selectedIndexes.length]);

  const Item = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (isGroup) {
            if (!selectedIndexes.includes(index))
              setSelectedIndexes([...selectedIndexes, index]);
            else {
              setSelectedIndexes(selectedIndexes.filter(i => i !== index));
            }
          } else {
            let chat = chats.find(
              c =>
                c.users.find(u => u._id === item._id) &&
                c.users.find(u => u._id === user._id) &&
                c.type === 'direct',
            );
            if (chat) {
              Commons.navigate(props.navigation, 'chat', {
                chat: chat._id,
              });
            } else
              Commons.navigate(props.navigation, 'chat', {
                user: item,
              });
          }
        }}
        onLongPress={() => {
          if (props.setSelectedMembers && props.selectedMembers) {
            if (!isGroup) {
              setSelectedIndexes([...selectedIndexes, index]);
              setGroup(true);
            }
          }
        }}
        activeOpacity={0.7}
        style={{
          width: Commons.width(0.9),
          paddingVertical: Commons.size(12),
          paddingHorizontal: Commons.size(10),
          justifyContent: 'center',
          borderRadius: Commons.size(8),
          borderBottomWidth: index !== props.data.length - 1 ? 1 : 0,
          borderBottomColor: Colors.light_divider,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              Commons.navigate(props.navigation, 'profileX', {
                otherUser: item,
              });
            }}>
            <Image
              source={{uri: item.avatar}}
              style={{
                height: Commons.size(52),
                width: Commons.size(52),
                borderRadius: Commons.size(26),
              }}
            />
          </TouchableOpacity>

          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            <Text
              style={{
                flex: 1,
                fontSize: Commons.size(16),
                fontFamily: Fonts.sans_regular,
                fontWeight: '400',
                marginHorizontal: Commons.size(8),
                color: Colors.white,
              }}>
              {item.firstName}
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (
                  props.friends.followings.length > 0 &&
                  props.friends.followings.find(m => m._id === item._id)
                ) {
                  props.removeFriend({
                    user: item._id,
                  });
                } else {
                  props.addFriend({
                    user: item._id,
                  });
                }
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={[Colors.start, Colors.end]}
                style={{
                  height: Commons.size(32),
                  justifyContent: 'center',
                  borderRadius: Commons.size(8),
                  paddingHorizontal: Commons.size(21),
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans_regular,
                    fontSize: Commons.size(14),
                    alignSelf: 'center',
                    fontWeight: '400',
                    color: Colors.white,
                  }}>
                  {props.friends.followings &&
                  props.friends.followings.find(m => m._id === item._id)
                    ? 'Unfollow'
                    : 'Follow'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {isGroup && (
              <TouchableOpacity
                onPress={() => {
                  if (!selectedIndexes.includes(index))
                    setSelectedIndexes([...selectedIndexes, index]);
                  else {
                    setSelectedIndexes(
                      selectedIndexes.filter(i => i !== index),
                    );
                  }
                }}
                style={{
                  height: Commons.size(18),
                  width: Commons.size(18),
                  borderRadius: Commons.size(9),
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectedIndexes.includes(index)
                    ? Colors.primary
                    : 'transparent',
                  borderWidth: 1,
                  borderColor: selectedIndexes.includes(index)
                    ? Colors.primary
                    : Colors.white_light,
                  marginLeft: Commons.size(7),
                }}>
                <Images.Tick
                  fill={
                    selectedIndexes.includes(index)
                      ? Colors.white
                      : 'transparent'
                  }
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      contentContainerStyle={{alignItems: 'center'}}
      style={{marginTop: Commons.size(15), marginBottom: Commons.size(5)}}
      data={props.data}
      renderItem={Item}
      keyExtractor={item => item._id}
    />
  );
}
