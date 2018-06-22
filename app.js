const express=require('express');
var  static=require('express-static');
const cookieParser=require('cookie-parser');
const cookieSession=require('cookie-session');
const bodyParser=require('body-parser');
const multer=require('multer');
const multerObj=multer({dest:'./static/upload'});
const consolidate=require('consolidate');
const expressRoute=require('express-route');


var server=express();
server.listen(8080);

//1.解析cookie  修改
server.use(cookieParser('sdfasl43kjoifguokn4lkhoifo4k3'));

//2.使用session
var arr=[];
for(var i=0;i<100000;i++){
  arr.push('keys_'+Math.random());
}
  
server.use(cookieSession({name: 'oa_sess_id', keys: arr, maxAge: 20*3600*1000}));

//3.post数据
server.use(bodyParser.urlencoded({extended: false}));
server.use(multer({dest: './upload'}).any());


//4.配置模板引擎
//输出什么东西 
server.set('view engine', 'html');
//模板文件放在哪儿
server.set('views', 'template');
//哪种模板引擎
server.engine('html', consolidate.ejs);

//route
server.use('/',require('./route/login.js')());

//4.static数据
server.use(static("./"));