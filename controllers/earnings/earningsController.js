
import asyncHandler from "express-async-handler";
import { Earning } from "../../models/Earning/Earning.js";

const earningsController = {

  //! List earnings
  listAllEarnings: asyncHandler(async (req, res) => {
    let allEarnings = await Earning.aggregate([
      {
        $group: {
          _id: "$user",
          totalEarnings: {
            $sum: "$amount"
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $sort: {
          totalEarnings: -1
        }
      }
    ]);

    //* Add rank field to earning documents
    allEarnings = allEarnings.map((earning, idx) => {
      return {
        ...earning,
        rank: idx + 1
      }
    })
    res.json({
      status: "success",
      message: "Earnings fetched successfully",
      allEarnings,
    });
  }),
 
  //! Get all earnings of a user
  getMyEarnings: asyncHandler(async(req, res) => {
    const myEarnings = await Earning.find({user: req.user}).populate({
      path: 'post',
      populate: {
        path: 'author'
      }
    })
    res.json({myEarnings})
  })
};

export default earningsController;  
