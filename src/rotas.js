const express = require('express')
const { cadastrarUsuario, loginUsuario } = require('./controladores/usuarios')
const verificarUsuarioLogado = require('./intermediarios/autenticacao')
const { cadastrarPokemon, atualizarApelido, listarPokemons, listarUmPokemon, excluirPokemon } = require('./controladores/pokemons')
const rotas = express()

rotas.post('/usuarios', cadastrarUsuario)
rotas.post('/login', loginUsuario)

rotas.use(verificarUsuarioLogado)

rotas.post('/pokemons', cadastrarPokemon)
rotas.patch('/pokemons/:idPokemon', atualizarApelido)
rotas.get('/pokemons', listarPokemons)
rotas.get('/pokemons/:id', listarUmPokemon)
rotas.delete('/pokemons/:id', excluirPokemon)

module.exports = rotas