const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳

module.exports=function (){
	var router=express.Router();
	const db=mysql.my_sql();
	
	
	
//按任务搜 get
 router.get('/job', (req, res)=>{
	 	db.query(`SELECT  p_name,p_number  FROM  project ;\
						SELECT  name_zh  FROM  eadmin WHERE type!="director" AND state!="leave"`, (err, data) => {
		if (err) {
			console.error(err);
			  res.status(500).send('database error').end();
			} else{

			 res.render('./director/search/job_search.ejs',{data,nav_task_self:"ok"});   											 			
			}
			});								
  });	
	
//按任务搜 get
 router.get('/job_res', (req, res)=>{
	var p_number=req.query.project.split('-')[1] || '';
	var time_from=parseInt(req.query.time_from); 
	var time_to=parseInt(req.query.time_to); 										 
	var state= req.query.state;
	var name=req.query.name;
	var tuichi=req.query.tuichi;
	var bohui=req.query.bohui;
     if(isNaN(time_from)){
		 time_from=315504000000;
		time_to=32503651200000;
	 }
	 db.query(`SELECT  p_name,p_number  FROM  project ;\
					SELECT  *  FROM  eadmin WHERE type!="director";\
					SELECT * FROM task WHERE 1=1 and (p_number="${p_number}" OR "${p_number}"='') AND \ 
					(t_number>"${time_from}" AND t_number<"${time_to}") AND \ 
					(state="${state}" OR "${state}"='') AND \ 
					(account IN (SELECT username FROM eadmin WHERE name_zh="${name}" OR "${name}"='')) AND \  
					(state="${tuichi}" OR "${tuichi}"='') AND \ 
					(state="${bohui}" OR "${bohui}"='') `, (err, data) => {
		if (err) {
			console.error(err);
			  res.status(500).send('database error').end();
			} else{
			    //console.log(data); 	
			 	res.render('./director/search/job_search.ejs',{data,nav_task_self:"ok"});   							 			
			}
			});		
  });		
	
//创建任务-按任务搜
 router.get('/log', (req, res)=>{
	 res.render('./director/search/log_search.ejs',{nav_task_self:"ok"});   	
  });	 
	
  return router;
};
	 
 