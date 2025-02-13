
import dotenv from "dotenv"
import { connectDB } from "./db/index.js";
import { app } from "./app.js"
dotenv.config({path: './.env'})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.error("DB connection failed!", err)
})

// app.get('/', (req,res)=>{
//     res.send("hello welcome")
// })

//Database Connection:
//use iife-
/*
const app = express()

( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error",(error)=>{
            console.log("Express app couldn't connect with db", error)
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App listening on ${process.env.PORT}`)
        })
        
    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
} )() 
*/