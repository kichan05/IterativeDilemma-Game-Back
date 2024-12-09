const submit = document.querySelector("#submit");

const peerConnection = new RTCPeerConnection();

const dataChannel = peerConnection.createDataChannel("myDataChannel");

dataChannel.onmessage = (e) => {
  console.log(e);
}

submit.addEventListener("click", () => {
  dataChannel.send("Hello World")
})

peerConnection.onicecandidate = e => {
  if(e.candidate) {
    console.log("ICE : ", e.candidate);
  }
}

async function createOffer() {
  const offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)
  console.log("Offer create", offer);
}

createOffer()