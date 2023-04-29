const ErrorHandler = require("../utils/errorhandler");

module.exports= (err,req,res,next)=> {
    err.statusCode= err.statusCode || 500;
    err.message= err.message || "Internal Server Error";


    //  Wrong Mongodb Id error

    if(err.name==="CastError"){
        const message= `Resource not found. Invalid: ${err.path}`;
        err= new ErrorHandler(message, 400);
    }

    //  Mongoose Dublicate Key Error
    if (err.code===11000){
        const message= `Dublicate ${Object.keys(err.keyValue)} Entered`;
        err= new ErrorHandler(message, 400);

    }
    //  Wrong JSON Web Token

    if(err.name==="JsonWebTokenError"){
        const message= `JSON Web Token is invalid , try again`;
        err= new ErrorHandler(message, 400);
    }

    //  JSON Expire Error

    if(err.name==="TokenExpiredError"){
        const message= `JSON Web Token is Expired , try again`;
        err= new ErrorHandler(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message, 
    })
}