import axios from "axios";

const Api = axios.create({
  baseURL: "http://172.21.176.1:3333",
  headers: {
    "Content-Type": "application/json",
  },
});

export default Api;