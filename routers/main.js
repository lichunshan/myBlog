var express = require('express');
var md = require('markdown').markdown;
var router = express.Router();
var Category = require('../models/Category.js');
var Content = require('../models/Content.js');

router.get('/',function(req,res,next){
    //console.log("main.js中："+req.userInfo);
    //这里接受的第二个参数是
    //读取所有的分类信息
    var page = Number(req.query.page) || 0;
    var pages = 0;
    var limit = 4;
    var skip = 0;
    var category = req.query.category || '';
    var where = {};
    if(category){
        where.category = category;
    }
    Category.find().then(function(categories){
        //获取总的数据条数
        Content.count().where(where).then(function(count){
            pages = Math.ceil(count/limit);
            //取值不能超过
            page = Math.min(page,pages);
            //取值不能小于
            page = Math.max(page,1);
            skip = (page-1)*limit;
            //分页逻辑
            Content.find().where(where).limit(limit).skip(skip).populate('users').then(function(contents){
                res.render('main/index.html',{
                    userInfo:req.userInfo,
                    categories:categories,
                    contents:contents,
                    id:category,
                    count:count,
                    limit:limit,
                    pages:pages,
                    page:page
                });
            })
        })
            
    });
    
});
/**
 * 内容详情页
 */
router.get('/view',function(req,res,next){
    var contentid = req.query.contentid;
    
    Category.find().then(function(categories){
        Content.findOne({
            _id:contentid
        }).then(function(content){
            console.log(typeof md.toHTML(content.content));
            content.views++;
            content.save();
            res.render('main/view.html',{
                userInfo:req.userInfo,
                content:content,
                content_text:md.toHTML(content.content),
                categories:categories,
                comments:content.comments.reverse(),
                count:content.comments.length
            });
        });
    })
    
});
module.exports = router;