const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳

//账号管理
module.exports=function (){
  var router=express.Router();
  const db=mysql.my_sql();
	
 
	
//修改个人账号
 router.get('/setting', (req, res)=>{
	  var username=req.session['sess_username'];
	  	  //查询账号信息
	  	db.query(`SELECT * FROM eadmin WHERE username="${username}";`, (err, data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else {
									  res.render('./personnel/account_setting.ejs',{account_task:"ok",data});   
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
