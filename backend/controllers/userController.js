const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { findById } = require("../models/productModel");
// const cloudinary = require("cloudinary");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //   folder: "avatars",
  //   width: 150,
  //   crop: "scale",
  // });, 

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
      avatar: {
      public_id: "122dfsfdf",
      url: "dfdfdf",
    },
  });

  sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
console.log(isPasswordMatched);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//  Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not matched", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});


//  Get User Details

exports.getUserDetails= catchAsyncErrors(async(req,res, next) => {
  const user= await User.findById(req.user.id);
  
  res.status(200).json({
    success:true,
    user,
  })
})

//  update User Password
exports.updatePassword= catchAsyncErrors(async(req,res, next)=> {
  const user= await User.findById(req.user.id).select("+password");

  const isPasswordMatched= await user.comparePassword(req.body.oldPassword);

  if(!isPasswordMatched){
    return next(new ErrorHandler("Old Password is Incorrect", 400))
  };
  if(req.body.newPassword !== req.body.confirmPassword){
    return next(new ErrorHandler("Password does not mathed"), 400)
  };
  user.password= req.body.newPassword;
  await user.save();

  sendToken(user, 200, res)
})


//  Update  User Profile 

exports.updateProfile= catchAsyncErrors(async(req,res,next)=> {
  const newUserData={
    name:req.body.name,
    email:req.body.email,
  }

  //  We will add cloudiary later
  const user= await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators:true,
    useFindAndModify: false
  });
  res.status(200).json({
    success: true, 
  })
})

//  Get  all user (Admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  // console.log("🚀 ~ file: userController.js:205 ~ exports.getAllUser=catchAsyncErrors ~ getAllUser:", getAllUser)
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});



//  Get  Single user (Admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});


// Update  User Role -----Admin 

exports.updateUserRole= catchAsyncErrors(async(req,res,next)=> {
  const newUserData={
    name:req.body.name,
    email:req.body.email,
    role: req.body.role,
  }

  const user= await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators:true,
    useFindAndModify: false
  });
  res.status(200).json({
    success: true, 
    message: `User Updated Successfuly`,
  })
})

//  Delete User --------Admin

exports.deleteUser= catchAsyncErrors(async(req,res,next)=> {
  const user= await User.findById(req.params.id);

  if(!user){
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    )
  }
  // We will add cloudnary later
  await user.remove();

  res.status(200).json({
    success: true,
    message: `User Deleted Successfuly`,

  })

})

 