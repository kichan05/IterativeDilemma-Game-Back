const socketType = {
  ROOM_CREATE: "createRoom",
  ROOM_CREATE_REQ: "roomCreateReq",
  ROOM_JOIN: "joinRom",
  ROOM_JOIN_SUCCESS: "roomJoinSuccess",
  ROOM_DATA_UPDATE: "roomDataUpdate",
  RTC_OFFER: "rtcOffer",
  RTC_ANSWER: "rtcAnswer",
  ICE_CANDIDATE_SEND: "icecandidateSend",
  ICE_CANDIDATE_RECEIVE : "iceCandidateReceive"
}

module.exports = socketType;