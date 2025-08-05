import {BASE_URL} from '@env';
import axios from 'axios';
import Commons from '../utils/Commons';

export const api = (method, endpoint, body, headers) => {
  return new Promise((resolve, reject) => {
    axios({
      method: method,
      url: BASE_URL + endpoint,
      data: body,
      headers: {
        Authorization: 'Bearer ' + headers,
      },
    })
      .then(res => {
        if (res.data.status) resolve(res.data);
        else {
          Commons.toast(res.data.message);
          reject(res.data.message);
        }
      })
      .catch(err => {
        Commons.toast(err.message);
        reject(err);
      });
  });
};
