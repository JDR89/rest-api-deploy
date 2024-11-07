const express = require("express");
const cors = require("cors");
const movies = require("./movies.json");
const crypto = require("node:crypto");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");



const app = express();
app.use(express.json());
app.disable("x-powered-by");

app.use(cors())

//Todos los recursos que sean MOVIES se indentifica con /movies
app.get("/movies", (req, res) => {
  res.header("Access-Control-Allow-Origin","*")

  const { genre } = req.query; // Se obtiene el parámetro 'genre' de la consulta
  if (genre) {
    const filteredMovies = movies.filter(movie => 
      movie.genre.some(g => g.trim().toLowerCase() === genre.trim().toLowerCase())
    );
    return res.json(filteredMovies); // Responde con las películas filtradas
  }
  res.json(movies); // Responde con todas las películas si no hay filtro
});

app.get("/movies/:id", (req, res) => {
    const {id} = req.params
    const movie = movies.find((movie) => movie.id === id);
    
    if(movie)return res.json(movie);
    return res.status(404).json({message: "Movie not found"})
})

app.post("/movies", (req, res) => {

  const result = validateMovie(req.body);

  if(!result.success) {
    return res.status(400).json(result.error);
  }
  
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  };

  // Guardamos la película en la memoria temporal
  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body)

  if(!result.success){return res.status(400).json({error:JSON.parse(result.error.message)})}

  const {id} = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if(movieIndex === -1) return res.status(404).json({message: "Movie not found"})

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }  

  movies[movieIndex] = updateMovie  

  return res.json(updateMovie)
  
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})


const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`server running on port http://localhost:${PORT}`);
})