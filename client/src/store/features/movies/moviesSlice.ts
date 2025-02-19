import { createSelector, createSlice } from '@reduxjs/toolkit';
import { Filters } from '../../../components/filter/filterUtil';
import { Movie } from '../../../models/movie';
import { RootState } from '../../store';
import { getFilteredMovies, getMovieById, getMovieRatingById } from './movieThunks';

export interface LoadingState {
  pending: boolean;
  fetchMorePending?: boolean;
  rejected: boolean;
  resolved: boolean;
}

export const initialLoadingState: LoadingState = {
  pending: true,
  rejected: false,
  resolved: false,
};

interface MoviesState {
  movies: Movie[];
  moviesFetched: number;
  pageSize: number;
  currentMovie?: Movie;
  allFetched: boolean;
  filters: Filters;
  gridLoadingState: LoadingState;
  detailsLoadingState: LoadingState;
}

const initialMoviesState: MoviesState = {
  movies: [],
  moviesFetched: 0,
  pageSize: 12,
  allFetched: false,
  filters: {} as Filters,
  gridLoadingState: initialLoadingState,
  detailsLoadingState: initialLoadingState,
};

/**
 * A slice of the Redux store that manages the state related to movies.
 * @name movies
 * @type {Slice}
 */
export const moviesSlice = createSlice({
  name: 'movies',
  initialState: initialMoviesState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMovieById.fulfilled, (state, action) => {
        state.detailsLoadingState = { pending: false, rejected: false, resolved: true };
        if (action.payload) {
          state.currentMovie = action.payload;
        }
      })
      .addCase(getMovieById.pending, (state) => {
        state.detailsLoadingState = { pending: true, rejected: false, resolved: false };
      })
      .addCase(getMovieById.rejected, (state) => {
        state.detailsLoadingState = { pending: false, rejected: true, resolved: false };
      })
      .addCase(getFilteredMovies.fulfilled, (state, action) => {
        state.gridLoadingState = { pending: false, fetchMorePending: false, rejected: false, resolved: true };
        if (action.payload) {
          state.filters = action.meta.arg.filters;

          const fetchedMovies = action.payload;
          state.allFetched = fetchedMovies.length < state.pageSize;

          // Define custom merge strategy for the movies array
          // If the initial call is true, replace the movies array with the fetched movies
          // Otherwise, append the fetched movies to the existing movies array
          const isInitialCall = action.meta.arg.initial;
          if (isInitialCall) {
            state.movies = fetchedMovies;
            state.moviesFetched = action.payload.length;
          } else {
            const movies = [...state.movies, ...fetchedMovies];
            state.movies = movies;
            state.moviesFetched += action.payload.length;
          }
        }
      })
      .addCase(getFilteredMovies.pending, (state, action) => {
        state.gridLoadingState = {
          pending: true,
          fetchMorePending: !action.meta.arg.initial,
          rejected: false,
          resolved: false,
        };
      })
      .addCase(getFilteredMovies.rejected, (state) => {
        state.gridLoadingState = { pending: false, fetchMorePending: false, rejected: true, resolved: false };
      })
      .addCase(getMovieRatingById.fulfilled, (state, action) => {
        if (action.payload) {
          const rating = action.payload;
          state.currentMovie = { ...state.currentMovie!, rating };
        }
      });
  },
});

export const moviesReducer = moviesSlice.reducer;

export const selectMovies = (state: RootState) => state.movies.movies;

export const selectCurrentMovie = (state: RootState) => state.movies.currentMovie;

export const selectMovieById = (id: string) =>
  createSelector(selectMovies, (movies) => movies.find((movie) => movie.id === id));

export const selectPageSize = (state: RootState) => state.movies.pageSize;

export const selectAllFetched = (state: RootState) => state.movies.allFetched;

export const selectFilters = (state: RootState) => state.movies.filters;

export const selectGridLoadingState = (state: RootState) => state.movies.gridLoadingState;

export const selectDetailsLoadingState = (state: RootState) => state.movies.detailsLoadingState;
