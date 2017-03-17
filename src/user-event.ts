import * as mongoose from 'mongoose';
export class UserEvent {
    mongo = mongoose.createConnection();
    user = mongoose.model('User', new mongoose.Schema({
        userId:{required:true, type:String},
        follow:Boolean
    })) ;

    constructor() {
    }

    mongoConnect = (uri) => {
        return new Promise((res,rej)=>{
            this.mongo.open(uri, 'test', 27017, err=>{ rej(err) });
        });
    }
}