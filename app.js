/**
 * 应用程序启动入口
 */
//加载experss模块
 var express = require('express');
 //加载模版模块
 var swig = require('swig-templates');
 //加载数据库模块
 var mongoose = require('mongoose');
 //加载body-parser用来加载post提交过来的数据
 var bodyParser = require('body-parser');
 //加载cookies模块
 var Cookie = require('cookies');
 //加载用户模型
 var User = require('./models/Users.js');
 var markdown = require('markdown');
 //创建app应用 等同于nodejs中的http.createServer();
 var app = express();
 //设置静态文件托管
 //当用户访问的url以/public开始，那么直接返回对应的__dirname+'/public'这个目录下的文件
 app.use('/public',express.static(__dirname+'/public'));
 /**
  * 配置应用模版
  第一个参数：表示模版引擎的参数，同时也是文件的后缀
  第二个参数：表示用于解析处理模版内容的方法
  */
 app.engine('html',swig.renderFile);  
 

 //设置模版文件存放的目录,第一个参数必须是views，第二个参数是目录
 app.set('views','./views'); 
 //设置模版引擎,注册所使用的模版引擎，第一个参数必须是view engine，第二个参数和这个方法当中定义的模版引擎中的第一个参数一致
 app.set('view engine','html');
 //在开发过程当中需要取消模版缓存
 swig.setDefaults({cache:false});
 /**
  * 首页
  req：request保存客户端请求的相关的一些数据
  res：respoe服务器端输出对象，提供了服务器端输出的一些方法
  next：方法，用于执行下一个和路径匹配的函数
  内容输出：通过res.send(string)发送内容至客户端
  */
//   app.get('/',function(req,res,next){
//       //res.send('<h1>欢迎光临我的博客</h1>');
//       /**
//        * 读取views目录下的指定文件，解析并返回给客户端
//        * 第一个参数：表示模版文件，相对与views目录,默认添加扩展名
//        * 第二个参数：传递给模版使用的数据
//        */
//       res.render('index');  
//   });
  /**
   * 根据不同的功能划分模块
   */
  //body-parser设置
app.use(bodyParser.urlencoded({extended:true}));
//设置cookie
app.use(function(req,res,next){
    req.cookies = new Cookie(req,res);
    //解析登陆用户的cookie信息
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            //获取当前登陆的用户是否是管理员
            User.findById(req.userInfo._id).then(function(result){
                req.userInfo.isAdmin = Boolean(result.isAdmin);
               next();
            });
        }catch(e){
            next();
        }

    }else{
        next();     
    }
    
});

app.use('/admin',require('./routers/admin.js'));
app.use('/api',require('./routers/api.js'));
app.use('/',require('./routers/main.js'));
//连接数据库
//这里端口好后面的blog是数据库的名字
mongoose.connect('mongodb://localhost:27018/blog',function(err){
    if(err){
        console.log("数据库连接失败");
    }else{
        console.log("数据库连接成功");
        //监听http请求
        app.listen(8081);
        console.log("已经监听了8081端口");
    }
});


 /**
  * 用户发送http请求->url->路由解析->找到匹配的规则->执行指定的绑定函数，返回对应内容至用户
  /public->静态->直接读取指定目录下的文件，返回给用户
  ->动态->处理业务逻辑，加载模版，解析模版，返回数据给用户
  */