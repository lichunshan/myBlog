var express = require('express');
var router = express.Router();
var User = require('../models/Users.js');
var Category = require('../models/Category.js');
var Content = require('../models/Content.js');
router.use(function(req,res,next){
    
   if(!req.userInfo.isAdmin){
    console.log("admin"+req.userInfo.isAdmin);
        res.send("你不是管理员");
        return;
   }
   next();
});
/**
 * 后台管理首页
 */
router.get('/',function(req,res,next){
    res.render('admin/index.html',{
        userInfo:req.userInfo
    });
});

/**
 * 用户管理
 */
router.get('/user',function(req,res,next){
    /**
     * 从数据库中读取所有的注册用户的模型
     * limit(Number)限制获取的条数
     * skip(Number)忽略数据的条数
     * 每页显示2条
     * 1:1-2 skip 0 ->(当前页-1)*limit
     * 2:3-4 skip 2
     */
    var page = Number(req.query.page || 1);
    var limit = 4;
    var pages = 0;
    //获取数据总条数
    User.count().then(function(count){
        console.log(count);
        //计算总页数
        pages = Math.ceil(count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        //分页的逻辑
        User.find().limit(limit).skip(skip).then(function(users){
        console.log(users);
        res.render('admin/user_index.html',{
            userInfo:req.userInfo,
            users:users,
            page:page,
            count:count,
            limit:limit,
            pages:pages

        });
    });
    });
    
    
});
/**
 * 分类首页
 */
router.get('/category',function(req,res,next){
    var page = Number(req.query.page || 1);
    var limit = 4;
    var pages = 0;
    //获取数据总条数
    Category.count().then(function(count){
        console.log(count);
        //计算总页数
        pages = Math.ceil(count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        //分页的逻辑
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
        res.render('admin/category_index.html',{
            userInfo:req.userInfo,
            categories:categories,
            page:page,
            count:count,
            limit:limit,
            pages:pages

        });
    });
    });
    // res.render('admin/category_index.html',{
    //     userInfo:req.userInfo
    // });
});
/**
 * 添加分类
 */
router.get('/category/add',function(req,res,next){
    res.render('admin/category_add.html',{
        userInfo:req.userInfo
    });
});
/**
 * 分类的保存
 */
router.post('/category/add',function(req,res,next){
    var name = req.body.name;
    if(name == ''){
        res.render('admin/error.html',{
            userInfo:req.userInfo,
            message:'名称不能为空'
        });
        return;
    }

    //数据库中是否已经存在相同名称的分类
     Category.findOne({
         name:name
     }).then(function(rs){
         if(rs){
            //数据库中已经有了
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'已经存在了'
            });
            return Promise.reject();
         }else{
             //数据库中不存在该分类，可以保存
             return new Category({
                 name:name
             }).save();
         }
     }).then(function(newCategory){
          res.render('admin/success.html',{
              userInfo:req.userInfo,
              message:'保存成功',
              url:'/admin/category'
          });  
     });   
});

/**
 * 分类修改
 */
router.get('/category/edit',function(req,res,next){
    //获取要修改的分类信息，用表单的形式展示出来
    var id = req.query.id || '';
    //获取要修改的分类信息
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'没有找到要修改的分类信息',
            });
            return Promise.reject();
        }else{
            res.render('admin/category_edit.html',{
                userInfo:req.userInfo,
                category:category
            });
        }
    });
});

/**
 * 分类修改保存
 */
router.post('/category/edit',function(req,res,next){
    //get方式提交过来的id
    var id = req.query.id || '';
    //post方式提交过来的name
    var name = req.body.name || '';
     //获取要修改的分类信息
     Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'没有找到要修改的分类信息',
            });
            return Promise.reject();
        }else{
            //当前用户没有任何修改的时候提交
            if(name == category.name){
                res.render('admin/success.html',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            }else{
                //要修改的数据在数据库中是否已经存在
                return Category.findOne({
                    _id:{$ne:id},
                    name:name
                });
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error',{
                userInfo:req.userInfor,
                message:'数据库中已经存在同名分类'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id,
            },{
                name:name
            })
        }
    }).then(function(){
        res.render('admin/success.html',{
            userInfo:req.userInfo,
            message:'修改成功',
            url:'/admin/category'
        });
    });
});
/**
 * 分类删除
 */
router.get('/category/delete',function(req,res,next){
    //获取要删除的分类的id
    var id = req.query.id;
    Category.findOne({
        _id:id
    }).then(function(findOne){
        if(!findOne){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'没有找到对应的记录',
                url:'/admin/category'
            });
        }else{
            Category.remove({
                _id:id
            }).then(function(){
                res.render('admin/success.html',{
                    userInfo:req.userInfo,
                    message:'删除成功',
                    url:'/admin/category'
                });
            });    
        }
    });
    
});

/**
 * 内容首页
 */
router.get('/content',function(req,res,next){
    var page = Number(req.query.page || 1);
    var limit = 4;
    var pages = 0;
    //获取数据总条数
    Content.count().then(function(count){
        console.log(count);
        //计算总页数
        pages = Math.ceil(count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        //分页的逻辑
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','users']).then(function(contents){
        res.render('admin/content_index.html',{
            userInfo:req.userInfo,
            contents:contents,
            page:page,
            count:count,
            limit:limit,
            pages:pages

        });
    });
    });
    
});
/**
 * 内容添加
 */
router.get('/content/add',function(req,res,next){
    Category.find().then(function(categories){
        res.render('admin/content_add.html',{
            userInfo:req.userInfo,
            categories:categories
        });
    });
});

/**
 * 内容保存
 */
router.post('/content/add',function(req,res,next){
    //简单的验证
    if(req.body.title == ''){
        res.render('admin/error.html',{
            userInfo:req.userInfo,
            message:'内容的标题不能为空'
        });
        return;
    }
    if(req.body.description == ''){
        res.render('admin/error.html',{
            userInfo:req.userInfo,
            message:'内容的简介不能为空'
        });
        return;
    }
    //保存到数据库
    new Content({
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content,
        users:req.userInfo._id.toString()

    }).save().then(function(){
        res.render('admin/success.html',{
            userInfo:req.userInfo,
            message:'内容保存成功'
        });
    });
});
/**
 * 修改内容
 */
router.get('/content/edit',function(req,res,next){
    var id = req.query.id;
    var cateogries = [];
    Category.find().then(function(rs){
        categories = rs;
       return Content.findOne({
            _id:id
        }).populate('category');
    }).then(function(content){
        if(!content){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'要修改的内容不存在'
            });
            return Promise.reject();
        }else{
            res.render('admin/content_edit.html',{
                userInfo:req.userInfo,
                content:content,
                categories:categories
            });
        }
    });;
   
});
/**
 * 保存修改内容
 */
router.post('/content/edit',function(req,res,next){
    var id = req.body.id;
    console.log(id);
    if(req.body.title == ''){
        render('admin/error.html',{
            userInfo:req.userInfo,
            message:'内容标题不能为空'
        })
        return ;
    }
    Content.update({
        _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function(){
        res.render('admin/success.html',{
            userInfo:req.userInfo,
            message:'修改成功'
        });
    });
});
/**
 * 内容删除
 */
router.get('/content/delete',function(req,res,next){
    var id = req.query.id;
    Content.findOne({
        _id:id
    }).then(function(content){
        if(!content){
            res.render('admin/error.html',{
                userInfo:req.userInfo,
                message:'要删除的内容不存在'
            })
            return Promise.reject();
        }else{
           return Content.remove({
                _id:id
            })
        }
    }).then(function(result){
        res.render('admin/success.html',{
            userInfo:req.userInfo,
            message:'成功删除该内容',
            url:'/admin/content'
        });
    });
});
module.exports = router;