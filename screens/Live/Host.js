import React, {useState} from 'react';
import {View} from 'react-native';
import ZegoUIKitPrebuiltLiveStreaming, {
  HOST_DEFAULT_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-live-streaming-rn';
import ZegoUIKitSignalingPlugin from '@zegocloud/zego-uikit-signaling-plugin-rn';
import {ZEGO_CLOUD_APPID, ZEGO_CLOUD_APPSIGN} from '@env';
import {useSelector} from 'react-redux';
import ApiService from '../../services/ApiService';
import {Commons, Endpoints} from '../../utils';

export default function Host(props) {
  const {user} = useSelector(state => state.authReducer);
  const [liveId, setLiveId] = useState(null);
  const [roomId, setRoomId] = useState(
    `${user.firstName.replace(' ', '')}@${user._id}`,
  );

  const startLive = async () => {
    let body = {
      liveRoomId: roomId,
    };

    await ApiService.post(Endpoints.live_streams, body, user.token)
      .then(res => {
        setLiveId(res.data._id);
      })
      .catch(err => {
        Commons.toast(err);
        console.log(err);
      });
  };

  const endLive = async () => {
    let body = {
      status: 'ended',
    };

    await ApiService.patch(Endpoints.live_streams, body, user.token, liveId)
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
      {roomId && (
        <ZegoUIKitPrebuiltLiveStreaming
          appID={parseFloat(ZEGO_CLOUD_APPID)}
          appSign={ZEGO_CLOUD_APPSIGN}
          userID={user._id}
          userName={user.firstName}
          liveID={roomId}
          config={{
            ...HOST_DEFAULT_CONFIG,
            onStartLiveButtonPressed: () => {
              startLive();
            },
            onLeaveLiveStreaming: () => {
              endLive();
            },
          }}
          plugins={[ZegoUIKitSignalingPlugin]}
        />
      )}
    </View>
  );
}
