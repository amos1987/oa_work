const mysql=require('mysql');

module.exports={
     my_sql: function (){
	//连接池
	const db=mysql.createConnection({host:'rdsg5z8yzvfqconhuvu1aso.mysql.rds.aliyuncs.com', port: 3306,user: 'oa_msq', password: '@Chenzhenchon1g', database: 'oa', multipleStatements: true}); 
    return db;	 
		 
	 }
};
