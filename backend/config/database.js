const mongoose= require("mongoose");

const connectDatabase=()=>{
    mongoose.connect(process.env.DB_URI).then((data)=>{
        console.log(`Mongodb connected with server`);
    })
}


module.exports=connectDatabase;





// const mongoose=require("mongoose");

// const connectDatabase=()=>{

// mongoose.connect(process.env.db).then((res)=>{
//     console.log("database is connected ");
// }).catch((err)=>{
//     console.log("not connected")
// })
// }
// mongoose.set('strictQuery', false);


// module.exports=connectDatabase;
