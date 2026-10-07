'use strict';
const {DatabaseSync}=require('node:sqlite');
module.exports=class Database{
 constructor(file){this.handle=new DatabaseSync(file);}
 pragma(value){this.handle.exec('PRAGMA '+value);}
 exec(sql){this.handle.exec(sql);}
 prepare(sql){const statement=this.handle.prepare(sql);return{get:(...args)=>statement.get(...args),all:(...args)=>statement.all(...args),run:(...args)=>statement.run(...args)};}
 transaction(fn){return (...args)=>{this.handle.exec('BEGIN IMMEDIATE');try{const value=fn(...args);this.handle.exec('COMMIT');return value;}catch(error){this.handle.exec('ROLLBACK');throw error;}};}
 close(){this.handle.close();}
};
