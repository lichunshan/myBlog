var express = require('express');
var router = express.Router();
//引入模型类
var Users = require('../models/Users.js');
var Content = require('../models/Content.js');
//返回统一格式
var responseData;
router.use(function(req,res,next){
    responseData = {
        code:0,
        message:'',
        userInfo:{}
    }
    next();
});
/**
 * 用户注册逻辑
 * 1、用户名不能为空
 * 2、密码不能为空
 * 3、两次密码是否一致
 * 
 * 1、用户名是否已经被注册
 *      数据库的查询
 */
router.post('/user/register',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    //用户名是否为空
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        //将错误的信息返回给前端
        res.json(responseData);
        //停止代码的执行
        return;
    }
    //密码不能为空
    if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        //将错误的信息返回给前端
        res.json(responseData);
        //停止代码的执行
        return;
    }
    //两次输入的密码不一致
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        //将错误的信息返回给前端
        res.json(responseData);
        //停止代码的执行
        return;
    }
    //用户名是否已经被注册
    Users.findOne({
        username:username
    }).then(function(userInfo){
        if(userInfo){
            //表示数据库中有该记录
            responseData.code = 4;
            responseData.message = '用户名已经被注册';
            res.json(responseData);
            return;
        }
        //保存用户输入的信息到数据库中
        var user = new Users({
            username:username,
            password:password
        });
        return user.save();

    }).then(function(newUserInfo){
        console.log(newUserInfo);
        responseData.message = '注册成功';
        res.json(responseData);
    });
    
});

/**
 * 用户登陆逻辑
 * 1、数据库中是否能找到该用户
 * 2、该用户的密码是否与输入的密码匹配
 * 
 */
router.post('/user/login',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;
    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名密码不能为空';
        res.json(responseData);
        return;
    }
    //查询数据库中相同用户名和密码是否存在
    Users.findOne({
        username:username,
        password:password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或者密码错误';
            res.json(responseData);
            return;
        }
        //用户名和密码是真确的
        responseData.code = 0;
        responseData.message = '登陆成功';
        responseData.userInfo ={
            name:userInfo.username,
            _id:userInfo._id
        };
        req.cookies.set('userInfo',JSON.stringify({
            name:userInfo.username,
            _id:userInfo._id
        }));
        res.json(responseData);
    })
});

/**
 * 用户退出逻辑
 */
router.get('/user/logout',function(req,res,next){
    req.cookies.set('userInfo',null);
    responseData.code = 0;
    responseData.message = '退出成功';
    res.json(responseData);
});
/**
 * 评论提交
 */
router.post('/comment/post',function(req,res){
    //内容的id
    var contentid = req.body.contentid || '';
    var postData = {
        username:req.userInfo.name,
        postTime:new Date(),
        content:req.body.content
    }
    //查询当前这篇内容的信息
    Content.findOne({
        _id:contentid
    }).then(function(content){
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent){
        responseData.message = "评论成功";
        responseData.data = newContent;
        res.json(responseData);
    })
});
module.exports = router;