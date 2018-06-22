const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳
//员工
module.exports=function (){
  var router=express.Router();
  const db=mysql.my_sql();

//拦截跳转	
 router.use('/',(req, res,next)=>{
	 if(req.session['sess_type']=='controller'){
				res.redirect('/controller');  
			}else if(req.session['sess_type']=='director'){
				res.redirect('/director');  
			}else if(req.session['sess_type']=='personnel'){
				next();
			}
 })
//首页	
  router.get('/', (req, res)=>{
	  var username=req.session['sess_username'];
	 
	  //查询任务表   
	   db.query(`SELECT p_number,p_name FROM project WHERE p_number IN (SELECT p_number  FROM task WHERE  account='${username}' ) `, (err, project_nb) => { 
		  if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else{
					 
 						db.query(`SELECT  *  FROM task WHERE  account='${username}' AND (state='ing' OR state='review'  OR state='ing_true');\
										SELECT * FROM log WHERE  t_number IN (SELECT  t_number  FROM task WHERE  account='${username}' ) AND state='rejected';\
										SELECT * FROM log WHERE  t_number IN (SELECT  t_number  FROM task WHERE  account='${username}' ) AND tuichi='true'`, (err, task_data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else if(task_data.length==0) {
									  res.render('./personnel/p_index.ejs',{index:"opened active",task_data}); 
									}else{	
										var i;
										var results=new Array();
										
										for ( i=0;i<task_data[0].length;i++){ 

											var from= time_format.format(task_data[0][i].wheel_s);
											var to=  time_format.format(task_data[0][i].wheel_e);

											//制作天数
											var oCycle=Math.floor((parseInt(task_data[0][i].wheel_e)-parseInt(task_data[0][i].wheel_s))/86400000*10)/10;

											//剩余制作天数
											var timestamp = Date.parse(new Date());//当前时间戳
											var oLast=Math.floor((parseInt(task_data[0][i].wheel_e)-parseInt(timestamp))/86400000*10)/10;
											 
											
											//实际耗时
											var oConsuming= task_data[0][i].consuming;
											
											//驳回次数										
											var rejected=0;
											for(var n=0;n<task_data[1].length;n++){
												if(task_data[1][n]!==""){
													if(task_data[1][n].t_number==task_data[0][i].t_number){
														rejected++;
													}	
												}
											}
											
											//推迟次数										
											var tuichi=0;
											for(var n=0;n<task_data[2].length;n++){
												if(task_data[1][n]!==""){
													if(task_data[2][n].t_number==task_data[0][i].t_number){
														tuichi++;
													}	
												}
											}
											
											//查询项目名称
											var oProject_name=null;		
											for( var n=0;n<project_nb.length;n++){
												if(project_nb[n].p_number==task_data[0][i].p_number){
												   	oProject_name=	project_nb[n].p_name;
												   }
											}
											 
											//未完成进度
											var unfinished=100-parseInt(task_data[0][i].t_plan);
											
											results.push({"from":from,"from":from,"to":to,"cycle":oCycle,"last":oLast,"consuming":oConsuming,"project_name":oProject_name,"unfinished":unfinished,"rejected":rejected,"tuichi":tuichi});

											if(parseInt(i)+1==task_data[0].length){
 
											res.render('./personnel/p_index.ejs',{index:"opened active",task_data,results});   

											};
										}
										if(task_data[0].length==0){
											res.render('./personnel/p_index.ejs',{index:"opened active",task_data});      
										   }
									}
						}); 
			
					}
	  });

  });

//创建任务-get
 router.get('/create', (req, res)=>{
	   var username=req.session['sess_username'];
	    db.query(`SELECT * FROM project WHERE head="${username}" OR FIND_IN_SET('${username}',team)`, (err, project) => { 
		  if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
					res.render('./personnel/create.ejs',{create:"opened active",project:project});   	
					}
	  });
	 
  });

	
//创建任务-post
  router.post('/create', (req, res)=>{
	  	      var oName=req.body.name;//开始时间
	          var oT_number=parseInt(Date.parse(new Date()));//任务单序号
	   		  var oP_number =parseInt(req.body.pr_name.split("-")[1]);//项目序号
	          var oTime_from =req.body.time_from;//开始时间
	          var oTime_to =req.body.time_to;//结束时间
	          var oVal_path =req.body.val_path ;//[验证标准]路径
	          var oDetailed=req.body.detailed;//详细任务内容
	  		  var oState ="review";//当前默认状态  		  
	  		  var oAccount=req.session['sess_username'];//上传账号名
	     			 //添加
						db.query(`INSERT INTO task (t_name,t_number,p_number,wheel_s,wheel_e,val_path,detailed,state,consuming,account,tc,bh) VALUE('${oName}','${oT_number}','${oP_number}','${oTime_from}','${oTime_to}','${oVal_path}','${oDetailed}','${oState}','0','${oAccount}','0','0')`, (err, data) => {
							if (err) {
								console.error(err);
								res.status(500).send('database error').end();
							} else {
								 res.send({resultCode:200}).end();
							}
						});
  });	
 
//已完成任务
router.use('/create_list',require('./create_list.js')());	

 //route-[进行中]任务详细
router.use('/task',require('./task.js')());
	
 //route-项目列表
router.use('/project',require('./project.js')());
	
 //route-账号修改
router.use('/account',require('./account.js')());	

  return router;
};
