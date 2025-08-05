import React, {useEffect} from 'react';
import {View} from 'react-native';
import ZegoUIKitPrebuiltLiveStreaming, {
  AUDIENCE_DEFAULT_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-live-streaming-rn';
import ZegoUIKitSignalingPlugin from '@zegocloud/zego-uikit-signaling-plugin-rn';
import {ZEGO_CLOUD_APPID, ZEGO_CLOUD_APPSIGN} from '@env';
import {useSelector} from 'react-redux';
import ApiService from '../../services/ApiService';
import {Endpoints} from '../../utils';

export default function Audience(props) {
  const {user} = useSelector(state => state.authReducer);
  const roomId = props.route.params.roomId;
  const liveStreamId = props.route.params.liveStreamId;

  useEffect(() => {
    joinLive();
  }, []);

  const joinLive = async () => {
    await ApiService.patch(
      Endpoints.live_streams + 'join/',
      null,
      user.token,
      liveStreamId,
    )
      .then(res => {})
      .catch(err => {
        Commons.toast(err);
        console.log(err);
      });
  };

  const leaveLive = async () => {
    await ApiService.patch(
      Endpoints.live_streams + 'leave/',
      null,
      user.token,
      liveStreamId,
    )
      .then(res => {
        props.navigation.goBack();
      })
      .catch(err => {
        Commons.toast(err);
        console.log(err);
      });
  };

  return (
    <View style={{flex: 1}}>
      <ZegoUIKitPrebuiltLiveStreaming
        appID={parseFloat(ZEGO_CLOUD_APPID)}
        appSign={ZEGO_CLOUD_APPSIGN}
        userID={user._id}
        userName={user.firstName}
        liveID={roomId}
        config={{
          ...AUDIENCE_DEFAULT_CONFIG,
          onLiveStreamingEnded: () => {
            props.navigation.goBack();
          },
          onLeaveLiveStreaming: () => {
            leaveLive();
          },
        }}
        plugins={[ZegoUIKitSignalingPlugin]}
      />
    </View>
  );
}
