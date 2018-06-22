const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳

//账号管理
module.exports=function (){
  var router=express.Router();
  const db=mysql.my_sql();
	
//账号列表
 router.get('/', (req, res)=>{
	  var username=req.session['sess_username'];
	 
	  //查询任务表-查询待审核-有审核申请的  
	  	db.query(`SELECT * FROM eadmin WHERE type!="director";`, (err, data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else {
									  res.render('./director/account_list.ejs',{account_task:"ok",data});   
									} 
						})
	 	}); 
	
//新建账号
 router.get('/add', (req, res)=>{
	 
	  res.render('./director/account_add.ejs',{account_task:"ok"}); 
	 
	 	}); 

//新建账号
router.post('/add', (req, res)=>{
	  	     var oUsername=req.body.username;
	  	     var oPassword =req.body.password;
	  	     var oName_zh =req.body.name_zh;
	  	     var oType =req.body.type;
			var oState ="ing";
	     			 //添加-次日计划
	  			db.query(`INSERT INTO eadmin (username,password,name_zh,type,state) VALUE  ('${oUsername}','${oPassword}','${oName_zh}','${oType}','${oState}')`, (err, data) => {
										if (err) {
											console.error(err);
											res.status(500).send('database error').end();
										} else {
											 res.send({resultCode:200}).end();
										}
									});	
  });		

	
//修改账号
 router.get('/mod', (req, res)=>{
	 var oID=req.query.id;
	  	  //查询账号信息
	  	db.query(`SELECT * FROM eadmin WHERE id="${oID}";`, (err, data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else {
									  res.render('./director/account_mod.ejs',{account_task:"ok",data});   
									} 
						})
	 
	 	}); 	
	
//离职
router.post('/leave', (req, res)=>{
			var oID=req.body.id;
	     			 
	  			db.query(`UPDATE eadmin SET  state='leave' WHERE id='${oID}'`, (err, data) => {
										if (err) {
											console.error(err);
											res.status(500).send('database error').end();
										} else {
											 res.send({resultCode:200}).end();
										}
									});	
  });	
	
//修改账号
router.post('/mod', (req, res)=>{
			var oID=req.body.id;
	  	     var oPassword =req.body.password;
	  	     var oName_zh =req.body.name_zh;
	     			 
	  			db.query(`UPDATE eadmin SET  password='${oPassword}',name_zh='${oName_zh}'  WHERE id='${oID}'`, (err, data) => {
										if (err) {
											console.error(err);
											res.status(500).send('database error').end();
										} else {
											 res.send({resultCode:200}).end();
										}
									});	
  });	
	
	
//修改个人账号
 router.get('/setting', (req, res)=>{
	  var username=req.session['sess_username'];
	  	  //查询账号信息
	  	db.query(`SELECT * FROM eadmin WHERE username="${username}";`, (err, data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else {
									  res.render('./director/account_setting.ejs',{account_task:"ok",data});   
									} 
						})
	 	}); 	
	
//修改个人账号
router.post('/setting', (req, res)=>{
			var username=req.session['sess_username'];
	  	     var oPassword =req.body.password;
	  	     var oName_zh =req.body.name_zh;
	     			 
	  			db.query(`UPDATE eadmin SET  password='${oPassword}',name_zh='${oName_zh}'  WHERE username='${username}'`, (err, data) => {
										if (err) {
											console.error(err);
											res.status(500).send('database error').end();
										} else {
											 res.send({resultCode:200}).end();
										}
									});	
  });		
  return router;
};
