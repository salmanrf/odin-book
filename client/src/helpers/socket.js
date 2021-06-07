import {io} from "socket.io-client";

const socket = io("https://srf-odin-book.herokuapp.com/", {autoConnect: false});

export default socket;