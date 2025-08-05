import {api} from '../api/API';

export default {
  post: (endpoint, body, token = null) => {
    return new Promise((resolve, reject) => {
      api('POST', endpoint, body, token)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  get: (endpoint, token, id = '') => {
    return new Promise((resolve, reject) => {
      api('GET', endpoint + id, null, token)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  patch: (endpoint, body, token, id = '') => {
    return new Promise((resolve, reject) => {
      api('PATCH', endpoint + id, body, token)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  delete: (endpoint, id, token) => {
    return new Promise((resolve, reject) => {
      api('DELETE', endpoint + id, null, token)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
};
