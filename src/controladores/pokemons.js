const pool = require('../conexao')

const cadastrarPokemon = async (req, res) => {
    const { id } = req.usuario
    const { nome, habilidades, imagem, apelido } = req.body

    if (!nome || !habilidades) {
        return res.status(400).json({ mensagem: 'Os campos nome e habilidades são obrigatórios' })
    }

    try {
        const novoPokemon = await pool.query(
            `insert into pokemons (usuario_id, nome, habilidades, imagem, apelido) values ($1, $2, $3, $4, $5) returning *`,
            [id, nome, habilidades, imagem, apelido]
        )

        return res.status(201).json(novoPokemon.rows[0])
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }

}

const atualizarApelido = async (req, res) => {
    const { idPokemon } = req.params
    const { apelido } = req.body
    const { id } = req.usuario

    if (isNaN(Number(idPokemon))) {
        return res.status(400).json({ mensagem: 'O parametro id não é um numero valido' })
    }

    if (!apelido) {
        return res.status(400).json({ mensagem: 'O campo apelido é obrigatório' })
    }

    try {
        const pokemon = await pool.query('select * from pokemons where id = $1 and usuario_id = $2', [idPokemon, id])

        if (pokemon.rowCount < 1) {
            return res.status(404).json({ mensagem: 'Pokemon inexistente na sua coleção' })
        }

        await pool.query(
            'update pokemons set apelido = $1 where id = $2 and usuario_id = $3', [apelido, idPokemon, id]
        )

        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const listarPokemons = async (req, res) => {
    const { id, nome } = req.usuario

    try {
        const { rows } = await pool.query('select id, nome, habilidades, imagem, apelido from pokemons where usuario_id = $1', [id])

        const listaPokemons = rows.map(pokemon => {
            pokemon.usuario = nome
            pokemon.habilidades = pokemon.habilidades.split(', ')
            return pokemon
        })

        return res.json(listaPokemons)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const listarUmPokemon = async (req, res) => {
    const { id: idPokemon } = req.params
    const { id, nome } = req.usuario

    if (isNaN(Number(idPokemon))) {
        return res.status(400).json({ mensagem: 'O parametro id não é um numero valido' })
    }

    try {
        const { rowCount, rows } = await pool.query('select * from pokemons where id = $1 and usuario_id = $2', [idPokemon, id])

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Pokemon inexistente na sua coleção' })
        }

        const { nome: nomePokemon, habilidades, imagem, apelido } = rows[0]
        const listaHabilidades = habilidades.split(', ')

        const pokemon = {
            id: idPokemon,
            usuario: nome,
            nome: nomePokemon,
            apelido,
            habilidades: listaHabilidades,
            imagem
        }

        return res.json(pokemon)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }

}

const excluirPokemon = async (req, res) => {
    const { id: idPokemon } = req.params
    const { id } = req.usuario

    if (isNaN(Number(idPokemon))) {
        return res.status(400).json({ mensagem: 'O parametro id não é um numero valido' })
    }

    try {
        const { rowCount } = await pool.query('select * from pokemons where id = $1 and usuario_id = $2', [idPokemon, id])

        if (rowCount < 1) {
            return res.status(404).json({ mensagem: 'Pokemon inexistente na sua coleção' })
        }

        await pool.query('delete from pokemons where id = $1 and usuario_id = $2', [idPokemon, id])

        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

module.exports = { cadastrarPokemon, atualizarApelido, listarPokemons, listarUmPokemon, excluirPokemon }