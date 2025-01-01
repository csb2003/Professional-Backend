// this code basically sepereates the async-await and promises wrapper from the main database connection code (in ./db/index.js). Thus acting as a middleware 

//about 'next' parameter : 



// db connection can be in two ways: 1) try-catch method, 2) promises method

// 1)  async handler for Promises method : 
// const asyncHandler = (requestHandler) => {
//     return (req,res,next) =>{
//         Promise.resolve(requestHandler(req,res, next))
//         .reject((err)=>{next(err)})
//     }
    
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
        let statusCode = error.statusCode || error.code || 500;
        if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
            statusCode = 500; // Default to Internal Server Error
        }
        res.status(statusCode).json({
            success: false,
            message: error.message
        })
    }
}

export { asyncHandler }