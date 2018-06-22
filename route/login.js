const express=require('express');
const  mysql=require('../libs/mysql');

module.exports=function (){
var router=express.Router();
var db=mysql.my_sql();

	
//检查登陆状态
 router.use('/',(req, res,next)=>{
     if(req.session['sess_username']==undefined && req.url!=='/login' && req.url.split("/")[1]!=="www"  ){
      res.redirect('/login');
     }else{	 
     	 next();
     }
  });
 
 router.get('/',(req, res,next)=>{
		 if(req.session['sess_type']=='controller'){
				res.redirect('/controller');  
			}else if(req.session['sess_type']=='personnel'){
				res.redirect('/personnel');  	
			}else if(req.session['sess_type']=='director'){
				res.redirect('/director');  	
			}
 });	
	
//登录get请求	
  router.get('/login',(req, res)=>{

	 if(req.session['sess_username']!==undefined){ 
		 res.redirect('/');  
	 }else{
		 res.render('login.ejs',{});   
	 } 
  }); 
	
//登录post请求		
  router.post('/login', (req, res)=>{
	 var username=req.body.username;
	 var password=req.body.passwd;
     db.query(`SELECT * FROM eadmin WHERE username='${username}'`,(err,data)=>{
		if(err){
		   res.status(500).send('database error');
			console.log('请求数据库失败----:');
			console.log(err);
		   } else{
			if(data.length==0){
			  res.send({accessGranted:false,masg:"账号"});
			   }else{
				  
				if(data[0].password==password){
				   //成功
				   req.session['sess_username']=data[0].username;
				   req.session['sess_type']=data[0].type;
				   res.send({accessGranted:true,sess_type:data[0].type});
				   }else{
				   res.send({accessGranted:false,masg:"密码"});	   
				   } 
			   }	    
		   }
	 });
  });
	
	
//姓名
  router.post('/login/name', (req, res)=>{	
	  
  	     db.query(`SELECT name_zh FROM eadmin WHERE username='${req.session['sess_username']}'`,(err,data)=>{
			if(err){
			   res.status(500).send('database error');
				console.log('请求数据库失败----:');
				console.log(err);
			   } else{ 
				   console.log(data[0]);
				  res.send({name:data[0]});	 	
			   }
	 });
  });
	
//退出账号
  router.get('/login/clear', (req, res)=>{	
	    //删除Cookie   
  		 res.clearCookie("oa_sess_id");
  		 res.clearCookie("oa_sess_id.sig");
 		 res.redirect('/');  
  });	
	
//route-主管
router.use('/controller',require('./controller/c_index.js')());
 
//route-员工
router.use('/personnel',require('./personnel/p_index.js')());
	
//route-总监
router.use('/director',require('./director/d_index.js')());
		
	
return router;
};
  