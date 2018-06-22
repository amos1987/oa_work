const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳
//主管
module.exports=function (){
  var router=express.Router();
  const db=mysql.my_sql();

//拦截跳转	
 router.use('/',(req, res,next)=>{
	 if(req.session['sess_type']=='controller'){
				next();
			}else if(req.session['sess_type']=='personnel'){
				res.redirect('/personnel');  	
			}else if(req.session['sess_type']=='director'){
				res.redirect('/director');  	
			}
 })	    
	
//首页
 router.get('/', (req, res)=>{
	  var username=req.session['sess_username'];
	 
	  //查询任务表-查询待审核-有审核申请的  
	  	db.query(`SELECT p_number,p_name FROM project;\
						SELECT  *  FROM task WHERE  (state='ing_true' OR state='review') AND account!='${username}' AND p_number IN (SELECT p_number FROM project WHERE head="${username}");\
						SELECT * FROM eadmin;\
						`, (err, task_data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									}else if(task_data[1].length==0){
											res.render('./controller/c_index.ejs',{nav_index:"ok",task_data});    
									}else{	
										var i;
										var results=new Array();
										for ( i=0;i<task_data[1].length;i++){ 

											var from= time_format.format(task_data[1][i].wheel_s);
											var to=  time_format.format(task_data[1][i].wheel_e);

											//制作天数
											var oCycle=Math.floor((parseInt(task_data[1][i].wheel_e)-parseInt(task_data[1][i].wheel_s))/86400000*10)/10;

											//剩余制作天数
											var timestamp = Date.parse(new Date());//当前时间戳
											var oLast=Math.floor((parseInt(task_data[1][i].wheel_e)-parseInt(timestamp))/86400000*10)/10;
											if(oLast<0){oLast=0; }

											//实际制作天数
											var oActual=Math.floor((parseInt(timestamp)-parseInt(task_data[1][i].wheel_s))/86400000*10)/10;
											
											//查询项目名称
											var oProject_name=null;		
											for( var n=0;n<task_data[0].length;n++){
												if(task_data[1][i].p_number==task_data[0][n].p_number){
												   	oProject_name=	task_data[0][n].p_name;
												   }
											}
											 
											//查询申请人
											var oName_zh=null;		
											for( var n=0;n<task_data[2].length;n++){
												console.log(task_data[2][n].name_zh);
												if(task_data[2][n].username==task_data[1][i].account){
												   	oName_zh=	task_data[2][n].name_zh;
												   }
											}
											
											//未完成进度
											var unfinished=100-parseInt(task_data[1][i].t_plan);
											
											results.push({"from":from,"to":to,"cycle":oCycle,"last":oLast,"actual":oActual,val_path:task_data[1][i].val_path,"project_name":oProject_name,"unfinished":unfinished,"oName_zh":oName_zh});

											if(parseInt(i)+1==task_data[1].length){
 											
											res.render('./controller/c_index.ejs',{nav_index:"ok",task_data,results});   

											};
										}
									}
						})
	 	}); 
	
	
 //首页-任务审核
 router.get('/i_shen', (req, res)=>{
	 db.query(`SELECT * FROM task WHERE  id=${req.query.id};SELECT p_number,p_name FROM project WHERE  p_number  IN (SELECT p_number  FROM task WHERE   id=${req.query.id});SELECT  p_number,p_name FROM project;`, (err, data) => { 
	 	  if (err) {
				console.error(err);
				res.status(500).send('database error').end();
		}else{
			console.log(data);
			var from= time_format.format(data[0][0].wheel_s);
			var to=  time_format.format(data[0][0].wheel_e);
			 res.render('./controller/i_shen.ejs',{data,from,to,nav_index:"ok"});   
		}
	 });
	 
 })	

 //首页-任务删除
 router.get('/i_shen_dele', (req, res)=>{
	 
       db.query(`DELETE FROM task WHERE ID=${req.query.id}`, (err, data)=>{
          if(err){
            console.error(err);
            res.status(500).send('database error').end();
          }else{
             res.send({resultCode:200}).end();
          }
        });
	 
 })	
	
 //首页-任务修改
 router.post('/i_shen_mod', (req, res)=>{
	 
       db.query(`UPDATE task SET t_name='${req.body.t_name}',p_number='${req.body.p_number}',wheel_s='${req.body.wheel_s}',wheel_e='${req.body.wheel_e}',val_path='${req.body.val_path}',detailed='${req.body.detailed}',state='${req.body.state}'  WHERE id=${req.body.id}`, (err, data)=>{
          if(err){
            console.error(err);
            res.status(500).send('database error').end();
          }else{
             res.send({resultCode:200}).end();
          }
        });
	 
 })		
 
 //首页-日志审核
router.use('/i_task',require('./i_task.js')());
	
 //route-主管-审核
router.use('/project',require('./project.js')());

 //route-员工进行中的任务
router.use('/task_ing',require('./task_ing.js')());
	
 //route-主管-任务
router.use('/task_self',require('./task_self.js')());

//route-账号设置
router.use('/account',require('./account.js')());
  return router;
};
