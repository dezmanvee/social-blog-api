import { Earning } from "../models/Earning/Earning.js";
import Post from "../models/Post/Post.js";

//* Rate per view of a post
const RATE_PER_VIEW = 0.01 // 1 cent

const calculateEarnings = async() => {
    // Get the today's date
    const todaysDate = new Date()

    // Find all the posts and loop
    const posts = await Post.find()
    for (const post of posts) {
        // Count new unique viewers since the last calculation
        const newViewsCount = post.viewers.length - post.lastCalculatedViewsCount
        // Calculate earnings based on the number of new unique views
        const earning = newViewsCount * RATE_PER_VIEW
        // Update this month earnings and total earnings of post
        post.thisMonthEarnings = earning;
        post.totalEarnings += earning;
        // Create the earning records
        await Earning.create({
            amount: earning,
            user: post?.author,
            post: post?._id,
            calculatedOn: todaysDate

        })
        // Update the lastCalcualatedViewsCounts and nextEarningDate
        post.lastCalculatedViewsCount = post?.viewers?.length;
        post.nextEarningDate = new Date(todaysDate.getFullYear(), todaysDate.getMonth() + 1)
        // Save the post
        await post.save()
        
    }
    // Send response (log to console )
    console.log('Earning calcualated as', posts);
}

export default calculateEarnings;