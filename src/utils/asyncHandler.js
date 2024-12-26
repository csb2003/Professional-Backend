// this code basically sepereates the async-await and promises wrapper from the main database connection code (in ./db/index.js). Thus acting as a middleware 

//about 'next' parameter : 



// db connection can be in two ways: 1) try-catch method, 2) promises method

// 1)  async handler for Promises method : 
// const asyncHandler = (requestHandler) => {

//     Promise.resolve(requestHandler(req,res, next))
//     .reject((err)=>{
//         next(err)
//     })

// }



// skeleton of this type of Higher order functions (that accepts other functions as parameters):

// const asyncHandler = ()=> {}   //basic callback function
// const asyncHandler = (func) => {async()=>{}}  // func passed as a param, and another  async function in body is defined
// const asyncHandler = (func) => async() => {}    //brackets removed


//2) async handler for try-catch method
const asyncHandler = (func) =>async (req,res,next)=>{
    try {
        await func(req,res,next) 
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}




export { asyncHandler }