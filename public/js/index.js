
$(function(){
    
    //切换登陆和注册
    $('.login').find('a.small').click(function(){
        
        $('.zhuce').show();
        $('.login').hide();
    });
    $('.zhuce').find('a.small').click(function(){
        
        $('.zhuce').hide();
        $('.login').show();
    });
    // 注册
    $('#zhuce-submit').click(function(){
        //通过ajax提交请求
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username:$('.zhuce').find('[name="z-username"]').val(),
                password:$('.zhuce').find('[name="z-password"]').val(),
                repassword:$('.zhuce').find('[name="z-repassword"]').val(),    
            },
            dataType:'json',
            success:function(result){
                $('.message').html(result.message);
                //注册成功
                if(!result.code){
                    setTimeout(function(){
                        $('.zhuce').hide();
                        $('.login').show();
                    },1000);
                }
            }
        });
    });


    //登陆
    $('#login-submit').click(function(){
        $.ajax({
            type:'post',
            url:'/api/user/login',
            data:{
                username:$('.login').find('[name="username"]').val(),
                password:$('.login').find('[name="password"]').val()
            },
            dataType:'json',
            success:function(result){
                console.log(result);
                console.log($('.login').find('[username="username"]').val());
                //如果result.code=0则登陆成功
                $('.login-message').html(result.message);
                //登陆成功
                if(!result.code){
                    setTimeout(function(){
                        $('#user-name').html(result.userInfo.name);
                        window.location.reload();
                    },1000);
                }

            }
        });
    });
    //退出
    $('#logout').click(function(){
        $.ajax({
            url:'/api/user/logout',
            success:function(result){
                if(!result.code){
                    $('.logout-message').html(result.message);
                    setTimeout(function(){
                        window.location.reload();
                    },1000);
                }
            }

        });
    });
})