function GesturesPstart(canvasID,minNum,circleNum){
    var GesturesPasswordtest = new GesturesPassword(canvasID,minNum,circleNum);
    //初始化
    GesturesPasswordtest.init(GesturesPasswordtest);
}
var Circle = function(x, y, r, lineWidth){
    this.x = x;
    this.y = y;
    this.r = r;
    this.lineWidth = lineWidth;
}
Circle.prototype = {
    //画圆圈
    draw: function(obj){
        if(this.x == null || this.x == undefined  || this.y == null || this.y == undefined){
            alert("没有正确的圆心");
            return false;
        }
        if(this.r == null || this.r == undefined || this.r <= 0){
            alert("半径必须大于0,且必须有意义");
            return false;
        }
        obj.lineWidth = this.lineWidth;
        obj.beginPath();
        obj.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        obj.stroke();
    },
    //判断获取的坐标是否在圆内
    contain: function(x, y){
        return this.x - this.r < x && this.x + this.r > x
            && this.y - this.r < y && this.y + this.r > y;
    },
    //判断两次输入的圆心以及半径是否相同
    equals: function(lastcircle){
        return this.x == lastcircle.x && this.y == lastcircle.y && this.r == lastcircle.r;
    }
}
//点坐标
var Point = function(x, y){
    this.x = x;
    this.y = y;
}
var GesturesPassword = function(canvasID,minNum,circleNum){
    this.canvasID = canvasID;
    this.canvas = document.getElementById(this.canvasID);  //关联canvas元素
    this.context = this.canvas.getContext('2d');  //所关联canvas元素上下文对象
    this.minSelected = (minNum == undefined ? 3 : minNum);//选择点数量
    this.circleNum = (circleNum == undefined ? 3 : circleNum);//每行圆的个数
    //鼠标按下监听
    this.mousePressed = false;//是否按下标志
    this.circles = [];
    this.selectedCircles = [];  //本次滑动的手势
    this.lastSelectedCircles = [];  //上次滑动的手势
    this.radioValue;//设置密码验证密码标志
}
GesturesPassword.prototype = {
    //初始化
    init: function(Obj){
        if(this.canvasID == null){
            document.getElementById('prompt').innerHTML ="必须传入画图区域ID";
            return false;
        }
        //初始化监听事件
        this.initEvent(Obj);
        //画圆
        this.initCircles();
        //每次初始化都清空localStorage的数值
        localStorage.clear();
    },
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
    },
    //鼠标放下
    Mousedown: function(e){
        e.preventDefault();
        if(document.getElementById("SetPwd1").checked) {
            this.radioValue="setPwd";
        }
        if(document.getElementById("Verify1").checked) {
            this.radioValue="Verify";
        }

        this.mousePressed = true;
        this.selectedCircles = [];  //每次滑动之前都先清除上次的手势
    },
    //手势移动
    Mousemove: function(e){
        var _this=this;
        if(this.mousePressed == false){
            return;
        }
        this.slideOverCircle(e);
        this.reDraw();
        if(this.selectedCircles.length > 0){
            var start = this.selectedCircles[this.selectedCircles.length - 1];
            var end = this.getCursorPosition(e);
            this.drawLine(start, end);
        }
    },
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
    },
    //初始化圆
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
    },
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
    },
    //画线
    drawLine: function(start, end){
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
    },
    reDraw: function(){
        this.clearCanvas();
        for(var i = 0; i < this.circles.length; i++){
            this.circles[i].draw(this.context);
        }
        for(var i = 1; i < this.selectedCircles.length; i++){
            this.drawLine(this.selectedCircles[i - 1], this.selectedCircles[i]);
        }
    },
    //获取当前点的坐标
    getCursorPosition: function(e){
        var point;
        e.preventDefault();
        var touch = event.targetTouches[0];
        var x = touch.pageX - this.canvas.offsetLeft;
        var y = touch.pageY - this.canvas.offsetTop;
        point = new Point(x, y);
        return point;
    },
    clearCanvas: function(){
        this.context.fillStyle = "#F0F0F2";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    }
}
window.onload=function(){
    //canvas 区域ID  最短路径  每行点数
    GesturesPstart('thecanvas',5,3);
}

