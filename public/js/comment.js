//提交评论
$('#btn').click(function(){
    var neirong = $("#input").val();
    if(!neirong){
        alert("评论内容不能为空");
        $("#input").val();
    }else if(neirong.indexOf('<')!=-1){
        alert("不能包含特殊字符");
    }else{
        $.ajax({
            type:'POST',
            url:'/api/comment/post',
            data:{
                contentid:$("#btn_top").val(),
                content:$("#input").val()
            },
            success:function(responseData){
                $("#input").val();
                renderComment(responseData.data.comments.reverse());
            }
        })
    }
    
});


function renderComment(comments){
    var html = '';
    for(var i = 0; i<comments.length; i++){
        html+=`<div class="in_four">
        <div class="in_four_top">
            <span class="left">${comments[i].username}</span>
            <span class="right">${comments[i].postTime}</span>
        </div>
        <p class="comment_content">
                ${comments[i].content}
        </p>
    </div>`;
    }
    $('#comment').html(html);
    $('em').html(comments.length);
}