import mongoose from "mongoose"
const Schema = mongoose.Schema

const countrySchema = new Schema({
    name : {type : String, required : true}
})

module.exports = mongoose.model('Country', countrySchema)