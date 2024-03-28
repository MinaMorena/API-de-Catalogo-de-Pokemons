const pool = require('../conexao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Os campos nome, email e senha são obrigatórios' })
    }

    try {
        const { rows, rowCount } = await pool.query('select * from usuarios where email = $1', [email])

        if (rowCount > 0) {
            return res.status(400).json({ mensagem: 'Email já cadastrado' })
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10)

        const novoUsuario = await pool.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *',
            [nome, email, senhaCriptografada])

        return res.status(201).json(novoUsuario.rows[0])
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }

}

const loginUsuario = async (req, res) => {
    const { email, senha } = req.body

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Os campos email e senha são obrigatórios' })
    }

    try {
        const { rows, rowCount } = await pool.query('select * from usuarios where email = $1', [email])

        if (rowCount < 1) {
            return res.status(400).json({ mensagem: 'Email ou senha invalida' })
        }

        const { senha: senhaUsuario, ...usuario } = rows[0]

        const senhaValida = await bcrypt.compare(senha, senhaUsuario)

        if (!senhaValida) {
            return res.status(400).json({ mensagem: 'Email ou senha invalida' })
        }

        const token = await jwt.sign({ id: usuario.id }, 'senhaSeguraDemais', { expiresIn: '8h' })

        return res.json({ usuario, token })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

module.exports = { cadastrarUsuario, loginUsuario }