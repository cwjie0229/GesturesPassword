# 手势密码

	

实现原理 利用HTML5的canvas，将解锁的圈圈划出，利用touch事件解锁这些圈圈。

    创建解锁点
     initCircles: function(){
            var x = this.canvas.width / (this.circleNum + 1);
            var y = this.canvas.height / (this.circleNum + 1);
            var r = Math.min(x, y) / 4;
            for(var i = 1; i <= this.circleNum; i++){
                for(var j = 1; j <= this.circleNum; j++){
                    var circle = new Circle(x * i, y * j, r);
                    circle.draw(this.context);
                    this.circles.push(circle);
                }
            }
        }
canvas 里面的圆圈画好之后，进行事件绑定

     //初始化监听事件
        initEvent: function(Obj){
            this.canvas.width = 300;
            this.canvas.height = 300;

            this.radioValue="setPwd";
            //初始化canvas监听事件
            this.canvas.addEventListener('touchstart',function(e){
                Obj.Mousedown(e);
            })
            this.canvas.addEventListener('touchmove',function(e){
                Obj.Mousemove(e);
            })
            this.canvas.addEventListener('touchend',function(e){
                Obj.Mouseup(e);
            })
           //初始化监听选中input[radio]事件
            document.getElementById("SetPwd").addEventListener('touchstart',function(){
            })
            document.getElementById("SetPwd").addEventListener('touchend',function(){
                localStorage.clear();
                document.getElementById('title').innerHTML ="绘制解锁图案";
                document.getElementById('prompt').innerHTML ="";

            })
            document.getElementById("Verify").addEventListener('touchstart',function(){
            })
            document.getElementById("Verify").addEventListener('touchend',function(){
                if(localStorage.getItem('password')==null){
                    document.getElementById('title').innerHTML ="您没有设定密码";
                }else{
                    document.getElementById('title').innerHTML ="解锁密码";
                }
            })
接下来就是最主要的逻辑部分：通过touchmove事件的不断触发，调用canvas的moveTo方法和lineTo方法来画出折线，同时判断是否达到画的圈圈里面，其中selectedCircles保存当前保存的路径，lastSelectedCircles保存上次保存的手势路径。

           //获取当前点的坐标
           getCursorPosition: function(e){
               var point;
               e.preventDefault();
               var touch = event.targetTouches[0];
               var x = touch.pageX - this.canvas.offsetLeft;
               var y = touch.pageY - this.canvas.offsetTop;
               point = new Point(x, y);
               return point;
           }
           //若滑过节点，则记录该节点，并画出最近两个节点之间的线段
           slideOverCircle: function(e){
               var cursorPosition = this.getCursorPosition(e);
               //若该节点已经记录过，则放弃
               for(var i = 0; i < this.selectedCircles.length; i++){
                   if(this.selectedCircles[i].contain(cursorPosition.x, cursorPosition.y)){
                       return;
                   }
               }
               for(var i = 0; i < this.circles.length; i++){
                   if(this.circles[i].contain(cursorPosition.x, cursorPosition.y)){
                       this.selectedCircles.push(this.circles[i]);
                   }
               }
           }

           逻辑处理都放到函数 Mouseup中

           //鼠标离开
            Mouseup: function(e){
                   var _this=this;
                   this.mousePressed = false;
                   var info = "";
                   //判断是否保存密码
                   if(localStorage.getItem('password') == null){
                       //判断存储的点是否满足要求
                       if(this.selectedCircles.length < this.minSelected){
                           this.selectedCircles = [];
                           document.getElementById('prompt').innerHTML ="选中节点数不能小于" + this.minSelected;
                       }
                       //判断是否第一次绘制
                       else if(this.lastSelectedCircles.length != 0){
                           var _this=this;
                           if(this.selectedCircles.length != this.lastSelectedCircles.length){
                               this.lastSelectedCircles = [];
                               document.getElementById('prompt').innerHTML ="两次手势不一样，请重置。";
                               this.lastSelectedCircles=this.selectedCircles= [];
                               this.reDraw();
                           }
                           else{
                               for(var i = 0; i < this.selectedCircles.length; i++){
                                   if(!this.selectedCircles[i].equals(this.lastSelectedCircles[i])){
                                       document.getElementById('prompt').innerHTML ="两次手势不一样，请重置。";
                                       this.lastSelectedCircles=this.selectedCircles= [];
                                       this.reDraw();
                                       break;
                                   }else{
                                       //保存密码

                                       localStorage.setItem('password', JSON.stringify(this.lastSelectedCircles));

                                       document.getElementById('prompt').innerHTML ="密码保存成功";
                                       this.context.strokeStyle="green";
                                       //清空解锁手势
                                       this.lastSelectedCircles=this.selectedCircles= [];
                                       break;
                                   }
                               }
                           }
                       }
                       //首次绘制，存储解锁手势
                       else{
                           //首次保存上次解锁手势
                           this.lastSelectedCircles = this.selectedCircles;
                           document.getElementById('prompt').innerHTML ="请再次输入";
                           this.reDraw();
                           this.selectedCircles= [];
                       }
                   }
                   else{
                       if(this.radioValue!="setPwd"){
                           if(JSON.stringify(this.selectedCircles)==localStorage.getItem('password')){
                               document.getElementById('prompt').innerHTML ="密码正确";
                               this.selectedCircles= [];
                               this.context.strokeStyle="green";
                           }else{
                               document.getElementById('prompt').innerHTML ="验证密码不正确";
                               this.context.strokeStyle="red";
                               this.selectedCircles= [];
                           }
                       }else{
                           document.getElementById('prompt').innerHTML ="您已保存密码,请进行验证密码";
                           document.getElementById("Verify1").checked=true;
                               this.radioValue="Verify1";

                           this.lastSelectedCircles=this.selectedCircles= [];
                       }
                   }
                   this.reDraw();  //为去掉最后的直线，需要重画。
                   this.context.font="14px";
                   this.context.strokeStyle="#0000ff";
               }
            //启动函数
             //canvas 区域ID  最短路径  每行点数
                GesturesPstart('thecanvas',5,3);

参考资料1 [https://www.nihaoshijie.com.cn/index.php/archives/537](https://www.nihaoshijie.com.cn/index.php/archives/537 "参考资料")

参考资料1 [http://www.cnblogs.com/xiaoxingyiyi/p/5447378.html](http://www.cnblogs.com/xiaoxingyiyi/p/5447378.html "移动端h5页面touch事件与点击穿透问题")

参考资料2[http://www.jq22.com/jquery-plugins%E5%AF%86%E7%A0%81-1-jq](http://www.jq22.com/jquery-plugins%E5%AF%86%E7%A0%81-1-jq "Jquery手势密码插件")

