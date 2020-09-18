import mongoose from "mongoose"

const Schema = mongoose.Schema

const userSchema = new Schema({
    firstName : {type : String, required : true},
    lastName : {type : String, required : true},
    email : {type : String, required : true, unique : true},
    address : {type : String, required : true},
    state : {type : String, required : true},
    city : {type : String, required : true},
    country: {type : Schema.Types.ObjectId, required : true, ref : "Country"},
    phoneNumber : {type : Number, required : true, unique : true},
    dob : {type : Date, required : true},
    status : {type : String, required : true, default : 'Active'},
    isDelete : {type : Number, default : 0}, //0=not delete,1=deleted .both are soft delete.
    userRole : {type : String, required : true, enum : ["ADMIN", "NORMAL"]}
})

module.exports = mongoose.model('User', userSchema)