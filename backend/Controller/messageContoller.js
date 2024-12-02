import { Message } from "../Schema/message.schema"
export const sendMessages=async(req,res)=>{
 try {
    const {reciever,content}=req.body;
    const newMessage= await Message.create({
        sender:req.user.id,
        reciever,
        content
    })

    res.status(200).json(newMessage)
 } catch (error) {
    res.status(500).json(error)
 }

}
export const RecieveMessages=async(req,res)=>{
    try {
        const messages= await Message.find({
        $or: [{
        sender: req.user._id, receiver: userId},
        {sender: userId, receiver: req.user._id}]
        }).sort("createdAt");
        I
        res.status(200).json(messages)
     } catch (error) {
        res.status(500).json(error)
     }
}