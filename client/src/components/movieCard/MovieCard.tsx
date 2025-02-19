import { useNavigate } from 'react-router-dom';
import { Movie } from '../../models/movie';
import { getYear } from '../../util/parseDate';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  scale?: number;
}

export const MovieCard = ({ movie, scale = 1 }: MovieCardProps) => {
  const navigate = useNavigate();

  const onMovieClick = () => {
    navigate(`/movies/${movie.id}`);
    window.scrollTo(0, 0);
  };

  const onMovieKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onMovieClick();
    }
  };

  return (
    <article className='movie-card-border'>
      <div
        onClick={onMovieClick}
        onKeyDown={onMovieKeyDown}
        role='button'
        aria-label={`View details for ${movie.title} - ${getYear(movie.releaseDate)}`}
        tabIndex={0}
        className='movie-card'
        style={{
          width: `${15 * scale}rem`,
          height: `${22.22 * scale}rem`,
        }}
      >
        <img
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          style={{
            width: `${15 * scale}rem`,
            height: `${22.22 * scale}rem`,
          }}
        />
        <div className='movie-card-image-overlay' role='presentation'>
          <div className='movie-info' aria-label={movie.title}>
            <h3 id={`movie-title-${movie.id}`}>{movie.title}</h3>
            <span>{getYear(movie.releaseDate)}</span>
          </div>
        </div>
      </div>
      <div className='sr-only' aria-hidden='true'>
        <div id={`movie-description-${movie.id}`}>
          <h3>{movie.title}</h3>
          <p>{movie.overview}</p>
        </div>
      </div>
    </article>
  );
};
