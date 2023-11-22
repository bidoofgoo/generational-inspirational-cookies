# General Info

_For detailed description see logbook.md._

Cookie Genetic Algorithm generator by:

PJ,
ArturJD,
bidogo

for Computational Creativity course by Rob Saunders, LIACS, Leiden University.

# System Requirements:

To run `algorithm.js`:
- Windows/MacOS
- NodeJS

To run Bart classifier:
- Python3

# Genetic algorithm instructions:
`algorithm.js` contains the folowing parameters:
- population.size           - The size that each population has per generation.
- population.generations    - The amount of generations for which it wil run.
- population.maxmutations   - The maximum amount of mutations per child after combination.

The algorithm saves the recipe information for the top 5 cookies from the final generation to the cookie_exports folder.