import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ReviewCard } from '../../../components/reviewCard/ReviewCard';
import { useUser } from '../../../hooks/useUser';
import { Review } from '../../../models/review';
import {
  addVoteOnReview,
  deleteReviewOnMovie,
  deleteVoteOnReview,
  getPopularReviews,
  getRecentReviews,
} from '../../../store/features/reviews/reviewThunks';
import { selectPopularReviews, selectRecentReviews } from '../../../store/features/reviews/reviewsSlice';
import { useAppDispatch } from '../../../store/store';
import customToast from '../../../util/toastWrapper';

export const FeedReviewSection = () => {
  const limit = 3;
  const dispatch = useAppDispatch();
  const user = useUser();

  const recentReviews = useSelector(selectRecentReviews());
  const popularReviews = useSelector(selectPopularReviews());

  useEffect(() => {
    dispatch(getRecentReviews({ limit: limit }));
    dispatch(getPopularReviews({ limit: limit }));
  }, [dispatch, limit]);

  const canDelete = useCallback(
    (review: Review) => {
      if (!user) {
        return false;
      }

      return review.meta.authorEmail === user.email;
    },
    [user]
  );

  const onReviewDelete = useCallback(
    (review: Review) => {
      if (!canDelete(review)) return;
      dispatch(deleteReviewOnMovie({ movieId: review.meta.movieId, id: review.id }))
        .unwrap()
        .then(() => {
          customToast.success('Review deleted!');
          dispatch(getRecentReviews({ limit: limit }));
          dispatch(getPopularReviews({ limit: limit }));
        });
    },
    [dispatch, canDelete]
  );

  const onVote = useCallback(
    (review: Review) => {
      if (!user) {
        customToast.error('You must be logged in to vote');
        return;
      }

      if (review.votes.includes({ vote: true, user: user.email })) {
        customToast.error('You have already voted on this review');
        return;
      }

      dispatch(
        addVoteOnReview({
          vote: true,
          reviewId: review.id,
          authorEmail: user.email,
        })
      )
        .unwrap()
        .then(() => {
          customToast.success('Vote added!');
          dispatch(getRecentReviews({ limit: limit }));
          dispatch(getPopularReviews({ limit: limit }));
        });
    },
    [dispatch, user]
  );

  const onDeleteVote = useCallback(
    (review: Review) => {
      if (!user) {
        customToast.error('You must be logged in to vote');
        return;
      }

      if (!(review.votes.filter((vote) => vote.user === user.email).length > 0)) {
        customToast.error('You have not voted on this review');
        return;
      }

      dispatch(
        deleteVoteOnReview({
          reviewId: review.id,
          authorEmail: user.email,
        })
      )
        .unwrap()
        .then(() => {
          customToast.success('Vote removed!');
          dispatch(getRecentReviews({ limit: limit }));
          dispatch(getPopularReviews({ limit: limit }));
        });
    },
    [dispatch, user]
  );

  return (
    <>
      <section aria-label='Popular reviews' className='movie-info-reviews'>
        <h2 className='reviews-title'>Popular reviews</h2>
        {popularReviews &&
          popularReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={() => onReviewDelete(review)}
              canDelete={canDelete(review)}
              onVote={() => onVote(review)}
              canVote={!!user && !(review.votes.filter((vote) => vote.user === user.email).length > 0)}
              onDeleteVote={() => onDeleteVote(review)}
              isLoggedIn={!!user}
              isFeed={true}
            />
          ))}
      </section>
      <section aria-label='Recent reviews' className='movie-info-reviews'>
        <h2 className='reviews-title'>Recent reviews</h2>
        {recentReviews &&
          recentReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={() => onReviewDelete(review)}
              canDelete={canDelete(review)}
              onVote={() => onVote(review)}
              canVote={!!user && !(review.votes.filter((vote) => vote.user === user.email).length > 0)}
              onDeleteVote={() => onDeleteVote(review)}
              isLoggedIn={!!user}
              isFeed={true}
            />
          ))}
      </section>
    </>
  );
};