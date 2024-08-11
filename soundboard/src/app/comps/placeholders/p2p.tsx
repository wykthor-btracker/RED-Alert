import { Peer } from "peerjs";
function connectionHandler (props: any) {
    const conn = new Peer()
    conn.on("open", (id) => {
        console.log("My peer id is:" + id)
    })
}