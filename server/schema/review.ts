import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { movieService } from '../services/MovieService';
import { reviewService } from '../services/ReviewService';

import {
  MutateCreateReviewData,
  MutateDeleteReviewData,
  MutateDeleteVoteReviewData,
  MutateVoteReviewData,
  QueryReviewArgs,
  Review,
} from '../types/reviewType';

/**
 * Represents the typeDefs for reviews.
 */
const Vote = new GraphQLObjectType({
  name: 'Vote',
  fields: () => ({
    vote: { type: GraphQLBoolean },
    user: { type: GraphQLString },
  }),
});

const ReviewMetaType = new GraphQLObjectType({
  name: 'ReviewMeta',
  fields: () => ({
    authorEmail: { type: GraphQLString },
    authorName: { type: GraphQLString },
    movieId: { type: GraphQLString },
    movieTitle: { type: GraphQLString },
    votesLength: { type: GraphQLInt },
  }),
});

const ReviewType = new GraphQLObjectType({
  name: 'Review',
  fields: () => ({
    id: { type: GraphQLID },
    rating: { type: GraphQLInt },
    comment: { type: GraphQLString },
    votes: { type: new GraphQLList(Vote) },
    date: { type: GraphQLString },
    meta: {
      type: ReviewMetaType,
    },
  }),
});

/**
 * Represents a collection of GraphQL queries for retrieving reviews.
 */
const ReviewQuery = {
  GetAllReviews: {
    type: new GraphQLList(ReviewType),
    async resolve(): Promise<Review[]> {
      return (await reviewService.getAllReviews()).map((review) => review.toObject()) as Review[];
    },
  },
  GetReviewById: {
    type: ReviewType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    async resolve(parent: any, args: QueryReviewArgs) {
      return await reviewService.getReviewById(args.id);
    },
  },
  GetReviewsByMovieId: {
    type: new GraphQLList(ReviewType),
    args: { movieId: { type: new GraphQLNonNull(GraphQLID) } },
    async resolve(parent: any, args: QueryReviewArgs) {
      const result = await reviewService.getReviewsByMovieId(args.movieId);
      return result;
    },
  },
  GetReviewByAuthorAndMovieId: {
    type: ReviewType,
    args: {
      movieId: { type: new GraphQLNonNull(GraphQLID) },
      authorEmail: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve(parent: any, args: QueryReviewArgs) {
      return reviewService.getReviewByAuthorAndMovieId(args.movieId, args.authorEmail);
    },
  },
  GetRecentReviews: {
    type: new GraphQLList(ReviewType),
    args: { limit: { type: GraphQLInt } },
    async resolve(parent: any, args: QueryReviewArgs) {
      return await reviewService.getRecentReviews(args.limit);
    },
  },
  GetPopularReviews: {
    type: new GraphQLList(ReviewType),
    args: { limit: { type: GraphQLInt } },
    async resolve(parent: any, args: QueryReviewArgs) {
      const res = await reviewService.getPopularReviews(args.limit);
      return res;
    },
  },
};

/**
 * Update movierating upon new or deleted review on movie.
 */
const UpdateMovieRating = async (movieId: string) => {
  const reviews = (await reviewService.getReviewsByMovieId(movieId)).map((review) => review.toObject()) as Review[];
  await movieService.updateMovieRating(movieId, reviews);
};

/**
 * Represents the mutation operations for reviews.
 */
const ReviewMutation = {
  CreateReview: {
    type: ReviewType,
    args: {
      rating: { type: new GraphQLNonNull(GraphQLInt) },
      comment: { type: new GraphQLNonNull(GraphQLString) },
      authorEmail: { type: new GraphQLNonNull(GraphQLString) },
      movieId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent: any, args: MutateCreateReviewData) {
      const reviewData = {
        rating: args.rating,
        comment: args.comment,
        votes: [],
        meta: {
          authorEmail: args.authorEmail,
          movieId: args.movieId,
        },
      };
      const newReview = await reviewService.createReview(reviewData);
      await UpdateMovieRating(args.movieId);
      return newReview;
    },
  },
  VoteReview: {
    type: ReviewType,
    args: {
      authorEmail: { type: new GraphQLNonNull(GraphQLString) },
      reviewId: { type: new GraphQLNonNull(GraphQLID) },
      vote: { type: new GraphQLNonNull(GraphQLBoolean) },
    },
    async resolve(parent: any, args: MutateVoteReviewData) {
      return await reviewService.voteReview(args.authorEmail, args.reviewId, args.vote);
    },
  },
  DeleteVoteReview: {
    type: ReviewType,
    args: {
      authorEmail: { type: new GraphQLNonNull(GraphQLString) },
      reviewId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent: any, args: MutateDeleteVoteReviewData) {
      return await reviewService.deleteVoteReview(args.authorEmail, args.reviewId);
    },
  },
  DeleteReview: {
    type: ReviewType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    async resolve(parent: any, args: MutateDeleteReviewData) {
      const deletedReview = await reviewService.deleteReview(args.id);
      if (!deletedReview) {
        throw new Error(`Review with id ${args.id} not found`);
      }
      if (!deletedReview.meta) {
        throw new Error(`Meta data for review with id ${args.id} not found`);
      }
      await UpdateMovieRating(deletedReview.meta.movieId);
      return deletedReview;
    },
  },
};

const typeDefs = { Vote, ReviewMetaType, ReviewType };

export default { query: ReviewQuery, mutation: ReviewMutation, typeDefs };
