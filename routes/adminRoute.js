import express from "express"
import mongoose from "mongoose"
import User from "../schema/User"
import Country from "../schema/Country"

let app = express.Router()
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/', async (req, res) => {
    const msg = req.flash('loginMessage')[0];
    res.render('loginView',{layout: '', message: msg});
})

app.post('/login', async (req, res) => {
    try {
        if(req.body){
            const adminDetail = await User.findOne({email : req.body.email, status : "Active", userRole : "ADMIN"})
            if(adminDetail){
                res.redirect('/userManagement')
            }else{
                req.flash('loginMessage', "Email is wrong.")
                res.redirect('/')
            }
        }else{
            res.status(400).send('Payload is missing.')
        }
    } catch (error) {
        res.status(500).send('Something went wrong.')
    }
})

app.get('/userManagement', async (req, res) => {
    const getAllUser = await User.find({userRole : "NORMAL", isDelete : 0}).populate('country').sort({_id : -1})
    
    const msg = req.flash('Success')[0];
    const errorMessage = req.flash('Error')[0];
    
    res.render('userManagement', {layout : '', users : getAllUser, message : msg, errorMessage : errorMessage})
})

app.get('/delete/:id', async(req, res) => {
    const getUserDetail = await User.findById(req.params.id)
    if(getUserDetail){
        getUserDetail.isDelete = 1
        await getUserDetail.save()

        req.flash('Success', "User deleted successfully.")
        res.redirect('/userManagement')
    }else{
        req.flash('Error', "Something went wrong.")
        res.redirect('/userManagement')
    }
})

app.get('/changeStatus/:id', async (req, res) => {
    const getUserDetail = await User.findById(req.params.id)
    if(getUserDetail){
        if(getUserDetail.status === 'Active'){
            getUserDetail.status = 'Inactive'
        }else{
            getUserDetail.status = 'Active'
        }
        await getUserDetail.save()

        req.flash('Success', "User status changed successfully.")
        res.redirect('/userManagement')
    }else{
        req.flash('Error', "Something went wrong.")
        res.redirect('/userManagement')
    }
})

app.get('/edit/:id', async (req, res) => {
    const getUserDetail = await User.findById(req.params.id).populate('country')
    console.log(getUserDetail,'getUserDetail')
    const getLists = await Country.find().sort({name : 1})
    if(getUserDetail){
        res.render('editUser', {layout : '', user : getUserDetail, countryLists : getLists})
    }else{
        req.flash('Error', "Something went wrong.")
        res.redirect('/userManagement')
    }
})

app.post('/edit/submit/:id', async(req, res) => {
    const getUserDetail = await User.findById(req.params.id)
    if(getUserDetail){
        getUserDetail.firstName = req.body.firstName ? req.body.firstName : getUserDetail.firstName
        getUserDetail.lastName = req.body.lastName ? req.body.lastName : getUserDetail.lastName
        getUserDetail.email = req.body.email ? req.body.email : getUserDetail.email
        getUserDetail.address = req.body.address ? req.body.address : getUserDetail.address
        getUserDetail.state = req.body.state ? req.body.state : getUserDetail.state
        getUserDetail.city = req.body.city ? req.body.city : getUserDetail.city
        getUserDetail.country = req.body.country ? req.body.country : getUserDetail.country
        getUserDetail.phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : getUserDetail.phoneNumber
        getUserDetail.dob = req.body.dob ? req.body.dob : getUserDetail.dob

        await getUserDetail.save()

        req.flash('Success', "User has been updated successfully.")
        res.redirect('/userManagement')
    }else{
        req.flash('Error', "Something went wrong.")
        res.redirect('/userManagement')
    }
})

app.post('/search', async (req, res) => {
    const searchData = {$regex : req.body.searchBy, $options: "i"}
    const getAllUser = await User.find({$or : [{firstName : searchData}, {lastName : searchData}, {email : searchData}, {status : searchData}]}).sort({_id : -1})
    
    const msg = req.flash('Success')[0];
    const errorMessage = req.flash('Error')[0];
    
    res.render('userManagement', {layout : '', users : getAllUser, message : msg, errorMessage : errorMessage})
})

module.exports = app