import express from "express"
import mongoose from "mongoose"
import User from "../schema/User"
import Country from "../schema/Country"
import _ from "lodash"

let app = express.Router()

app.post('/registration', async (req, res) => {
    try {
        if(req.body){
            //#region field validation
            if(!req.body.firstName){
                return res.json({
                  status : 400,
                  message : "firstName is missing." 
                })
            }

            if(!req.body.lastName){
                return res.json({
                  status : 400,
                  message : "lastName is missing."  
                })
            }

            if(!req.body.email){
                return res.json({
                  status : 400,
                  message : "email is missing."  
                })
            }

            if(!req.body.address){
                return res.json({
                  status : 400,
                  message : "address is missing."  
                })
            }

            if(!req.body.state){
                return res.json({
                  status : 400,
                  message : "state is missing."  
                })
            }

            if(!req.body.city){
                return res.json({
                  status : 400,
                  message : "city is missing."  
                })
            }

            if(!req.body.country){
                return res.json({
                  status : 400,
                  message : "country is missing."  
                })
            }

            if(!req.body.phoneNumber){
                return res.json({
                  status : 400,
                  message : "phoneNumber is missing."  
                })
            }

            if(!req.body.dob){
                return res.json({
                  status : 400,
                  message : "dob is missing."  
                })
            }
            //#endregion
            
            /**checking user is already exist or not */
            const isExist = await User.findOne({$or : [{email : req.body.email}, {phoneNumber : req.body.phoneNumber}]})
            /**end */
            if(isExist){
                res.json({
                    status : 403,
                    message : 'Email or phone number is already exist.',
                    data : {}
                })
            }else{
                /**new record insert */
                let obj = {
                    ...req.body,
                    userRole : "NORMAL"
                }
                const addedUserResp = await User.create(obj)
                if(addedUserResp){
                    res.json({
                        status : 200,
                        message : "Registration has been completed.",
                        data : addedUserResp
                    })
                }else{
                    res.json({
                        status : 300,
                        message : "Something went wrong.",
                        data : {}
                    })
                }
            }
        }else{
            return res.json({
                status : 400,
                message : "Payload is missing.",
                data : {}
            })
        }
    } catch (error) {
        return res.json({
            status : 503,
            message : "Internal server error.",
            data : {}
        })
    }
})

app.post('/login', async (req, res) => {
    try {
        if(req.body){
            //#region required field validation
            if(!req.body.user){
                return res.json({
                    status : 400,
                    message : "user filed is required",
                    data : {}
                })
            }
            //#endregion

            let loginCond = {}
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.user)) {
                loginCond = { email: req.body.user};
            } else {
                loginCond = { phoneNumber: req.body.user};
            }

            const getUser = await User.findOne(loginCond).populate('country')
            if(getUser){
                if(getUser.status === 'Inactive'){
                    return res.json({
                        status : 300,
                        message : "You are not a active user. Please contact with admin.",
                        data : {}
                    })
                }else if(getUser.isDelete === 1){
                    return res.json({
                        status : 300,
                        message : "You are not a valid user. Please register again.",
                        data : {}
                    })
                }else{
                    return res.json({
                        status : 200,
                        message : "Logged in successfully.",
                        data : getUser
                    })
                }

            }else{
                return res.json({
                    status : 300,
                    message : "Email or phone number is wrong.",
                    data : {}
                })
            }
        }else{
            return res.json({
                status : 400,
                message : "Payload is missing.",
                data : {}
            })
        }
    } catch (error) {
        console.log(error, 'error')
        return res.json({
            status : 503,
            message : "Internal server error.",
            data : {}
        })
    }
})

app.get('/getCountries', async (req, res) => {
    try {
        const getLists = await Country.find().sort({name : 1})
        if(getLists.length > 0){
            return res.json({
                status : 200,
                message : "List fetched successfully.",
                data : getLists
            })
        }else{
            return res.json({
                status : 200,
                message : "List fetched failed.",
                data : []
            })
        }
    } catch (error) {
        return res.json({
            status : 503,
            message : "Internal DB error.",
            data : []
        })
    }
})

module.exports = app