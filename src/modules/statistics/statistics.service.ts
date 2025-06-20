import { User } from '../users/user.model';
import { Payment } from '../payments/payment.model';
import { IOverallStatsResponse } from './statistics.interface';
import { Post } from '../posts/post.model';

const getOverallAppStats = async (): Promise<IOverallStatsResponse> => {
    const [
        totalUsers,
        totalAdmins,
        totalPosts,
        totalPremiumPosts,
        upvotesResult,
        downvotesResult,
        viewsResult,
        commentsResult,
        totalSuccessfulPayments,
    ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'admin' }),
        Post.countDocuments({}),
        Post.countDocuments({ isPremium: true }),
        Post.aggregate([{ $group: { _id: null, total: { $sum: '$upvotes' } } }]),
        Post.aggregate([{ $group: { _id: null, total: { $sum: '$downvotes' } } }]),
        Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
        Post.aggregate([{ $unwind: '$comments' }, { $count: 'totalComments' }]),
        Payment.find({ status: 'succeeded' }),
    ]);

    const totalRevenue = totalSuccessfulPayments.reduce((sum, p) => sum + p.amount, 0);

    const monthlyRevenue = await Payment.aggregate([
        { $match: { status: 'succeeded' } },
        {
            $group: {
                _id: {
                    year: { $year: '$paymentDate' },
                    month: { $month: '$paymentDate' },
                },
                totalAmount: { $sum: '$amount' },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                            { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                            { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                            { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                            { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                            { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                            { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                            { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                            { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                            { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                            { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                            { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
                        ],
                        default: 'Unknown',
                    },
                },
                amount: '$totalAmount',
            },
        },
    ]);

    return {
        totalUsers,
        totalAdmins,
        totalPosts,
        totalPremiumPosts,
        totalUpvotes: upvotesResult[0]?.total || 0,
        totalDownvotes: downvotesResult[0]?.total || 0,
        totalViews: viewsResult[0]?.total || 0,
        totalComments: commentsResult[0]?.totalComments || 0,
        totalRevenue,
        monthlyRevenue,
    };
};

export const statisticsServices = {
    getOverallAppStats,
};
